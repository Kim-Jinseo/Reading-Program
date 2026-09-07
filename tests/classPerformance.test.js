import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { memoryDb } from './helpers/memoryDb.js';
import { createLessonRouter } from '../server/lessons.js';
import { createClassroomRouter } from '../server/classrooms.js';

const student = '222222222222222222222222';
async function setup() {
  const db = memoryDb();
  await db.users.insertOne({ _id: new ObjectId(student), role: 'student' });
  await db.classes.insertOne({ _id: 'c', ownerId: '111111111111111111111111', memberIds: [student], collectionId: 'course' });
  await db.lessons.insertOne({ _id: 'l', collectionId: 'course', published: true, slides: [{ id: 's' }] });
  await db.lessonAssets.insertOne({ _id: 's', lessonId: 'l', mime: 'image/webp', data: 'aW1hZ2U=' });
  const requireAuth = async (c, next) => { c.set('user', { userId: student }); await next(); };
  return { db, lesson: createLessonRouter({ getDb: async () => db, requireAuth }), classroom: createClassroomRouter({ getDb: async () => db, requireAuth }) };
}

test('first class and lesson reads do not provision indexes or sample content', async () => {
  const { db, lesson, classroom } = await setup();
  let setupCalls = 0;
  for (const name of ['classes', 'assignments', 'submissions', 'teacherInvites', 'classroomLimits', 'lessons', 'lessonAssets', 'lessonCollections', 'lessonParts']) {
    db[name].createIndex = async () => { setupCalls++; };
  }
  for (const name of ['lessonCollections', 'lessonAssets', 'lessons']) db[name].updateOne = async () => { setupCalls++; return { modifiedCount: 1 }; };
  assert.equal((await classroom.request('/classes')).status, 200);
  assert.equal((await lesson.request('/collections')).status, 200);
  assert.equal(setupCalls, 0, 'page requests must not perform deployment setup');
});

test('class and lesson responses expose elapsed server time without personal data', async () => {
  const { lesson, classroom } = await setup();
  for (const response of [await lesson.request('/collections'), await classroom.request('/classes')]) {
    assert.match(response.headers.get('server-timing') || '', /^app;dur=\d+(\.\d+)?$/);
  }
});

test('active slide access does not fetch student submissions or recordings', async () => {
  const { db, lesson } = await setup();
  let reads = 0;
  db.lessonParts.find = () => ({ toArray: async () => { reads++; return []; } });
  const response = await lesson.request('/classes/c/lessons/l/slides/s');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'image');
  assert.equal(reads, 0, 'image access must not download unrelated saved work');
});

test('archived slide access still requires the requesting student to have saved work', async () => {
  const { db, lesson } = await setup();
  await db.classes.updateOne({ _id: 'c' }, { $set: { collectionId: 'new-course' } });
  assert.equal((await lesson.request('/classes/c/lessons/l/slides/s')).status, 404);
  await db.lessonParts.insertOne({ _id: 'part', classId: 'c', studentId: student, lessonId: 'l', attempts: [] });
  assert.equal((await lesson.request('/classes/c/lessons/l/slides/s')).status, 200);
  await db.classes.updateOne({ _id: 'c' }, { $set: { memberIds: [] } });
  assert.equal((await lesson.request('/classes/c/lessons/l/slides/s')).status, 404);
});

test('warm lesson reads use a single atomic rate-counter command', async () => {
  const { db, lesson } = await setup();
  await lesson.request('/collections');
  let commands = 0;
  for (const method of ['updateOne', 'findOneAndUpdate']) {
    const original = db.classroomLimits[method]?.bind(db.classroomLimits);
    if (original) db.classroomLimits[method] = async (...args) => { commands++; return original(...args); };
  }
  assert.equal((await lesson.request('/collections')).status, 200);
  assert.equal(commands, 1);
});

test('concurrent requests retain the lesson rate limit across router instances', async () => {
  const { db, lesson } = await setup();
  const other = createLessonRouter({ getDb: async () => db, requireAuth: async (c, next) => { c.set('user', { userId: student }); await next(); } });
  const results = await Promise.all(Array.from({ length: 185 }, (_, i) => (i % 2 ? lesson : other).request('/collections')));
  assert.equal(results.filter(r => r.status === 200).length, 180);
  assert.equal(results.filter(r => r.status === 429).length, 5);
});

test('concurrent first-counter upserts retry without allowing requests past the limit', async () => {
  const { consumeRequest } = await import('../server/requestLimit.js');
  const calls = [];
  const collection = { findOneAndUpdate: async (filter, update, options) => {
    calls.push({ filter, update, options });
    if (calls.length === 1) throw Object.assign(new Error('Concurrent insert'), { code: 11000 });
    return { count: 181 };
  } };
  assert.equal(await consumeRequest(collection, 'private-counter', 180, new Date(0)), false);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].filter, { _id: 'private-counter' });
  assert.equal(calls[1].options.upsert, false);
  assert.equal(calls[1].options.returnDocument, 'after');
  assert.equal(calls[1].options.includeResultMetadata, false);
  assert.deepEqual(calls[1].update.$inc, { count: 1 });
});

test('class lesson summaries start independent reads together and exclude full questions', async () => {
  const { db, lesson } = await setup();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const starts = [];
  let projection;
  const original = db.lessons.find.bind(db.lessons);
  db.lessons.find = (filter, options) => {
    projection = options?.projection;
    const cursor = original(filter), read = cursor.toArray.bind(cursor);
    cursor.toArray = async () => { starts.push('lessons'); await gate; return read(); };
    return cursor;
  };
  db.lessonParts.find = () => ({ toArray: async () => { starts.push('progress'); return []; } });
  db.lessonCollections.findOne = async () => { starts.push('collection'); return null; };
  const request = lesson.request('/classes/c');
  await new Promise(resolve => setTimeout(resolve, 15));
  const beforeRelease = [...starts];
  release();
  assert.equal((await request).status, 200);
  assert.deepEqual(beforeRelease.sort(), ['collection', 'lessons', 'progress']);
  assert.equal(projection?.title, 1);
  assert.equal(projection?.vocabulary, undefined);
});

test('explicit provisioning is repeatable and preserves existing lesson content and results', async () => {
  const { provisionClassrooms } = await import('../server/provisionClassrooms.js');
  const db = memoryDb();
  await provisionClassrooms(db);
  assert.equal(db.lessonAssets.docs.length, 8);
  const lesson = db.lessons.docs[0];
  await db.lessons.updateOne({ _id: lesson._id }, { $set: { title: 'Teacher-approved content' } });
  await db.lessonParts.insertOne({ _id: 'saved', attempts: [{ score: 3 }] });
  await provisionClassrooms(db);
  assert.equal(db.lessons.docs.length, 1);
  assert.equal(db.lessons.docs[0].title, 'Teacher-approved content');
  assert.equal(db.lessonAssets.docs.length, 8);
  assert.deepEqual(db.lessonParts.docs[0].attempts, [{ score: 3 }]);
});
