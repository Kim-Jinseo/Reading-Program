import test, { mock, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { verify } from 'hono/jwt';
import { memoryDb } from './helpers/memoryDb.js';

// Replace only the external database connection. Exercise the real mounted
// endpoint, password hashing, token signing and public account serialization.
const db = memoryDb();
const originalInsert = db.users.insertOne.bind(db.users);
db.users.insertOne = doc => originalInsert({ _id: new ObjectId(), ...doc });
mock.method(MongoClient.prototype, 'connect', async function () { return this; });
mock.method(MongoClient.prototype, 'db', () => ({ collection: name => db[name] || {} }));
mock.method(console, 'error', () => {});
const previousUri = process.env.MONGODB_URI;
const previousSecret = process.env.JWT_SECRET;
process.env.MONGODB_URI = 'mongodb://127.0.0.1/synthetic-auth-test';
beforeEach(() => {
  process.env.JWT_SECRET = 'synthetic-test-secret-with-more-than-32-characters';
  db.users.docs = [];
});
after(() => {
  for (const [key, value] of [['MONGODB_URI', previousUri], ['JWT_SECRET', previousSecret]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  mock.restoreAll();
});
const { POST, GET } = await import('../api/index.js');
let requestNumber = 0;
test('public leaderboard shows complete English and Chinese usernames without private account fields', async () => {
  for (const account of [
    { username: '  Jinseo Kim  ', trophies: 116 },
    { username: '王小明', trophies: 120 },
    { username: ' ', stars: 3 },
    { username: 'Private Teacher', role: 'teacher', trophies: 999 },
  ]) await db.users.insertOne({ role: 'student', pin: 'private-hash', tokenVersion: 7, ...account });
  const response = await GET(new Request('http://localhost/api/leaderboard'));
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.deepEqual(data, [
    { id: 'rank-1', name: '王小明', trophies: 120, isCurrentUser: false },
    { id: 'rank-2', name: 'Jinseo Kim', trophies: 116, isCurrentUser: false },
    { id: 'rank-3', name: 'Student', trophies: 3, isCurrentUser: false },
  ]);
});
async function submit(body) {
  const response = await POST(new Request('http://localhost/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-vercel-forwarded-for': `synthetic-${++requestNumber}` },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }));
  return { status: response.status, body: await response.json() };
}

test('missing or short signing secret rejects signup without leaving an unusable account', async () => {
  for (const secret of ['', 'too-short']) {
    process.env.JWT_SECRET = secret;
    const response = await submit({ username: `new-student-${secret.length}`, pin: 'test-password-only', isSignup: true });
    assert.equal(db.users.docs.length, 0);
    assert.equal(response.status, 503);
    assert.equal(response.body.code, 'AUTH_UNAVAILABLE');
    assert.equal(response.body.token, undefined);
    assert.ok(response.body.requestId);
    assert.ok(!JSON.stringify(response.body).includes('JWT_SECRET'));
  }
});

test('malformed signup requests are validation errors, not generic server errors', async () => {
  assert.equal((await submit('{broken')).status, 400);
  assert.equal((await submit({ username: 'a', pin: 'test-password-only', isSignup: true })).status, 400);
  assert.equal((await submit({ username: 'student', pin: 'short', isSignup: true })).status, 400);
});

test('the mounted progress endpoint preserves server lesson rewards and rejects forged reward snapshots', async () => {
  const created = await submit({ username: 'Reward student', pin: 'test-password-only', isSignup: true });
  const account = await db.users.findOne({ username: 'Reward student' });
  await db.users.updateOne({ _id: account._id }, { $set: { stars: 20, trophies: 26, lessonRewardStars: 3 } });
  const sync = async body => POST(new Request('http://localhost/api/auth/sync', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${created.body.token}` },
    body: JSON.stringify(body),
  }));
  assert.equal((await sync({ updates: { stars: 18, trophies: 24 }, lessonRewardStars: 0 })).status, 200);
  assert.equal((await db.users.findOne({ _id: account._id })).stars, 21);
  assert.equal((await sync({ updates: { stars: 10 }, lessonRewardStars: 3 })).status, 200);
  assert.equal((await db.users.findOne({ _id: account._id })).stars, 10);
  assert.equal((await sync({ updates: { stars: 0 }, lessonRewardStars: 999 })).status, 400);
  assert.equal((await db.users.findOne({ _id: account._id })).stars, 10);
});

test('signup and subsequent login issue verifiable sessions and never expose password hashes or grant admin', async () => {
  process.env.JWT_SECRET = 'synthetic-test-secret-with-more-than-32-characters';
  const created = await submit({ username: '  Fresh Student  ', pin: 'test-password-only', isSignup: true, role: 'admin' });
  assert.equal(created.status, 200);
  assert.equal(created.body.user.username, 'Fresh Student');
  assert.equal(created.body.user.role, 'student');
  assert.equal(created.body.user.pin, undefined);
  assert.equal(created.body.user.tokenVersion, undefined);
  const stored = await db.users.findOne({ username: 'Fresh Student' });
  assert.equal(await bcrypt.compare('test-password-only', stored.pin), true);
  const claims = await verify(created.body.token, process.env.JWT_SECRET, { alg: 'HS256', iss: 'stepping-stones', aud: 'stepping-stones-web' });
  assert.equal(claims.userId, String(stored._id));
  assert.equal(claims.role, 'student');
  const login = await submit({ username: 'Fresh Student', pin: 'test-password-only', isSignup: false });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
});

test('duplicate signup preserves the original account and incorrect login never issues a session', async () => {
  await db.users.insertOne({ username: 'Fresh Student', pin: await bcrypt.hash('test-password-only', 12), role: 'student', tokenVersion: 0 });
  const count = db.users.docs.length;
  const duplicate = await submit({ username: 'Fresh Student', pin: 'different-password', isSignup: true });
  assert.equal(duplicate.status, 400);
  assert.match(duplicate.body.error, /not available/);
  assert.equal(db.users.docs.length, count);
  const wrong = await submit({ username: 'Fresh Student', pin: 'different-password' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.token, undefined);
});

test('an unexpected signing failure never reserves the signup username', async () => {
  const count = db.users.docs.length;
  const signing = mock.method(crypto.subtle, 'sign', async () => { throw new Error('Synthetic signing outage'); });
  try {
    const failed = await submit({ username: 'Signing outage', pin: 'test-password-only', isSignup: true });
    assert.equal(failed.status, 503);
    assert.equal(failed.body.token, undefined);
    assert.equal(db.users.docs.length, count);
    assert.equal(signing.mock.callCount(), 1);
  } finally { signing.mock.restore(); }
});

test('a database write failure or duplicate-key race never returns the prepared token', async () => {
  const count = db.users.docs.length;
  for (const [code, status] of [[11000, 400], [91, 503]]) {
    const insert = mock.method(db.users, 'insertOne', async () => { throw Object.assign(new Error('Synthetic database error'), { code }); });
    try {
      const failed = await submit({ username: `Write failure ${code}`, pin: 'test-password-only', isSignup: true });
      assert.equal(failed.status, status);
      assert.equal(failed.body.token, undefined);
      assert.equal(db.users.docs.length, count);
    } finally { insert.mock.restore(); }
  }
});
