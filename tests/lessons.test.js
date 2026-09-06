import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { memoryDb } from './helpers/memoryDb.js';
import { createLessonRouter } from '../server/lessons.js';
import { validateCollection, validateLesson, lessonSummary, safeLesson } from '../server/lessonDomain.js';
import { sampleLesson } from '../server/sampleLesson.js';

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
const writingFeedback = { score: 4, feedback: 'You described your room clearly.', feedbackZh: '你清楚地介绍了教室。', corrections: 'Use “There are” for two desks.', correctionsZh: '两张课桌要用 There are。', improvement: 'Add why you like your classroom.', improvementZh: '加一句你为什么喜欢教室。' };
async function setup(overrides = {}) {
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
    evaluateWriting: async () => writingFeedback,
    ...overrides,
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

test('lesson writing uses the stored prompt and level, saves AI feedback, and rewards only once', async () => {
  const { submit, db } = await setup({ evaluateWriting: async ({ prompt, level, text }) => {
    assert.equal(prompt, 'What is in your classroom? Write three short sentences.');
    assert.equal(level, 2);
    assert.equal(text, 'I see two desks.');
    return writingFeedback;
  } });
  const input = { text: 'I see two desks.', prompt: 'Give me five.', level: 1, score: 5 };
  const first = await submit('writing', input);
  assert.equal(first.status, 200);
  assert.equal(first.body.attempt.score, 4);
  assert.equal(first.body.attempt.total, 5);
  assert.equal(first.body.attempt.writingFeedback.improvementZh, '加一句你为什么喜欢教室。');
  assert.equal(first.body.attempt.automaticallyAssessed, true);
  await submit('writing', input);
  const retry = await submit('writing', input, 'writing-retry-222');
  assert.equal(retry.body.attempt.rewardStars, 0);
  assert.equal(db.lessonParts.docs[0].attempts.length, 2);
  assert.equal(db.users.docs.find(u => String(u._id) === student).stars, 3);
});

test('missing, failed or malformed writing grading never saves a grade, attempt or reward', async () => {
  for (const evaluateWriting of [undefined, async () => { throw Error('offline'); }, async () => ({ ...writingFeedback, score: 9 }), async () => ({ ...writingFeedback, corrections: '' })]) {
    const { submit, db } = await setup({ evaluateWriting });
    const res = await submit('writing', { text: 'My room is big.' });
    assert.equal(res.status, 503);
    assert.equal(res.body.code, 'writing_unavailable');
    assert.equal(db.lessonParts.docs.length, 0);
    assert.equal(db.users.docs.find(u => String(u._id) === student).stars, undefined);
  }
});

test('speaking without a transcript preserves unknown detection rather than implying silence', async () => {
  const { submit } = await setup({ evaluateSpeech: async () => ({ success: true, score: 3, feedback: 'Clear speech.' }) });
  const res = await submit('speaking', { audioBase64: Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(120)]).toString('base64'), audioMime: 'audio/webm' });
  assert.equal(res.status, 200);
  assert.equal(res.body.attempt.transcript, undefined);
  assert.equal(res.body.attempt.speechDetected, undefined);
});
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

test('existing classroom vocabulary supplies learn-first words without changing questions or saved IDs', () => {
  const snapshot = structuredClone(sampleLesson);
  const safe = safeLesson(sampleLesson);
  assert.deepEqual(safe.vocabularyWords, [
    { word: 'desk', meaningZh: '课桌' }, { word: 'chair', meaningZh: '椅子' },
    { word: 'blackboard', meaningZh: '黑板' }, { word: 'fan', meaningZh: '风扇' },
  ]);
  assert.deepEqual(sampleLesson, snapshot);
  assert.ok(safe.vocabulary.every(q => !('correctOptionId' in q)));
  assert.ok(safe.questions.every(q => !('correctOptionId' in q)));
});

test('new vocabulary words create clear English prompts and Chinese study meanings', () => {
  const input = content();
  input.vocabulary = ['desk', 'chair', 'fan'].map((word, i) => ({ word, prompt: '',
    options: ['课桌', '椅子', '风扇'], correctIndex: i, explanation: '' }));
  const lesson = validateLesson(input);
  assert.equal(lesson.vocabulary[0].prompt, 'What does “desk” mean?');
  assert.deepEqual(safeLesson(lesson).vocabularyWords, [
    { word: 'desk', meaningZh: '课桌' }, { word: 'chair', meaningZh: '椅子' }, { word: 'fan', meaningZh: '风扇' },
  ]);
  input.vocabulary[0].options = ['课桌', '课桌。', '风扇'];
  assert.throws(() => validateLesson(input), /different/);
  input.vocabulary[0].options = ['desk', 'chair', 'fan'];
  assert.throws(() => validateLesson(input), /Chinese/);
  input.vocabulary[0].word = '课桌';
  assert.throws(() => validateLesson(input), /English/);
});

test('legacy non-word questions are not guessed into misleading vocabulary cards', () => {
  const lesson = validateLesson(content());
  assert.deepEqual(safeLesson(lesson).vocabularyWords, []);
});

test('each first lesson task earns three stars, even with wrong answers, up to fifteen', async () => {
  const { db, submit, lesson, req } = await setup();
  await db.users.updateOne({ _id: new ObjectId(student) }, { $set: { stars: 17, trophies: 23 } });
  const inputs = {
    slides: {},
    vocabulary: { answers: lesson.vocabulary.map(q => ({ questionId: q.id, optionId: q.options.find(o => o.id !== q.correctOptionId).id })) },
    questions: { answers: lesson.questions.map(q => ({ questionId: q.id, optionId: q.options.find(o => o.id !== q.correctOptionId).id })) },
    writing: { text: 'I see a desk.' },
    speaking: { audioBase64: Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(120)]).toString('base64'), audioMime: 'audio/webm' },
  };
  for (const [part, input] of Object.entries(inputs)) {
    const response = await submit(part, input);
    assert.equal(response.status, 200);
    assert.equal(response.body.attempt.rewardStars, 3);
    if (['vocabulary', 'questions'].includes(part)) assert.equal(response.body.attempt.score, 0);
    await submit(part, input); // An uncertain response can safely be replayed.
  }
  const account = await db.users.findOne({ _id: new ObjectId(student) });
  assert.equal(account.stars, 32);
  assert.equal(account.trophies, 38);
  assert.equal(account.lessonRewardStars, 15);
  const refreshed = await req('/classes/class/lessons/lesson');
  assert.equal(refreshed.body.parts.filter(p => p.attempts[0].rewardStars === 3).length, 5);
  assert.equal((await db.users.findOne({ _id: new ObjectId(student) })).stars, 32);
});

test('simultaneous retries reward a task only once and return the saved reward balance', async () => {
  const { db, submit } = await setup();
  const results = await Promise.all([1, 2, 3].map(n => submit('writing', { text: 'My desk is big.' }, `reward-attempt-${n}`)));
  assert.ok(results.every(r => r.status === 200));
  assert.deepEqual(results.map(r => r.body.attempt.rewardStars).sort(), [0, 0, 3]);
  assert.ok(results.every(r => r.body.lessonRewardStars === 3));
  assert.equal((await db.users.findOne({ _id: new ObjectId(student) })).stars, 3);
});

test('legacy completions, failed submissions, and teacher previews do not award stars', async () => {
  const { db, req, submit } = await setup();
  await db.users.updateOne({ _id: new ObjectId(student) }, { $set: { stars: 17, trophies: 23 } });
  const old = { requestId: 'legacy-request-123', text: 'Old answer.', submittedAt: new Date() };
  await db.lessonParts.insertOne({ _id: `class:lesson:${student}:writing`, classId: 'class', lessonId: 'lesson', studentId: student, part: 'writing', attempts: [old] });
  await req('/classes/class/lessons/lesson');
  await submit('writing', {}, old.requestId);
  const retry = await submit('writing', { text: 'New answer.' });
  assert.equal(retry.status, 200);
  assert.equal(retry.body.attempt.rewardStars, 0);
  assert.equal((await submit('vocabulary', { answers: [] })).status, 400);
  assert.equal((await req('/classes/class/lessons/lesson/parts/slides', teacher, { requestId: 'teacher-preview-123', revision: 0 })).status, 403);
  const account = await db.users.findOne({ _id: new ObjectId(student) });
  assert.equal(account.stars, 17);
  assert.equal(account.trophies, 23);
  assert.deepEqual(db.lessonParts.docs[0].attempts[0], old);
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
  for (const n of [2, 3]) assert.equal((await submit('vocabulary', { answers }, `request-123456789${n}`)).status, 409);
  assert.equal((await submit('vocabulary', { answers }, 'request-1234567894')).status, 409);
  const report = await req('/classes/class/report', teacher);
  assert.equal(report.body.students[0].studyDays28, 1);
  assert.equal(report.body.students[0].completed, 0);
});

test('vocabulary and quick check accept only one submission, including competing requests', async () => {
  for (const part of ['vocabulary', 'questions']) {
    const { submit, lesson, db } = await setup();
    const answers = lesson[part].map(q => ({ questionId: q.id, optionId: q.correctOptionId }));
    const results = await Promise.all([1, 2].map(n => submit(part, { answers }, `single-attempt-${n}`)));
    assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
    assert.equal(db.lessonParts.docs[0].attempts.length, 1);
  }
});

test('legacy multiple-choice results stay readable and replayable without allowing new attempts', async () => {
  const { submit, req, lesson, db } = await setup();
  const answers = lesson.questions.map(q => ({ questionId: q.id, optionId: q.correctOptionId }));
  const first = await submit('questions', { answers });
  const prior = db.lessonParts.docs[0];
  prior.attempts.push({ ...prior.attempts[0], requestId: 'legacy-attempt-2' });
  prior.attempts.push({ ...prior.attempts[0], requestId: 'legacy-attempt-3' });
  assert.equal((await submit('questions', { answers })).status, 200);
  assert.equal((await submit('questions', { answers }, 'new-attempt-444')).status, 409);
  const saved = (await req('/classes/class/lessons/lesson')).body.parts.find(p => p.part === 'questions');
  assert.equal(saved.attempts.length, 3);
  assert.equal(saved.attempts[0].score, first.body.attempt.score);
});

test('speaking and writing still allow three submitted attempts, not four', async () => {
  for (const part of ['writing', 'speaking']) {
    const { submit } = await setup();
    const data = part === 'writing' ? { text: 'I see a desk.' } : {
      audioBase64: Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(120)]).toString('base64'), audioMime: 'audio/webm'
    };
    for (const n of [1, 2, 3]) assert.equal((await submit(part, data, `retry-attempt-${n}`)).status, 200);
    assert.equal((await submit(part, data, 'retry-attempt-4')).status, 409);
  }
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
  assert.equal(restored.body.parts[0].attempts[0].score, 4);
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
