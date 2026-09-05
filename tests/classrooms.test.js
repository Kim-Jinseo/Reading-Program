import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { createHash } from 'node:crypto';
import { memoryDb } from './helpers/memoryDb.js';

const teacherId = '111111111111111111111111';
const studentId = '222222222222222222222222';
const outsiderId = '333333333333333333333333';
const adminId = '444444444444444444444444';
import { createClassroomRouter } from '../server/classrooms.js';
const quiz = { title: 'At the farm', subject: 'reading', level: 1, passage: 'A duck swims. A hen eats rice.', instructions: 'Read and choose.', maxAttempts: 2, questions: [
  { prompt: 'What swims?', options: ['A duck', 'A hen', 'A cat'], correctIndex: 0, explanation: 'The duck swims.' },
  { prompt: 'What does the hen eat?', options: ['Rice', 'Bread', 'Grass'], correctIndex: 0, explanation: 'The hen eats rice.' }
] };

async function setup() {
  assert.equal(typeof createClassroomRouter, 'function', 'The classroom workflow must be implemented');
  const db = memoryDb();
  for (const [id, role] of [[teacherId, 'teacher'], [studentId, 'student'], [outsiderId, 'teacher'], [adminId, 'admin']]) {
    await db.users.insertOne({ _id: new ObjectId(id), username: role + id[0], role, tokenVersion: 0, completedReading: ['one'], pin: 'private' });
  }
  const app = createClassroomRouter({ getDb: async () => db, requireAuth: async (c, next) => {
    const id = c.req.header('authorization');
    if (!id) return c.json({ error: 'Unauthorized' }, 401);
    c.set('user', { userId: id, tokenVersion: 0, role: 'admin' }); // Intentionally forged role claim.
    await next();
  }, createSessionToken: async () => 'new-session', publicUser: u => ({ username: u.username, role: u.role }) });
  const request = async (url, user = teacherId, body, method = body ? 'POST' : 'GET') => {
    const response = await app.request(url, { method, headers: { ...(user ? { authorization: user } : {}), 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  const created = await request('/classes', teacherId, { name: 'English A' });
  assert.equal(created.status, 201);
  const classroom = created.body.class;
  const join = () => request('/classes/join', studentId, { code: classroom.invitationCode, displayName: '小明' });
  const publish = () => request(`/classes/${classroom.id}/assignments`, teacherId, quiz);
  return { db, request, classroom, join, publish };
}

test('student cannot create classes even with a forged admin token role', async () => {
  const { request } = await setup();
  assert.equal((await request('/classes', studentId, { name: 'Bad' })).status, 403);
  assert.equal((await request('/classes', null)).status, 401);
});
test('verification is required; one-use teacher code grants teacher, never admin', async () => {
  const { request, db } = await setup();
  assert.equal((await request('/teacher/verify', studentId, { code: 'wrong-code' })).status, 400);
  assert.equal((await request('/teacher/invitations', studentId, {})).status, 403);
  const issued = await request('/teacher/invitations', adminId, {});
  assert.equal(issued.status, 201);
  const code = issued.body.code;
  assert.ok(!JSON.stringify(db.teacherInvites.docs).includes(code), 'Only a hash of the code may be stored');
  const accepted = await request('/teacher/verify', studentId, { code });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.user.role, 'teacher');
  await db.users.updateOne({ _id: new ObjectId(outsiderId) }, { $set: { role: 'student' } });
  assert.equal((await request('/teacher/verify', outsiderId, { code })).status, 400);
});
test('class joining is idempotent, hides its invitation from students, and excludes other classes', async () => {
  const { request, classroom, join } = await setup();
  assert.equal((await join()).status, 200);
  assert.equal((await join()).status, 200);
  const detail = await request(`/classes/${classroom.id}`);
  assert.equal(detail.body.students.length, 1);
  assert.equal(detail.body.students[0].name, '小明');
  const own = await request(`/classes/${classroom.id}`, studentId);
  assert.equal(own.body.class.invitationCode, undefined);
  assert.equal(own.body.students, undefined);
  assert.equal((await request(`/classes/${classroom.id}`, outsiderId)).status, 404);
  assert.deepEqual((await request('/classes', outsiderId)).body.classes, []);
});
test('only the owning teacher can publish or read class reports', async () => {
  const { request, classroom, join } = await setup();
  await join();
  for (const user of [studentId, outsiderId]) {
    assert.ok([403, 404].includes((await request(`/classes/${classroom.id}/assignments`, user, quiz)).status));
    assert.ok([403, 404].includes((await request(`/classes/${classroom.id}/report`, user)).status));
  }
});
test('grades come from the answer key and choices are hidden until submission', async () => {
  const { request, join, publish, classroom } = await setup();
  await join();
  const published = await publish(); assert.equal(published.status, 201);
  const id = published.body.assignment.id;
  const before = await request(`/assignments/${id}`, studentId);
  assert.equal(before.status, 200);
  const questions = before.body.assignment.questions;
  assert.equal(questions[0].correctOptionId, undefined);
  assert.equal(questions[0].explanation, undefined);
  const answers = questions.map((q, i) => ({ questionId: q.id, optionId: q.options.find(o => o.text === (i ? 'Bread' : 'A duck')).id }));
  const submitted = await request(`/assignments/${id}/submit`, studentId, { requestId: 'request-00000001', answers, score: 100 });
  assert.equal(submitted.status, 200);
  assert.equal(submitted.body.attempt.score, 1);
  assert.equal(submitted.body.attempt.total, 2);
  assert.equal(submitted.body.attempt.responses[1].correct, false);
  assert.equal((await request(`/assignments/${id}`, outsiderId)).status, 404);
  const report = await request(`/classes/${classroom.id}/report`);
  assert.equal(report.body.students[0].completed, 1);
  assert.equal(report.body.students[0].averagePercent, 50);
  assert.equal(report.body.students[0].results, undefined, 'Overview must not download answer histories');
  assert.equal(report.body.assignments[0].questions, undefined);
  const summary = await request(`/classes/${classroom.id}/students/${studentId}/results`);
  assert.equal(summary.body.results[0].latest.score, 1);
  assert.equal(summary.body.results[0].attempts, undefined);
  const detail = await request(`/assignments/${id}/students/${studentId}`);
  assert.equal(detail.body.attempts[0].score, 1);
  assert.equal(detail.body.assignment.questions.length, 2);
  assert.ok(!JSON.stringify(report.body).includes('private'));
});
test('incomplete and foreign options cannot be submitted', async () => {
  const { request, join, publish } = await setup(); await join();
  const id = (await publish()).body.assignment.id;
  assert.equal((await request(`/assignments/${id}/submit`, studentId, { requestId: 'request-00000001', answers: [] })).status, 400);
  const questions = (await request(`/assignments/${id}`, studentId)).body.assignment.questions;
  const answers = questions.map(q => ({ questionId: q.id, optionId: 'fake' }));
  assert.equal((await request(`/assignments/${id}/submit`, studentId, { requestId: 'request-00000001', answers })).status, 400);
});
test('submission replay is idempotent and parallel attempts cannot bypass retry limit', async () => {
  const { request, join, publish, db } = await setup(); await join();
  const id = (await publish()).body.assignment.id;
  const questions = (await request(`/assignments/${id}`, studentId)).body.assignment.questions;
  const answers = questions.map(q => ({ questionId: q.id, optionId: q.options[0].id }));
  const send = requestId => request(`/assignments/${id}/submit`, studentId, { requestId, answers });
  const first = await send('request-00000001');
  const replay = await send('request-00000001');
  assert.equal(first.status, 200); assert.deepEqual(first.body.attempt, replay.body.attempt);
  const concurrent = await Promise.all(['request-00000002', 'request-00000003'].map(send));
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
  assert.equal(db.submissions.docs[0].attempts.length, 2);
});
test('duplicate choices, invalid keys and blank questions are rejected', async () => {
  const { request, classroom } = await setup();
  for (const change of [{ options: ['A', ' a '] }, { correctIndex: 4 }, { prompt: ' ' }]) {
    const bad = { ...quiz, questions: [{ ...quiz.questions[0], ...change }] };
    assert.equal((await request(`/classes/${classroom.id}/assignments`, teacherId, bad)).status, 400);
  }
});
test('rotating invitation code invalidates old code without removing enrolled students', async () => {
  const { request, classroom, join } = await setup(); await join();
  const rotated = await request(`/classes/${classroom.id}/invitation`, teacherId, {});
  assert.equal(rotated.status, 200); assert.notEqual(rotated.body.invitationCode, classroom.invitationCode);
  assert.equal((await join()).status, 404);
  assert.equal((await request(`/classes/${classroom.id}`, studentId)).status, 200);
});
test('verification guesses are rate limited across requests', async () => {
  const { request } = await setup();
  let result;
  for (let i = 0; i < 7; i++) result = await request('/teacher/verify', studentId, { code: 'incorrect-code' });
  assert.equal(result.status, 429);
});
test('expired invitations and revoked sessions cannot gain teacher access', async () => {
  const { request, db } = await setup();
  const code = 'expired-single-use-invite';
  await db.teacherInvites.insertOne({ _id: createHash('sha256').update(code).digest('hex'), usedBy: null, expiresAt: new Date(0) });
  assert.equal((await request('/teacher/verify', studentId, { code })).status, 400);
  await db.users.updateOne({ _id: new ObjectId(teacherId) }, { $set: { tokenVersion: 1 } });
  assert.equal((await request('/classes', teacherId, { name: 'Revoked teacher' })).status, 401);
});
test('a second enrolled student cannot see the first student answer keys or attempts', async () => {
  const { request, db, join, classroom, publish } = await setup();
  await join();
  await db.users.updateOne({ _id: new ObjectId(outsiderId) }, { $set: { role: 'student' } });
  await request('/classes/join', outsiderId, { code: classroom.invitationCode, displayName: '小红' });
  const id = (await publish()).body.assignment.id;
  const questions = (await request(`/assignments/${id}`, studentId)).body.assignment.questions;
  await request(`/assignments/${id}/submit`, studentId, { requestId: 'request-isolation', answers: questions.map(q => ({ questionId: q.id, optionId: q.options[0].id })) });
  const other = await request(`/assignments/${id}`, outsiderId);
  assert.deepEqual(other.body.attempts, []);
  assert.equal(other.body.review, undefined);
  const report = (await request(`/classes/${classroom.id}/report`)).body;
  assert.equal(report.students.length, 2);
  assert.equal(report.students.find(s => s.name === '小红').averagePercent, null);
  assert.equal(report.students.find(s => s.name === '小红').completed, 0);
});
test('classroom auth is mounted only on classroom routes in the real API', async () => {
  const { GET } = await import('../api/index.js');
  assert.equal((await GET(new Request('http://localhost/'))).status, 200);
  assert.equal((await GET(new Request('http://localhost/api/classroom/classes'))).status, 401);
});
test('student answer detail endpoints require the class owner and enrolled student', async () => {
  const { request, classroom, publish, join } = await setup(); await join();
  const id = (await publish()).body.assignment.id;
  for (const caller of [studentId, outsiderId]) {
    assert.ok([403, 404].includes((await request(`/classes/${classroom.id}/students/${studentId}/results`, caller)).status));
    assert.ok([403, 404].includes((await request(`/assignments/${id}/students/${studentId}`, caller)).status));
  }
  assert.equal((await request(`/assignments/${id}/students/${outsiderId}`)).status, 404);
});
test('parallel publication cannot exceed the class assignment capacity', async () => {
  const { request, db, classroom } = await setup();
  await db.classes.updateOne({ _id: classroom.id }, { $set: { assignmentCount: 99 } });
  const answers = await Promise.all([1, 2].map(n => request(`/classes/${classroom.id}/assignments`, teacherId, { ...quiz, title: 'Quiz ' + n })));
  assert.deepEqual(answers.map(r => r.status).sort(), [201, 400]);
  assert.equal(db.assignments.docs.length, 1);
});
