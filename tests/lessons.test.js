import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { memoryDb } from './helpers/memoryDb.js';
import { createLessonRouter } from '../server/lessons.js';
import { validateCollection, validateLesson, lessonSummary } from '../server/lessonDomain.js';

const admin = '444444444444444444444444',
  teacher = '111111111111111111111111',
  student = '222222222222222222222222',
  other = '333333333333333333333333';
const question = (n) => ({
  prompt: `What is in picture ${n}?`,
  options: ['A desk', 'A dog', 'A cup'],
  correctIndex: 0,
  explanation: 'It is a desk.',
});
const content = () => ({
  title: 'Our classroom',
  titleZh: '我们的教室',
  number: 1,
  vocabulary: [1, 2, 3, 4].map(question),
  questions: [5, 6, 7].map(question),
  speaking: { sentence: 'There is a desk in my classroom.', hintZh: '请读一读这个句子。' },
  writing: {
    prompt: 'What is in your classroom? Write three short sentences.',
    promptZh: '你的教室里有什么？请写三个短句。',
    starters: ['There is a ...', 'There are ...', 'I like ...'],
  },
});
async function setup() {
  const db = memoryDb();
  for (const [id, role] of [
    [admin, 'admin'],
    [teacher, 'teacher'],
    [student, 'student'],
    [other, 'teacher'],
  ])
    await db.users.insertOne({ _id: new ObjectId(id), role });
  await db.classes.insertOne({
    _id: 'class',
    ownerId: teacher,
    memberIds: [student],
    members: [{ id: student, name: '小明' }],
    collectionId: 'collection',
    lessonRevision: 0,
  });
  await db.lessonCollections.insertOne({ _id: 'collection', season: 'summer', year: 2026, level: 2 });
  await db.lessonCollections.insertOne({ _id: 'other-course', season: 'winter', year: 2026, level: 1 });
  const lesson = {
    ...validateLesson(content()),
    _id: 'lesson',
    collectionId: 'collection',
    level: 2,
    published: true,
    slides: [{ id: 'asset', alt: 'A classroom' }],
  };
  await db.lessons.insertOne(lesson);
  await db.lessonAssets.insertOne({ _id: 'asset', lessonId: 'lesson', mime: 'image/webp', data: '', bytes: 0 });
  let calls = 0;
  const app = createLessonRouter({
    getDb: async () => db,
    seed: false,
    requireAuth: async (c, next) => {
      const id = c.req.header('authorization');
      if (!id) return c.json({}, 401);
      c.set('user', { userId: id, role: 'admin' });
      await next();
    },
    evaluateSpeech: async ({ sentence }) => {
      calls++;
      assert.equal(sentence, lesson.speaking.sentence);
      return { success: true, score: 2, feedback: 'Good clear words.', transcript: sentence };
    },
  });
  const req = async (path, who = student, body) => {
    const res = await app.request(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { authorization: who, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: res.status,
      body: res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text(),
    };
  };
  const submit = (part, data = {}, id = 'request-1234567890') =>
    req(`/classes/class/lessons/lesson/parts/${part}`, student, { requestId: id, revision: 0, ...data });
  return { db, req, lesson, submit, calls: () => calls };
}
test('collection and activity validation requires bounded, distinct choices and correct keys', () => {
  assert.deepEqual(validateCollection({ season: 'summer', year: 2026, level: 2 }), {
    season: 'summer',
    year: 2026,
    level: 2,
  });
  assert.throws(() => validateCollection({ season: 'summer', year: 2026, level: 4 }));
  const body = content();
  body.questions[0].options = ['Desk', 'desk', 'Dog'];
  assert.throws(() => validateLesson(body));
  assert.equal(lessonSummary([]).completed, false);
});
test('all published lessons available immediately; no answer key or another class access', async () => {
  const { req } = await setup();
  const list = await req('/classes/class');
  assert.equal(list.status, 200);
  assert.equal(list.body.lessons.length, 1);
  const detail = await req('/classes/class/lessons/lesson');
  assert.equal(detail.status, 200);
  assert.ok(!JSON.stringify(detail.body).includes('correctOptionId'));
  assert.equal((await req('/classes/class', other)).status, 404);
  assert.equal((await req('/admin/collections', teacher, { season: 'summer', year: 2026, level: 3 })).status, 403);
  assert.equal((await req('/admin/lessons/lesson/assets', teacher, {})).status, 403);
});
test('server grades choices, accepts a replay once, caps retries and counts real study days', async () => {
  const { req, submit, lesson, db } = await setup();
  const answers = lesson.vocabulary.map((q) => ({ questionId: q.id, optionId: q.correctOptionId }));
  const saved = await submit('vocabulary', { answers, score: 0 });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.attempt.score, 4);
  await submit('vocabulary', { answers });
  assert.equal(db.lessonParts.docs[0].attempts.length, 1);
  for (const n of [2, 3]) assert.equal((await submit('vocabulary', { answers }, `request-123456789${n}`)).status, 200);
  assert.equal((await submit('vocabulary', { answers }, 'request-1234567894')).status, 409);
  const report = await req('/classes/class/report', teacher);
  assert.equal(report.body.students[0].studyDays28, 1);
  assert.equal(report.body.students[0].completed, 0);
});
test('course correction archives, rejects stale submissions, preserves work and restores original progress', async () => {
  const { req, submit } = await setup();
  await submit('writing', { text: 'There is a desk. I like my classroom. It is big.' });
  assert.equal(
    (await req('/classes/class/settings', teacher, { collectionId: 'other-course', revision: 0 })).status,
    200,
  );
  const changed = await req('/classes/class');
  assert.equal(changed.body.lessons.length, 0);
  assert.equal(changed.body.history.length, 1);
  assert.equal((await submit('writing', { text: 'Another answer.' }, 'request-9999999999')).status, 409);
  assert.equal((await req('/classes/class/lessons/lesson')).body.readOnly, true);
  assert.equal(
    (await req('/classes/class/settings', teacher, { collectionId: 'collection', revision: 0 })).status,
    409,
  );
  await req('/classes/class/settings', teacher, { collectionId: 'collection', revision: 1 });
  const restored = await req('/classes/class/lessons/lesson');
  assert.equal(restored.body.parts[0].attempts.length, 1);
  assert.equal(restored.body.parts[0].attempts[0].score, undefined);
});
test('slide access requires membership; teachers cannot submit student work', async () => {
  const { req } = await setup();
  assert.equal((await req('/classes/class/lessons/lesson/slides/asset', other)).status, 404);
  assert.equal(
    (await req('/classes/class/lessons/lesson/parts/slides', teacher, { requestId: 'request-1234567890', revision: 0 }))
      .status,
    403,
  );
});
test('uploading the final allowed slide is replayable after a lost response', async () => {
  const { db, req } = await setup();
  await db.lessons.updateOne(
    { _id: 'lesson' },
    { $set: { published: false, slides: Array.from({ length: 39 }, (_, n) => ({ id: `old-${n}`, alt: 'A slide' })) } },
  );
  const buffer = Buffer.alloc(30);
  buffer.write('RIFF', 0);
  buffer.write('WEBP', 8);
  const body = {
    data: buffer.toString('base64'),
    mime: 'image/webp',
    alt: 'Last slide',
    requestId: 'upload-last-12345',
  };
  assert.equal((await req('/admin/lessons/lesson/assets', admin, body)).status, 200);
  assert.equal((await req('/admin/lessons/lesson/assets', admin, body)).status, 200);
  assert.equal((await db.lessons.findOne({ _id: 'lesson' })).slides.length, 40);
});
test('speech target and score are server-owned and all five parts form completion', async () => {
  const { req, submit, lesson, calls } = await setup();
  const wav = Buffer.alloc(200);
  wav.write('RIFF');
  wav.write('WAVE', 8);
  const response = await submit('speaking', {
    audioBase64: wav.toString('base64'),
    audioMime: 'audio/wav',
    score: 3,
    sentence: 'forged target',
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.attempt.score, 2);
  assert.equal(response.body.attempt.audioBase64, undefined);
  assert.equal(calls(), 1);
  await submit('speaking', { audioBase64: wav.toString('base64'), audioMime: 'audio/wav' });
  assert.equal(calls(), 1);
  await submit('slides');
  await submit('writing', { text: 'My classroom is big. I see a desk. I like the pictures.' });
  for (const part of ['vocabulary', 'questions'])
    await submit(part, { answers: lesson[part].map((q) => ({ questionId: q.id, optionId: q.correctOptionId })) });
  const report = await req('/classes/class/report', teacher);
  assert.equal(report.body.students[0].completed, 1);
  assert.equal(report.body.students[0].studyDays28, 1);
  assert.ok(!JSON.stringify(report.body).includes('My classroom'));
});
test('revoked sessions and malformed image uploads fail without storing material', async () => {
  const { db, req } = await setup();
  await db.lessons.updateOne({ _id: 'lesson' }, { $set: { published: false } });
  assert.equal(
    (
      await req('/admin/lessons/lesson/assets', admin, {
        data: Buffer.from('<script>alert(1)</script>').toString('base64'),
        mime: 'image/webp',
        alt: 'Bad',
        requestId: 'upload-bad-12345',
      })
    ).status,
    400,
  );
  await db.users.updateOne({ _id: new ObjectId(student) }, { $set: { tokenVersion: 1 } });
  assert.equal((await req('/classes/class')).status, 401);
});
test('a course revision changed before the commit guard rejects the old answer', async () => {
  const { db, req, submit } = await setup();
  const transaction = db.withLessonTransaction;
  db.withLessonTransaction = async (work) => {
    await req('/classes/class/settings', teacher, { collectionId: 'other-course', revision: 0 });
    return transaction(work);
  };
  const saved = await submit('writing', { text: 'There is a desk.' });
  assert.equal(saved.status, 409);
  assert.equal(db.lessonParts.docs.length, 0);
});
test('an overlapping successful replay survives a subsequent course change', async () => {
  const { db, req, submit } = await setup();
  const transaction = db.withLessonTransaction;
  let overlap = true;
  db.withLessonTransaction = async (work) => {
    if (overlap) {
      overlap = false;
      await submit('writing', { text: 'Already saved answer.' });
      await req('/classes/class/settings', teacher, { collectionId: 'other-course', revision: 0 });
    }
    return transaction(work);
  };
  const replay = await submit('writing', { text: 'Already saved answer.' });
  assert.equal(replay.status, 200);
  assert.equal(db.lessonParts.docs[0].attempts.length, 1);
});
