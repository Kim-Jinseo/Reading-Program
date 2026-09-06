import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { ClassroomError, requireText, gradeAssignment } from './classroomDomain.js';
import {
  PARTS,
  validateCollection,
  validateLesson,
  safeLesson,
  lessonSummary,
  publicParts,
  studyDays28,
  decodeImage,
  decodeAudio,
} from './lessonDomain.js';

const missing = () => {
  throw new ClassroomError('This lesson is not available to your account.', 404, 'not_found');
};
const changed = () => {
  throw new ClassroomError(
    'The class lessons changed. Return to your class and open the current lesson.',
    409,
    'lessons_changed',
  );
};
const brief = (row) => ({ id: row._id, title: row.title, titleZh: row.titleZh, number: row.number, level: row.level });
export function createLessonRouter({ getDb, requireAuth, evaluateSpeech, seed = true }) {
  const app = new Hono();
  let ready;
  app.onError((e, c) => {
    if (e instanceof ClassroomError) return c.json({ success: false, error: e.message, code: e.code }, e.status);
    console.error('[Lessons]', e);
    return c.json(
      { success: false, error: 'Unable to complete this request. Please try again.', code: 'unavailable' },
      503,
    );
  });
  app.use(
    '*',
    bodyLimit({
      maxSize: 2100000,
      onError: (c) => c.json({ success: false, error: 'This upload is too large.', code: 'invalid_input' }, 413),
    }),
  );
  app.use('*', requireAuth);
  app.use('*', async (c, next) => {
    const session = c.get('user');
    if (!session?.userId || !ObjectId.isValid(session.userId))
      return c.json({ success: false, code: 'session_expired' }, 401);
    const db = await getDb();
    const account = await db.users.findOne({ _id: new ObjectId(session.userId) });
    if (!account || (account.tokenVersion || 0) !== (session.tokenVersion || 0))
      return c.json({ success: false, code: 'session_expired' }, 401);
    if (!ready)
      ready = (async () => {
        await Promise.all([
          db.lessonCollections.createIndex({ season: 1, year: 1, level: 1 }, { unique: true }),
          db.lessons.createIndex({ collectionId: 1, number: 1 }, { unique: true }),
          db.lessonParts.createIndex({ classId: 1, studentId: 1, lessonId: 1 }),
          db.lessonAssets.createIndex({ lessonId: 1 }),
          db.classroomLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        ]);
        if (seed) {
          const { sampleCollection, sampleLesson, sampleAssets } = await import('./sampleLesson.js');
          await db.lessonCollections.updateOne(
            { _id: sampleCollection._id },
            { $setOnInsert: sampleCollection },
            { upsert: true },
          );
          for (const asset of sampleAssets)
            await db.lessonAssets.updateOne(
              { _id: asset._id },
              { $setOnInsert: { ...asset, lessonId: sampleLesson._id } },
              { upsert: true },
            );
          await db.lessons.updateOne(
            { _id: sampleLesson._id },
            { $setOnInsert: { ...sampleLesson, published: true, createdAt: new Date(), publishedAt: new Date() } },
            { upsert: true },
          );
        }
      })().catch((e) => {
        ready = null;
        throw e;
      });
    await ready;
    c.set('db', db);
    c.set('account', account);
    const _id = `${session.userId}:lessons:${Math.floor(Date.now() / 60000)}`;
    try {
      await db.classroomLimits.updateOne(
        { _id },
        { $setOnInsert: { count: 0, expiresAt: new Date(Date.now() + 120000) } },
        { upsert: true },
      );
    } catch (e) {
      if (e.code !== 11000) throw e;
    }
    const accepted = await db.classroomLimits.updateOne({ _id, count: { $lt: 180 } }, { $inc: { count: 1 } });
    if (!accepted.modifiedCount)
      throw new ClassroomError('Please wait a minute before trying again.', 429, 'rate_limited');
    c.header('Cache-Control', 'private, no-store');
    c.header('X-Content-Type-Options', 'nosniff');
    await next();
  });
  const body = async (c) => {
    try {
      const value = await c.req.json();
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
      return value;
    } catch {
      throw new ClassroomError('Send a valid request.');
    }
  };
  const admin = async (c, next) => {
    if (c.get('account').role !== 'admin')
      throw new ClassroomError('Only the administrator can upload or publish lessons.', 403, 'admin_required');
    await next();
  };
  app.use('/admin/*', admin);
  const classAccess = async (c, ownerOnly = false) => {
    const row = await c.get('db').classes.findOne({ _id: c.req.param('classId') });
    const id = c.get('user').userId,
      owner = row?.ownerId === id && ['teacher', 'admin'].includes(c.get('account').role);
    if (!row || (ownerOnly ? !owner : !owner && !row.memberIds.includes(id))) return missing();
    return { row, owner, id };
  };
  const lessonAccess = async (c) => {
    const access = await classAccess(c),
      db = c.get('db');
    const lesson = await db.lessons.findOne({ _id: c.req.param('lessonId'), published: true });
    if (!lesson) return missing();
    const active = lesson.collectionId === access.row.collectionId;
    const studentId = access.owner && c.req.query('studentId') ? c.req.query('studentId') : access.id;
    if (studentId !== access.id && !access.row.memberIds.includes(studentId)) return missing();
    const parts = await db.lessonParts.find({ classId: access.row._id, lessonId: lesson._id, studentId }).toArray();
    if (!active && !parts.length) return missing();
    return { ...access, lesson, parts, active, studentId };
  };
  app.get('/collections', async (c) =>
    c.json({
      success: true,
      collections: (
        await c.get('db').lessonCollections.find().sort({ year: -1, season: 1, level: 1 }).limit(200).toArray()
      ).map(({ _id, ...r }) => ({ id: _id, ...r })),
    }),
  );
  app.post('/admin/collections', async (c) => {
    const data = validateCollection(await body(c));
    const collection = c.get('db').lessonCollections;
    const existing = await collection.findOne(data);
    if (existing) return c.json({ success: true, collection: { id: existing._id, ...data } });
    const _id = randomUUID();
    try {
      await collection.insertOne({ _id, ...data, createdAt: new Date() });
    } catch (e) {
      if (e.code === 11000) {
        const saved = await collection.findOne(data);
        return c.json({ success: true, collection: { id: saved._id, ...data } });
      }
      throw e;
    }
    return c.json({ success: true, collection: { id: _id, ...data } }, 201);
  });
  app.get('/admin/collections/:id', async (c) => {
    const rows = await c
      .get('db')
      .lessons.find({ collectionId: c.req.param('id') })
      .sort({ number: 1 })
      .limit(100)
      .toArray();
    return c.json({
      success: true,
      lessons: rows.map((r) => ({ ...brief(r), published: r.published, slideCount: r.slides.length })),
    });
  });
  app.post('/admin/lessons', async (c) => {
    const input = await body(c),
      data = validateLesson(input),
      db = c.get('db');
    const collection = await db.lessonCollections.findOne({
      _id: requireText(input.collectionId, 'lesson collection', 80),
    });
    if (!collection) return missing();
    if (await db.lessons.findOne({ collectionId: collection._id, number: data.number }))
      throw new ClassroomError(
        'This lesson number is already used. Open its draft or choose another number.',
        409,
        'lesson_number_used',
      );
    const row = {
      ...data,
      _id: randomUUID(),
      collectionId: collection._id,
      level: collection.level,
      published: false,
      slides: [],
      createdAt: new Date(),
    };
    try {
      await db.lessons.insertOne(row);
    } catch (e) {
      if (e.code === 11000) throw new ClassroomError('This lesson number is already used.', 409, 'lesson_number_used');
      throw e;
    }
    return c.json({ success: true, lesson: { id: row._id } }, 201);
  });
  const draft = async (c) => {
    const row = await c.get('db').lessons.findOne({ _id: c.req.param('lessonId') });
    if (!row) return missing();
    return row;
  };
  app.get('/admin/lessons/:lessonId', async (c) => c.json({ success: true, lesson: await draft(c) }));
  app.post('/admin/lessons/:lessonId/content', async (c) => {
    const row = await draft(c);
    const data = validateLesson(await body(c));
    if (row.published)
      throw new ClassroomError(
        'Published lessons keep their original questions and scores. Create a new lesson for changed content.',
        409,
        'published_immutable',
      );
    if (data.number !== row.number) throw new ClassroomError('Keep the draft lesson number.');
    const saved = await c.get('db').lessons.updateOne({ _id: row._id, published: false }, { $set: data });
    if (!saved.modifiedCount) changed();
    return c.json({ success: true });
  });
  app.post('/admin/lessons/:lessonId/assets', async (c) => {
    const row = await draft(c),
      input = await body(c),
      db = c.get('db');
    const requestId = requireText(input.requestId, 'upload ID', 80);
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(requestId)) throw new ClassroomError('Invalid upload ID.');
    const priorSlide = row.slides.find((s) => s.id === `${row._id}:${requestId}`);
    if (priorSlide) {
      const prior = await db.lessonAssets.findOne({ _id: priorSlide.id, lessonId: row._id });
      if (prior) return c.json({ success: true, slide: priorSlide, bytes: prior.bytes });
    }
    if (row.published || row.slides.length >= 40)
      throw new ClassroomError('This lesson is published or already has 40 slides.');
    const asset = { _id: `${row._id}:${requestId}`, lessonId: row._id, ...decodeImage(input) };
    const slide = { id: asset._id, alt: requireText(input.alt, 'slide description', 200) };
    // Stable upload IDs make network retries safe. Do not expire media: a
    // process interruption after attachment must never delete a valid slide.
    await db.lessonAssets.updateOne({ _id: asset._id }, { $setOnInsert: asset }, { upsert: true });
    if (!row.slides.some((s) => s.id === slide.id)) {
      const saved = await db.lessons.updateOne(
        { _id: row._id, published: false, 'slides.39': { $exists: false }, 'slides.id': { $ne: slide.id } },
        { $push: { slides: slide } },
      );
      if (!saved.modifiedCount && !(await db.lessons.findOne({ _id: row._id })).slides.some((s) => s.id === slide.id))
        changed();
    }
    return c.json({ success: true, slide, bytes: asset.bytes });
  });
  app.post('/admin/lessons/:lessonId/publish', async (c) => {
    const row = await draft(c),
      db = c.get('db');
    if (!row.slides.length) throw new ClassroomError('Upload at least one slide before publishing.');
    await db.lessons.updateOne({ _id: row._id }, { $set: { published: true, publishedAt: new Date() } });
    return c.json({ success: true });
  });
  app.get('/classes/:classId', async (c) => {
    const { row, owner, id } = await classAccess(c),
      db = c.get('db');
    const lessons = await db.lessons
      .find({ collectionId: row.collectionId || '', published: true })
      .sort({ number: 1 })
      .limit(100)
      .toArray();
    const parts = owner
      ? []
      : await db.lessonParts
          .find(
            { classId: row._id, studentId: id },
            {
              projection: { lessonId: 1, part: 1, 'attempts.score': 1, 'attempts.total': 1, 'attempts.submittedAt': 1 },
            },
          )
          .toArray();
    const oldIds = [...new Set(parts.map((p) => p.lessonId))].filter((id) => !lessons.some((l) => l._id === id));
    const old = oldIds.length
      ? await db.lessons
          .find({ _id: { $in: oldIds } }, { projection: { title: 1, titleZh: 1, number: 1, level: 1 } })
          .toArray()
      : [];
    return c.json({
      success: true,
      revision: row.lessonRevision || 0,
      collection: row.collectionId ? await db.lessonCollections.findOne({ _id: row.collectionId }) : null,
      lessons: lessons.map((l) => ({
        ...brief(l),
        progress: lessonSummary(parts.filter((p) => p.lessonId === l._id)),
      })),
      history: old.map((l) => ({ ...brief(l), progress: lessonSummary(parts.filter((p) => p.lessonId === l._id)) })),
    });
  });
  app.post('/classes/:classId/settings', async (c) => {
    const { row } = await classAccess(c, true),
      input = await body(c),
      db = c.get('db');
    const collection = await db.lessonCollections.findOne({
      _id: requireText(input.collectionId, 'lesson collection', 80),
    });
    if (!collection) return missing();
    if (input.revision !== (row.lessonRevision || 0)) changed();
    const saved = await db.classes.updateOne(
      { _id: row._id, lessonRevision: row.lessonRevision === undefined ? { $exists: false } : row.lessonRevision },
      { $set: { collectionId: collection._id, lessonRevision: (row.lessonRevision || 0) + 1 } },
    );
    if (!saved.modifiedCount) changed();
    return c.json({ success: true });
  });
  app.get('/classes/:classId/lessons/:lessonId', async (c) => {
    const { row, owner, lesson, parts, active } = await lessonAccess(c);
    return c.json({
      success: true,
      lesson: safeLesson(lesson),
      parts: publicParts(parts),
      revision: row.lessonRevision || 0,
      readOnly: owner || !active,
      isOwner: owner,
    });
  });
  app.get('/classes/:classId/lessons/:lessonId/slides/:assetId', async (c) => {
    const { lesson } = await lessonAccess(c);
    const id = c.req.param('assetId');
    if (!lesson.slides.some((s) => s.id === id)) return missing();
    const asset = await c.get('db').lessonAssets.findOne({ _id: id, lessonId: lesson._id });
    if (!asset) return missing();
    c.header('Content-Type', asset.mime);
    return c.body(Buffer.from(asset.data, 'base64'));
  });
  app.get('/admin/lessons/:lessonId/slides/:assetId', async (c) => {
    const row = await draft(c);
    if (!row.slides.some((s) => s.id === c.req.param('assetId'))) return missing();
    const asset = await c.get('db').lessonAssets.findOne({ _id: c.req.param('assetId'), lessonId: row._id });
    if (!asset) return missing();
    c.header('Content-Type', asset.mime);
    return c.body(Buffer.from(asset.data, 'base64'));
  });
  app.post('/classes/:classId/lessons/:lessonId/parts/:part', async (c) => {
    const { row, owner, id, lesson, active } = await lessonAccess(c),
      input = await body(c),
      db = c.get('db'),
      part = c.req.param('part');
    if (owner || c.get('account').role !== 'student')
      throw new ClassroomError('Only enrolled students can submit lesson work.', 403, 'student_required');
    if (!PARTS.includes(part)) return missing();
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(input.requestId || '')) throw new ClassroomError('Invalid submission request.');
    const _id = `${row._id}:${lesson._id}:${id}:${part}`,
      existing = await db.lessonParts.findOne({ _id });
    const replay = existing?.attempts.find((a) => a.requestId === input.requestId);
    const respond = async (attempt) => {
      const account = await db.users.findOne({ _id: new ObjectId(id) });
      return c.json({ success: true, attempt: publicParts([{ part, attempts: [attempt] }])[0].attempts[0],
        lessonRewardStars: account.lessonRewardStars || 0 });
    };
    if (replay) return respond(replay);
    if (!active || input.revision !== (row.lessonRevision || 0)) changed();
    // Reviewed choice answers are shown after submission, so these activities
    // allow only one attempt. Existing saved attempts remain reviewable.
    const max = ['slides', 'vocabulary', 'questions'].includes(part) ? 1 : 3;
    if ((existing?.attempts.length || 0) >= max)
      throw new ClassroomError('You have used all attempts for this activity.', 409, 'attempt_limit');
    let result = {};
    if (part === 'vocabulary' || part === 'questions')
      result = gradeAssignment({ questions: lesson[part] }, input.answers);
    if (part === 'writing')
      result = { text: requireText(input.text, 'writing answer', 2000), reviewStatus: 'submitted_for_teacher_review' };
    if (part === 'speaking') {
      const limitId = `${id}:lesson-speech:${Math.floor(Date.now() / 900000)}`;
      try {
        await db.classroomLimits.updateOne(
          { _id: limitId },
          { $setOnInsert: { count: 0, expiresAt: new Date(Date.now() + 1800000) } },
          { upsert: true },
        );
      } catch (e) {
        if (e.code !== 11000) throw e;
      }
      if (
        !(await db.classroomLimits.updateOne({ _id: limitId, count: { $lt: 6 } }, { $inc: { count: 1 } })).modifiedCount
      )
        throw new ClassroomError('Please wait before submitting more recordings.', 429, 'rate_limited');
      const audio = decodeAudio(input);
      if (!evaluateSpeech)
        throw new ClassroomError(
          'Speech checking is temporarily unavailable. Your answer has not been saved.',
          503,
          'speech_unavailable',
        );
      const evaluated = await evaluateSpeech({
        sentence: lesson.speaking.sentence,
        ...audio,
        authorization: c.req.header('authorization'),
      });
      if (!evaluated?.success || !Number.isFinite(evaluated.score) || evaluated.score < 0 || evaluated.score > 3)
        throw new ClassroomError(
          'Speech checking did not finish. Your answer has not been saved; please try again.',
          503,
          'speech_unavailable',
        );
      result = {
        ...audio,
        score: evaluated.score,
        total: 3,
        feedback: String(evaluated.feedback || '').slice(0, 2000),
        transcript: String(evaluated.transcript || '').slice(0, 2000),
        automaticallyAssessed: true,
      };
    }
    const attempt = { ...result, requestId: input.requestId, submittedAt: new Date() };
    const savedAttempt = await db.withLessonTransaction(async (session) => {
      const options = { session };
      const prior = await db.lessonParts.findOne({ _id }, options);
      const replay = prior?.attempts.find((a) => a.requestId === input.requestId);
      if (replay) return replay;
      // Determine eligibility inside the transaction, not from the earlier
      // request snapshot. Older completions and retries never earn again.
      const saved = { ...attempt, rewardStars: prior?.attempts.length ? 0 : 3 };
      // Write the class revision and the answer in the SAME transaction. A
      // simultaneous course correction conflicts/retries and rejects stale
      // work, rather than slipping between a revision read and answer write.
      const current = await db.classes.updateOne(
        {
          _id: row._id,
          collectionId: lesson.collectionId,
          memberIds: id,
          lessonRevision: row.lessonRevision === undefined ? { $exists: false } : row.lessonRevision,
        },
        { $inc: { lessonWriteVersion: 1 } },
        options,
      );
      if (!current.modifiedCount) changed();
      if (!prior)
        await db.lessonParts.insertOne(
          { _id, classId: row._id, lessonId: lesson._id, studentId: id, part, attempts: [] },
          options,
        );
      const added = await db.lessonParts.updateOne(
        { _id, [`attempts.${max - 1}`]: { $exists: false }, 'attempts.requestId': { $ne: input.requestId } },
        { $push: { attempts: saved } },
        options,
      );
      if (!added.modifiedCount)
        throw new ClassroomError('You have used all attempts for this activity.', 409, 'attempt_limit');
      if (saved.rewardStars) {
        const account = await db.users.findOne({ _id: new ObjectId(id) }, options);
        if (!account) throw new ClassroomError('Please sign in again.', 401, 'session_expired');
        await db.users.updateOne({ _id: account._id }, {
          $inc: { stars: 3, lessonRewardStars: 3 },
          $set: { trophies: (account.trophies ?? account.stars ?? 0) + 3 },
        }, options);
      }
      return saved;
    });
    return respond(savedAttempt);
  });
  app.get('/classes/:classId/lessons/:lessonId/audio/:requestId', async (c) => {
    const { parts } = await lessonAccess(c),
      a = parts.find((p) => p.part === 'speaking')?.attempts.find((a) => a.requestId === c.req.param('requestId'));
    if (!a?.audioBase64) return missing();
    c.header('Content-Type', a.audioMime);
    return c.body(Buffer.from(a.audioBase64, 'base64'));
  });
  app.get('/classes/:classId/report', async (c) => {
    const { row } = await classAccess(c, true),
      db = c.get('db');
    const lessons = await db.lessons
      .find({ collectionId: row.collectionId || '', published: true }, { projection: { _id: 1 } })
      .limit(100)
      .toArray();
    const rows = await db.lessonParts
      .find(
        { classId: row._id },
        {
          projection: {
            studentId: 1,
            lessonId: 1,
            part: 1,
            'attempts.score': 1,
            'attempts.total': 1,
            'attempts.submittedAt': 1,
          },
        },
      )
      .toArray();
    return c.json({
      success: true,
      students: row.members.map((m) => {
        const own = rows.filter((r) => r.studentId === m.id);
        return {
          id: m.id,
          name: m.name,
          assigned: lessons.length,
          completed: lessons.filter((l) => lessonSummary(own.filter((r) => r.lessonId === l._id)).completed).length,
          studyDays28: studyDays28(own),
          activitiesSubmitted: own.filter((r) => r.part !== 'slides' && r.attempts.length).length,
        };
      }),
    });
  });
  app.get('/classes/:classId/students/:studentId', async (c) => {
    const { row } = await classAccess(c, true),
      db = c.get('db'),
      studentId = c.req.param('studentId');
    if (!row.memberIds.includes(studentId)) return missing();
    const parts = await db.lessonParts
      .find(
        { classId: row._id, studentId },
        { projection: { lessonId: 1, part: 1, 'attempts.score': 1, 'attempts.total': 1, 'attempts.submittedAt': 1 } },
      )
      .toArray();
    const current = await db.lessons
      .find(
        { collectionId: row.collectionId || '', published: true },
        { projection: { title: 1, titleZh: 1, number: 1, level: 1, collectionId: 1 } },
      )
      .limit(100)
      .toArray();
    const ids = [...new Set(parts.map((p) => p.lessonId))].filter((id) => !current.some((l) => l._id === id));
    const old = ids.length
      ? await db.lessons
          .find({ _id: { $in: ids } }, { projection: { title: 1, titleZh: 1, number: 1, level: 1, collectionId: 1 } })
          .toArray()
      : [];
    return c.json({
      success: true,
      lessons: [...current, ...old].map((l) => ({
        ...brief(l),
        archived: l.collectionId !== row.collectionId,
        progress: lessonSummary(parts.filter((p) => p.lessonId === l._id)),
      })),
    });
  });
  return app;
}
