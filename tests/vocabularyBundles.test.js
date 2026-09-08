import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeCatalog } from '../server/practiceCatalog.js';
import { assignmentForStudent, gradeAssignment } from '../server/classroomDomain.js';
import { spreadAnswerChoices } from '../server/answerChoices.js';

test('mixed choice counts cannot all put the correct answer in A even with repeated random draws', () => {
  const mixed = [2, 3, 4].map(size => ({ correctIndex: 0, options: ['Right', 'Wrong', 'Other', 'Last'].slice(0, size) }));
  const result = spreadAnswerChoices(mixed, () => 0);
  assert.ok(new Set(result.map(q => q.correctIndex)).size > 1);
  result.forEach(q => assert.equal(q.options[q.correctIndex], 'Right'));
});

const vocab = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, word: `word${i}`, def: `意思${i}`, options: [`意思${i}`, '别的意思', '另一个意思'] }));
const data = () => ({ '1-2': { vocab: structuredClone(vocab), reading: [{ id: 1, title: { en: 'Reading' }, text: { en: 'A story.' }, questions: Array.from({ length: 8 }, (_, i) => ({ q: `Question ${i}?`, options: [`Right${i}`, 'Wrong1', 'Wrong2', 'Wrong3'], correct: 0 })) }] } });
const selection = source => ({ sourceId: source.id, sourceVersion: source.version, maxAttempts: 2 });

test('preview spreads correct positions, stays stable, and preserves grading after student choice mixing', () => {
  const catalog = createPracticeCatalog(data());
  const source = catalog.preview('1:reading:1');
  const counts = [0, 0, 0, 0];
  source.questions.forEach((q, i) => { counts[q.correctIndex]++; assert.equal(q.options[q.correctIndex], `Right${i}`); });
  assert.deepEqual(counts, [2, 2, 2, 2]);
  assert.deepEqual(createPracticeCatalog(data()).preview(source.id), source);
  const saved = catalog.assignment(selection(source));
  const original = structuredClone(saved);
  for (let run = 0; run < 20; run++) {
    const safe = assignmentForStudent(saved);
    const positions = [0, 0, 0, 0];
    const answers = safe.questions.map((q, i) => {
      positions[q.options.findIndex(o => o.text === `Right${i}`)]++;
      assert.equal(q.correctOptionId, undefined);
      assert.equal(q.correctIndex, undefined);
      return { questionId: q.id, optionId: q.options.find(o => o.text === `Right${i}`).id };
    });
    assert.deepEqual(positions, [2, 2, 2, 2]);
    assert.equal(gradeAssignment(saved, answers).score, 8);
  }
  assert.deepEqual(saved, original);
});

test('five-word bundles exclude old assignments and duplicated words across grade bands', () => {
  const input = data();
  input['1-2'].vocab.push({ ...vocab[0], id: 99, word: ' WORD0 ' });
  const catalog = createPracticeCatalog(input);
  const old = [{ subject: 'vocab', level: 3, title: 'WORD0', sourceId: '3:vocab:removed' }, { subject: 'vocab', learning: { words: [{ word: 'word1' }] } }];
  const { source, remaining } = catalog.vocabularyBundle(1, old);
  assert.equal(remaining, 10);
  assert.equal(source.learning.words.length, 5);
  assert.equal(source.questions.length, 5);
  assert.equal(new Set(source.learning.words.map(w => w.word.toLowerCase().trim())).size, 5);
  assert.ok(source.learning.words.every(w => !['word0', 'word1'].includes(w.word.toLowerCase().trim())));
  assert.deepEqual(catalog.preview(source.id), source);
  const saved = catalog.assignment(selection(source));
  assert.equal(saved.learning.words.length, 5);
  assert.equal(saved.questions.length, 5);
  const next = catalog.vocabularyBundle(1, [...old, saved]);
  assert.equal(next.remaining, 5);
  assert.ok(next.source.learning.words.every(w => !saved.learning.words.some(prior => prior.word === w.word)));
  assert.throws(() => catalog.vocabularyBundle(1, [...old, saved, catalog.assignment(selection(next.source))]), e => e.code === 'vocabulary_exhausted');
});

test('bundle references reject duplicates, cross-grade content, edited questions and obsolete versions', () => {
  const input = data();
  input['3-4'] = { vocab: [{ ...vocab[0], id: 30, word: 'advanced' }] };
  const catalog = createPracticeCatalog(input);
  const encode = ids => 'vocab-bundle:' + Buffer.from(JSON.stringify(ids)).toString('base64url');
  for (const ids of [[], ['1:vocab:1'], Array(5).fill('1:vocab:1'), ['1:vocab:1', '1:vocab:2', '1:vocab:3', '1:vocab:4', '2:vocab:30'], ['1:vocab:1', '1:vocab:2', '1:vocab:3', '1:vocab:4', '1:reading:1']])
    assert.throws(() => catalog.preview(encode(ids)), e => e.code === 'invalid_practice_source');
  const { source } = catalog.vocabularyBundle(1, []);
  assert.throws(() => catalog.assignment({ ...selection(source), questions: [] }), e => e.code === 'invalid_practice_source');
  input['1-2'].vocab.forEach(w => { w.def += '更新'; w.options[0] = w.def; });
  assert.throws(() => createPracticeCatalog(input).assignment(selection(source)), e => e.code === 'practice_source_changed');
});
