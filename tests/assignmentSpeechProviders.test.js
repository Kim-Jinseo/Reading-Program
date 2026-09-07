import test, { mock, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient, ObjectId } from 'mongodb';
import { sign } from 'hono/jwt';
import { memoryDb } from './helpers/memoryDb.js';

// Only external Mongo/provider transports are replaced. Requests exercise the
// real mounted classroom adapter, speech route, SDK and result persistence.
const db = memoryDb();
const collections = { users: db.users, classes: db.classes, class_assignments: db.assignments, assignment_submissions: db.submissions, classroom_rate_limits: db.classroomLimits };
const originalEnv = Object.fromEntries(['MONGODB_URI', 'JWT_SECRET', 'DEEPGRAM_API_KEY', 'GEMINI_API_KEY'].map(key => [key, process.env[key]]));
process.env.MONGODB_URI = 'mongodb://127.0.0.1/synthetic-speech-test';
process.env.JWT_SECRET = 'synthetic-speech-test-secret-with-more-than-32-characters';
process.env.GEMINI_API_KEY = 'synthetic-gemini-key';
delete process.env.DEEPGRAM_API_KEY;
mock.method(MongoClient.prototype, 'connect', async function () { return this; });
mock.method(MongoClient.prototype, 'db', () => ({ collection: name => collections[name] || {} }));
mock.method(MongoClient.prototype, 'startSession', () => ({ withTransaction: work => db.withLessonTransaction(work), endSession: async () => {} }));
mock.method(console, 'error', () => {});
mock.method(console, 'warn', () => {});
after(() => { mock.restoreAll(); for (const [key, value] of Object.entries(originalEnv)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
const { POST } = await import('../api/index.js');
const studentId = '222222222222222222222222';
const now = Math.floor(Date.now() / 1000);
const token = await sign({ userId: studentId, tokenVersion: 0, iat: now, exp: now + 3600, iss: 'stepping-stones', aud: 'stepping-stones-web' }, process.env.JWT_SECRET, 'HS256');
const bytes = Buffer.alloc(200); bytes.write('1a45dfa3', 0, 'hex');
const audio = { audioBase64: bytes.toString('base64'), audioMime: 'audio/webm' };
const gemini = raw => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(raw) }] } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
let sequence = 0;
async function assignment() {
  const id = `speech-${++sequence}`;
  if (!db.users.docs.length) await db.users.insertOne({ _id: new ObjectId(studentId), role: 'student', tokenVersion: 0 });
  await db.classes.insertOne({ _id: id, ownerId: '111111111111111111111111', memberIds: [studentId], members: [] });
  await db.assignments.insertOne({ _id: id, classId: id, title: 'Speak', level: 1, subject: 'speaking', format: 'speaking', speaking: { sentence: 'Hello.', hintZh: '' }, questions: [], maxAttempts: 3 });
  return body => POST(new Request(`http://localhost/api/classroom/assignments/${id}/submit`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ requestId: `provider-request-${id}`, ...audio, ...body }) }));
}
const standalone = signal => POST(new Request('http://localhost/api/audio/evaluate', { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-vercel-forwarded-for': `provider-test-${++sequence}` }, body: JSON.stringify({ audioBase64: audio.audioBase64, mimeType: audio.audioMime, targetSentence: 'Hello.' }) }));

test('raw malformed Gemini fields cannot become a saved silent zero in assigned speaking', async t => {
  const malformed = [{}, { speech_detected: false }, { speech_detected: true, stars: 2 }, { speech_detected: 'true', stars: 2, feedback: 'Okay' }, { speech_detected: true, stars: 9, feedback: 'Okay' }, { speech_detected: false, stars: 2, feedback: 'Okay' }];
  for (const raw of malformed) {
    const transport = t.mock.method(globalThis, 'fetch', async () => gemini(raw));
    const submit = await assignment();
    const response = await submit({});
    assert.equal(response.status, 503, JSON.stringify(raw));
    assert.equal((await response.json()).code, 'speech_unavailable');
    transport.mock.restore();
  }
  assert.equal(db.submissions.docs.length, 0);
});

test('strict speech preserves a valid explicit silence result and standalone legacy normalization', async t => {
  const transport = t.mock.method(globalThis, 'fetch', async () => gemini({ speech_detected: false, stars: 0, feedback: 'No speech detected.' }));
  const submit = await assignment();
  const saved = await submit({});
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).attempt.speechDetected, false);
  transport.mock.restore();
  t.mock.method(globalThis, 'fetch', async () => gemini({}));
  const legacy = await standalone();
  assert.equal(legacy.status, 200);
  assert.equal((await legacy.json()).score, 0);
});

test('abort reaches the active Deepgram transport and prevents Gemini fallback', async t => {
  process.env.DEEPGRAM_API_KEY = 'synthetic-deepgram-key';
  t.after(() => { delete process.env.DEEPGRAM_API_KEY; });
  let started, release, providerSignal, geminiCalls = 0;
  const ready = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (!String(url).includes('deepgram')) { geminiCalls++; return gemini({ speech_detected: false, stars: 0, feedback: 'No speech.' }); }
    providerSignal = init.signal; started(); await gate;
    if (providerSignal.aborted) throw providerSignal.reason;
    return new Response('{}', { status: 503 });
  });
  const controller = new AbortController();
  const pending = standalone(controller.signal);
  await ready; controller.abort(); release();
  const response = await pending;
  assert.equal(providerSignal.aborted, true);
  assert.equal(geminiCalls, 0);
  assert.ok(response.status >= 400);
});

test('abort reaches active Gemini transport and prevents retry or another fallback model', async t => {
  delete process.env.DEEPGRAM_API_KEY;
  let started, release, providerSignal, calls = 0;
  const ready = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls++; providerSignal = init.signal; started(); await gate;
    if (providerSignal?.aborted) throw providerSignal.reason;
    return gemini({ speech_detected: true, stars: 2, feedback: 'Okay.' });
  });
  const controller = new AbortController();
  const pending = standalone(controller.signal);
  await ready; controller.abort(); release();
  const response = await pending;
  assert.equal(providerSignal?.aborted, true);
  assert.equal(calls, 1);
  assert.ok(response.status >= 400);
});

for (const provider of ['deepgram', 'gemini']) test(`assignment timeout cancels the real ${provider} request and saves no attempt`, async t => {
  if (provider === 'deepgram') process.env.DEEPGRAM_API_KEY = 'synthetic-deepgram-key';
  else delete process.env.DEEPGRAM_API_KEY;
  t.after(() => { delete process.env.DEEPGRAM_API_KEY; });
  const originalTimeout = globalThis.setTimeout;
  let expire;
  // Drive the production 25-second deadline deterministically once the actual
  // provider request has begun; no live provider or wall-clock wait is needed.
  t.mock.method(globalThis, 'setTimeout', (callback, duration, ...args) => {
    if (duration === 25000) expire = () => callback(...args);
    return originalTimeout(callback, duration, ...args);
  });
  let started, signal, calls = 0;
  const ready = new Promise(resolve => { started = resolve; });
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls++; signal = init.signal; started();
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });
  const submit = await assignment();
  const savedBefore = db.submissions.docs.length;
  const pending = submit({});
  await ready;
  assert.equal(typeof expire, 'function');
  expire();
  const response = await pending;
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'speech_unavailable');
  assert.equal(signal.aborted, true);
  assert.equal(calls, 1);
  assert.equal(db.submissions.docs.length, savedBefore);
});
