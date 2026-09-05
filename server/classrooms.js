import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { ClassroomError, requireText, validateAssignment, assignmentForStudent, gradeAssignment, summarizeAttempts } from './classroomDomain.js';

const digest = code => createHash('sha256').update(code).digest('hex');
const teacherRole = role => role === 'teacher' || role === 'admin';
const invitationCode = () => randomBytes(6).toString('hex').toUpperCase();
const notFound = () => { throw new ClassroomError('This class or assignment is not available to your account.', 404, 'not_found'); };
const classSummary = (row, owner = false) => ({ id: row._id, name: row.name, createdAt: row.createdAt, collectionId: row.collectionId || null, studentCount: row.memberIds.length, ...(owner ? { invitationCode: row.invitationCode } : {}) });

export function createClassroomRouter({ getDb, requireAuth, createSessionToken, publicUser }) {
  const app = new Hono();
  let indexes;
  const database = async () => {
    const db = await getDb();
    if (!indexes) indexes = Promise.all([
      db.classes.createIndex({ invitationCode: 1 }, { unique: true }),
      db.classes.createIndex({ ownerId: 1 }),
      db.classes.createIndex({ memberIds: 1 }),
      db.assignments.createIndex({ classId: 1, createdAt: -1 }),
      db.submissions.createIndex({ classId: 1, studentId: 1 }),
      db.teacherInvites.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.classroomLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    ]).catch(error => { indexes = null; throw error; });
    await indexes;
    return db;
  };
  app.onError((error, c) => {
    if (error instanceof ClassroomError) return c.json({ success: false, error: error.message, code: error.code }, error.status);
    console.error('[Classrooms]', error);
    return c.json({ success: false, error: 'Unable to complete this request. Please try again.', code: 'unavailable' }, 503);
  });
  app.use('*', bodyLimit({ maxSize: 100000, onError: c => c.json({ success: false, error: 'Request is too large.', code: 'invalid_input' }, 413) }));
  app.use('*', requireAuth);
  app.use('*', async (c, next) => {
    const session = c.get('user');
    if (!session?.userId || !ObjectId.isValid(session.userId)) return c.json({ success: false, error: 'Please sign in again.', code: 'session_expired' }, 401);
    const db = await database();
    const account = await db.users.findOne({ _id: new ObjectId(session.userId) });
    if (!account || (account.tokenVersion || 0) !== (session.tokenVersion || 0)) return c.json({ success: false, error: 'Please sign in again.', code: 'session_expired' }, 401);
    c.set('account', account); c.set('db', db);
    await next();
  });
  // Shared MongoDB counters work across serverless instances; authentication
  // is required, so requests never trust a browser-supplied forwarding address.
  const limit = (operation, maximum, windowMs = 15 * 60 * 1000) => async (c, next) => {
    const now = Date.now();
    const collection = c.get('db').classroomLimits;
    const _id = `${c.get('user').userId}:${operation}:${Math.floor(now / windowMs)}`;
    try { await collection.updateOne({ _id }, { $setOnInsert: { count: 0, expiresAt: new Date(now + windowMs * 2) } }, { upsert: true }); } catch (e) { if (e.code !== 11000) throw e; }
    const result = await collection.updateOne({ _id, count: { $lt: maximum } }, { $inc: { count: 1 } });
    if (!result.modifiedCount) { c.header('Retry-After', String(Math.ceil(windowMs / 1000))); throw new ClassroomError('Too many requests. Please try again later.', 429, 'rate_limited'); }
    await next();
  };
  app.use('*', limit('requests', 120, 60000));
  const readBody = async c => {
    try { const body = await c.req.json(); if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error(); return body; }
    catch { throw new ClassroomError('Please send a valid request.'); }
  };
  const requireTeacher = async (c, next) => {
    if (!teacherRole(c.get('account').role)) throw new ClassroomError('Verify your teacher account first.', 403, 'teacher_required');
    await next();
  };
  const findClass = async (c, id, ownerOnly = false) => {
    const userId = c.get('user').userId;
    const row = await c.get('db').classes.findOne({ _id: id });
    if (!row) return notFound();
    const owner = row.ownerId === userId && teacherRole(c.get('account').role);
    if (ownerOnly ? !owner : !owner && !row.memberIds.includes(userId)) return notFound();
    return { row, owner };
  };

  app.post('/teacher/invitations', limit('teacher-invites', 10), async c => {
    if (c.get('account').role !== 'admin') throw new ClassroomError('Only an administrator can issue teacher codes.', 403, 'admin_required');
    const code = randomBytes(18).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    await c.get('db').teacherInvites.insertOne({ _id: digest(code), createdBy: c.get('user').userId, usedBy: null, expiresAt });
    return c.json({ success: true, code, expiresAt }, 201);
  });

  app.post('/teacher/verify', limit('teacher-verify', 6), async c => {
    const account = c.get('account');
    if (teacherRole(account.role)) return c.json({ success: true, user: publicUser(account), token: await createSessionToken(account) });
    const { code } = await readBody(c);
    if (typeof code !== 'string' || !code.trim() || code.length > 128) throw new ClassroomError('Enter a valid teacher code.', 400, 'invalid_teacher_code');
    const cleanCode = code.trim();
    const configured = process.env.TEACHER_VERIFICATION_CODE?.trim();
    const configuredMatch = configured && configured.length >= 16 && timingSafeEqual(Buffer.from(digest(configured)), Buffer.from(digest(cleanCode)));
    if (!configuredMatch) {
      const invites = c.get('db').teacherInvites;
      const key = digest(cleanCode);
      const used = await invites.updateOne({ _id: key, usedBy: null, expiresAt: { $gt: new Date() } }, { $set: { usedBy: c.get('user').userId } });
      // A retry from the same account can finish an interrupted role update.
      if (!used.modifiedCount && !await invites.findOne({ _id: key, usedBy: c.get('user').userId, expiresAt: { $gt: new Date() } })) throw new ClassroomError('The teacher code is invalid, expired, or already used.', 400, 'invalid_teacher_code');
    }
    await c.get('db').users.updateOne({ _id: account._id, role: 'student' }, { $set: { role: 'teacher', teacherVerifiedAt: new Date() } });
    const fresh = await c.get('db').users.findOne({ _id: account._id });
    return c.json({ success: true, user: publicUser(fresh), token: await createSessionToken(fresh) });
  });

  app.get('/classes', async c => {
    const owner = teacherRole(c.get('account').role);
    const rows = await c.get('db').classes.find(owner ? { ownerId: c.get('user').userId } : { memberIds: c.get('user').userId }).sort({ createdAt: -1 }).limit(100).toArray();
    return c.json({ success: true, role: c.get('account').role, classes: rows.map(row => classSummary(row, owner)) });
  });
  app.post('/classes', requireTeacher, limit('create-class', 10), async c => {
    const { name, collectionId } = await readBody(c);
    const ownerId = c.get('user').userId;
    const classes = c.get('db').classes;
    if (await classes.countDocuments({ ownerId }) >= 50) throw new ClassroomError('You have reached the class limit.');
    if (collectionId !== undefined && (typeof collectionId !== 'string' || !await c.get('db').lessonCollections.findOne({ _id: collectionId }))) throw new ClassroomError('Choose an available lesson collection.');
    const row = { _id: randomUUID(), ownerId, name: requireText(name, 'class name', 80), ...(collectionId ? { collectionId, lessonRevision: 0 } : {}), memberIds: [], members: [], assignmentCount: 0, invitationCode: invitationCode(), createdAt: new Date() };
    await classes.insertOne(row);
    return c.json({ success: true, class: classSummary(row, true) }, 201);
  });
  app.post('/classes/join', limit('join-class', 10), async c => {
    if (c.get('account').role !== 'student') throw new ClassroomError('Use a student account to join a class.', 403, 'student_required');
    const body = await readBody(c);
    const code = requireText(body.code, 'class code', 30).replace(/[\s-]/g, '').toUpperCase();
    const name = requireText(body.displayName, 'student name', 40);
    const { classes } = c.get('db');
    const row = await classes.findOne({ invitationCode: code }); if (!row) return notFound();
    const userId = c.get('user').userId;
    if (row.memberIds.includes(userId)) return c.json({ success: true, class: classSummary(row) });
    if (await classes.countDocuments({ memberIds: userId }) >= 20) throw new ClassroomError('You have reached the class limit.');
    const result = await classes.updateOne({ _id: row._id, invitationCode: code, memberIds: { $ne: userId }, 'memberIds.199': { $exists: false } }, { $addToSet: { memberIds: userId }, $push: { members: { id: userId, name, joinedAt: new Date() } } });
    const fresh = await classes.findOne({ _id: row._id });
    if (!result.modifiedCount && !fresh.memberIds.includes(userId)) throw new ClassroomError('This class is full or its invitation code changed.', 409, 'class_changed');
    return c.json({ success: true, class: classSummary(fresh) });
  });
  app.post('/classes/:id/invitation', requireTeacher, limit('rotate-code', 10), async c => {
    const { row } = await findClass(c, c.req.param('id'), true);
    const code = invitationCode();
    await c.get('db').classes.updateOne({ _id: row._id }, { $set: { invitationCode: code } });
    return c.json({ success: true, invitationCode: code });
  });
  app.get('/classes/:id', async c => {
    const { row, owner } = await findClass(c, c.req.param('id'));
    const { assignments, submissions } = c.get('db');
    const all = await assignments.find({ classId: row._id }).sort({ createdAt: -1 }).limit(100).toArray();
    const ownResults = owner ? [] : await submissions.find({ classId: row._id, studentId: c.get('user').userId }).toArray();
    return c.json({ success: true, class: classSummary(row, owner), isOwner: owner,
      ...(owner ? { students: row.members.map(({ id, name, joinedAt }) => ({ id, name, joinedAt })) } : {}),
      assignments: all.map(a => ({ id: a._id, title: a.title, subject: a.subject, level: a.level, maxAttempts: a.maxAttempts, questionCount: a.questions.length, createdAt: a.createdAt,
        ...(!owner ? { progress: summarizeAttempts(ownResults.find(s => s.assignmentId === a._id)?.attempts) } : {}) })) });
  });
  app.post('/classes/:id/assignments', requireTeacher, limit('publish-assignment', 15), async c => {
    const { row } = await findClass(c, c.req.param('id'), true);
    const assignment = validateAssignment(await readBody(c));
    const db = c.get('db');
    const reserved = await db.classes.updateOne({ _id: row._id, assignmentCount: { $lt: 100 } }, { $inc: { assignmentCount: 1 } });
    if (!reserved.modifiedCount) throw new ClassroomError('This class has reached 100 assignments.');
    const record = { ...assignment, _id: randomUUID(), classId: row._id, createdAt: new Date() };
    try { await db.assignments.insertOne(record); }
    catch (error) {
      // If Mongo acknowledged a timeout after writing, do not undo the slot
      // or report a failed publication for an assignment that already exists.
      const saved = await db.assignments.findOne({ _id: record._id });
      if (!saved) {
        await db.classes.updateOne({ _id: row._id }, { $inc: { assignmentCount: -1 } });
        throw error;
      }
    }
    return c.json({ success: true, assignment: { id: record._id, title: record.title } }, 201);
  });
  const findAssignment = async c => {
    const assignment = await c.get('db').assignments.findOne({ _id: c.req.param('id') });
    if (!assignment) return notFound();
    const access = await findClass(c, assignment.classId);
    return { assignment, ...access };
  };
  app.get('/assignments/:id', async c => {
    const { assignment, owner } = await findAssignment(c);
    const submission = owner ? null : await c.get('db').submissions.findOne({ _id: `${assignment._id}:${c.get('user').userId}` });
    const attempts = submission?.attempts || [];
    const safeAssignment = assignmentForStudent(assignment);
    return c.json({ success: true, assignment: safeAssignment, attempts,
      ...(owner || attempts.length ? { review: assignment.questions.map(({ id, prompt, options, correctOptionId, explanation }) => ({ id, prompt, options, correctOptionId, explanation })) } : {}) });
  });
  app.post('/assignments/:id/submit', limit('submit-assignment', 30), async c => {
    const { assignment, owner } = await findAssignment(c);
    if (owner || c.get('account').role !== 'student') throw new ClassroomError('Only enrolled students can submit assignments.', 403, 'student_required');
    const body = await readBody(c);
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9_-]{12,80}$/.test(body.requestId)) throw new ClassroomError('Invalid submission request.');
    const studentId = c.get('user').userId;
    const _id = `${assignment._id}:${studentId}`;
    const { submissions } = c.get('db');
    const savedResponse = attempt => c.json({ success: true, attempt, review: assignment.questions.map(({ id, explanation }) => ({ id, explanation })) });
    const existing = await submissions.findOne({ _id });
    const prior = existing?.attempts.find(a => a.requestId === body.requestId);
    if (prior) return savedResponse(prior);
    const attempt = { ...gradeAssignment(assignment, body.answers), requestId: body.requestId, submittedAt: new Date() };
    try { await submissions.updateOne({ _id }, { $setOnInsert: { classId: assignment.classId, assignmentId: assignment._id, studentId, attempts: [] } }, { upsert: true }); } catch (e) { if (e.code !== 11000) throw e; }
    const added = await submissions.updateOne({ _id, [`attempts.${assignment.maxAttempts - 1}`]: { $exists: false }, 'attempts.requestId': { $ne: body.requestId } }, { $push: { attempts: attempt } });
    if (!added.modifiedCount) {
      const concurrent = await submissions.findOne({ _id });
      const replay = concurrent?.attempts.find(a => a.requestId === body.requestId);
      if (replay) return savedResponse(replay);
      throw new ClassroomError('You have used all attempts for this assignment.', 409, 'attempt_limit');
    }
    return savedResponse(attempt);
  });

  app.get('/classes/:id/report', requireTeacher, async c => {
    const { row } = await findClass(c, c.req.param('id'), true);
    const db = c.get('db');
    const [assignments, submissions, accounts] = await Promise.all([
      db.assignments.find({ classId: row._id }, { projection: { title: 1, subject: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(100).toArray(),
      db.submissions.find({ classId: row._id }, { projection: { studentId: 1, assignmentId: 1, 'attempts.score': 1, 'attempts.total': 1, 'attempts.submittedAt': 1 } }).toArray(),
      db.users.find({ _id: { $in: row.memberIds.map(id => new ObjectId(id)) } }, { projection: { completedReading: 1, completedWriting: 1, completedSpeaking: 1, completedGrammar: 1, masteredVocab: 1 } }).toArray()
    ]);
    const students = row.members.map(member => {
      const own = submissions.filter(s => s.studentId === member.id && s.attempts.length);
      const account = accounts.find(a => String(a._id) === member.id);
      const results = assignments.map(a => summarizeAttempts(own.find(s => s.assignmentId === a._id)?.attempts));
      const completed = results.filter(r => r.count);
      return { id: member.id, name: member.name, completed: completed.length, assigned: assignments.length,
        averagePercent: completed.length ? Math.round(completed.reduce((sum, r) => sum + r.latest.score / r.latest.total * 100, 0) / completed.length) : null,
        practice: Object.fromEntries(['masteredVocab', 'completedGrammar', 'completedReading', 'completedWriting', 'completedSpeaking'].map(key => [key, Array.isArray(account?.[key]) ? account[key].length : 0])) };
    });
    return c.json({ success: true, class: classSummary(row, true), students,
      assignments: assignments.map(({ _id, title, subject }) => ({ id: _id, title, subject })) });
  });
  // Load details one student, then one assignment at a time. A full class's
  // answer history is deliberately never included in an overview response.
  app.get('/classes/:id/students/:studentId/results', requireTeacher, async c => {
    const { row } = await findClass(c, c.req.param('id'), true);
    const studentId = c.req.param('studentId');
    if (!row.memberIds.includes(studentId)) return notFound();
    const db = c.get('db');
    const [assignments, submissions] = await Promise.all([
      db.assignments.find({ classId: row._id }, { projection: { _id: 1 } }).limit(100).toArray(),
      db.submissions.find({ classId: row._id, studentId }, { projection: { assignmentId: 1, 'attempts.score': 1, 'attempts.total': 1, 'attempts.submittedAt': 1 } }).toArray()
    ]);
    return c.json({ success: true, results: assignments.map(a => ({ assignmentId: a._id, ...summarizeAttempts(submissions.find(s => s.assignmentId === a._id)?.attempts) })) });
  });
  app.get('/assignments/:id/students/:studentId', requireTeacher, async c => {
    const { assignment, row, owner } = await findAssignment(c);
    const studentId = c.req.param('studentId');
    if (!owner || !row.memberIds.includes(studentId)) return notFound();
    const submission = await c.get('db').submissions.findOne({ _id: `${assignment._id}:${studentId}` });
    return c.json({ success: true, assignment: { id: assignment._id, title: assignment.title, passage: assignment.passage, questions: assignment.questions }, attempts: submission?.attempts || [] });
  });
  return app;
}
