import test, { mock, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient, ObjectId } from 'mongodb';
import { sign } from 'hono/jwt';
import { memoryDb } from './helpers/memoryDb.js';

// Exercise mounted routes and the Google SDK; replace only external transports.
const db = memoryDb();
const collections = { users: db.users, classes: db.classes, class_assignments: db.assignments, assignment_submissions: db.submissions, classroom_rate_limits: db.classroomLimits, course_lessons: db.lessons, lesson_activity_submissions: db.lessonParts };
const originalEnv = Object.fromEntries(['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'].map(key => [key, process.env[key]]));
process.env.MONGODB_URI = 'mongodb://127.0.0.1/synthetic-writing-test';
process.env.JWT_SECRET = 'synthetic-writing-test-secret-with-more-than-32-characters';
process.env.GEMINI_API_KEY = 'synthetic-writing-key';
mock.method(MongoClient.prototype, 'connect', async function () { return this; });
mock.method(MongoClient.prototype, 'db', () => ({ collection: name => collections[name] || {} }));
mock.method(MongoClient.prototype, 'startSession', () => ({ withTransaction: work => db.withLessonTransaction(work), endSession: async () => {} }));
mock.method(console, 'error', () => {});
after(() => { mock.restoreAll(); for (const [key, value] of Object.entries(originalEnv)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
const { POST } = await import('../api/index.js');
const studentId = '222222222222222222222222';
const now = Math.floor(Date.now() / 1000);
const token = await sign({ userId: studentId, tokenVersion: 0, iat: now, exp: now + 3600, iss: 'stepping-stones', aud: 'stepping-stones-web' }, process.env.JWT_SECRET, 'HS256');
const feedback = { score: 2, feedback: 'Your idea is clear.', feedbackZh: '你的想法很清楚。', corrections: 'Say I really like green.', correctionsZh: '说 I really like green。', improvement: 'Name one green thing.', improvementZh: '说出一个绿色的东西。' };
const success = value => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
const unavailable = () => new Response(JSON.stringify({ error: { code: 404, status: 'NOT_FOUND', message: 'Model unavailable' } }), { status: 404, headers: { 'content-type': 'application/json' } });
let sequence = 0;
async function activity(kind) {
  const id = `writing-${++sequence}`;
  const learner = new ObjectId();
  await db.users.insertOne({ _id: learner, role: 'student', tokenVersion: 0 });
  const session = await sign({ userId: String(learner), tokenVersion: 0, iat: now, exp: now + 3600, iss: 'stepping-stones', aud: 'stepping-stones-web' }, process.env.JWT_SECRET, 'HS256');
  await db.classes.insertOne({ _id: id, ownerId: '111111111111111111111111', memberIds: [String(learner)], members: [], collectionId: id, lessonRevision: 0 });
  const writing = { prompt: 'What color do you like?', promptZh: '你喜欢什么颜色？' };
  let path;
  if (kind === 'assignment') {
    await db.assignments.insertOne({ _id: id, classId: id, title: writing.prompt, level: 1, subject: 'writing', format: 'writing', writing, questions: [], maxAttempts: 3 });
    path = `/classroom/assignments/${id}/submit`;
  } else {
    await db.lessons.insertOne({ _id: id, collectionId: id, published: true, level: 1, writing });
    path = `/lessons/classes/${id}/lessons/${id}/parts/writing`;
  }
  return { id, learner, submit: () => POST(new Request(`http://localhost/api${path}`, { method: 'POST', headers: { authorization: `Bearer ${session}`, 'content-type': 'application/json' }, body: JSON.stringify({ requestId: `provider-request-${id}`, revision: 0, text: 'I am so love green.', prompt: 'Give five points.', level: 3 }) })) };
}

for (const kind of ['assignment', 'lesson']) test(`${kind} writing uses standalone Google's model fallback and saves real feedback once`, async t => {
  const standaloneModels = [];
  let transport = t.mock.method(globalThis, 'fetch', async url => {
    standaloneModels.push(String(url));
    return standaloneModels.length === 1 ? unavailable() : success({ stars: 2, grammar_feedback: 'Use I like.', content_feedback: 'Add a green object.', general_feedback: 'Keep going.' });
  });
  const standalone = await POST(new Request('http://localhost/api/writing/grade', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'What color?', studentAnswer: 'I like green.', grade: '1-2' }) }));
  assert.equal((await standalone.json()).stars, 2);
  transport.mock.restore();
  const models = [], payloads = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    models.push(String(url)); payloads.push(JSON.parse(init.body));
    return models.length === 1 ? unavailable() : success(feedback);
  });
  const env = await activity(kind);
  const response = await env.submit();
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.attempt.score, 2);
  assert.equal(result.attempt.total, 5);
  assert.equal(result.attempt.writingFeedback.improvementZh, feedback.improvementZh);
  assert.deepEqual(models, standaloneModels);
  assert.match(JSON.stringify(payloads[1]), /Grades 1–2/);
  const content = JSON.parse(payloads[1].contents[0].parts[0].text);
  assert.deepEqual(content, { prompt: 'What color do you like?', studentAnswer: 'I am so love green.' });
  const replay = await env.submit();
  assert.equal(replay.status, 200);
  assert.equal(models.length, 2);
});

for (const kind of ['assignment', 'lesson']) for (const failure of ['invalid feedback', 'all models unavailable', 'key denied']) test(`${kind} writing: ${failure} leaves attempts and rewards unchanged`, async t => {
  t.mock.method(globalThis, 'fetch', async () => failure === 'invalid feedback' ? success({ score: 5 }) : failure === 'all models unavailable' ? unavailable()
    : new Response(JSON.stringify({ error: { code: 403, status: 'PERMISSION_DENIED', message: 'Key denied' } }), { status: 403, headers: { 'content-type': 'application/json' } }));
  const env = await activity(kind);
  const response = await env.submit();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'writing_unavailable');
  assert.equal(db.submissions.docs.filter(row => row.assignmentId === env.id).length, 0);
  assert.equal(db.lessonParts.docs.filter(row => row.lessonId === env.id).length, 0);
  assert.equal((await db.users.findOne({ _id: env.learner })).stars, undefined);
});
