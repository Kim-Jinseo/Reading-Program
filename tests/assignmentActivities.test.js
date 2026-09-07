import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildReviewedCurriculum } from '../frontend/user-app/src/data/reviewedCurriculum.js';
import { createPracticeCatalog } from '../server/practiceCatalog.js';
import { assignmentForStudent, validateAssignment } from '../server/classroomDomain.js';

const curriculum = () => structuredClone(buildReviewedCurriculum(createRequire(import.meta.url)('../frontend/user-app/src/data/curriculum.json')));
test('all five subjects at each level offer canonical formats and productive attempt policy', () => {
  const catalog = createPracticeCatalog(curriculum());
  for (const level of [1, 2, 3]) for (const subject of ['reading', 'vocab', 'grammar', 'writing', 'speaking']) {
    const rows = catalog.list(level, subject);
    assert.ok(rows.length > 0, `${level}:${subject}`);
    const source = catalog.preview(rows[0].id);
    assert.equal(source.format, ['writing', 'speaking'].includes(subject) ? subject : 'quiz');
    const saved = catalog.assignment({ sourceId: source.id, sourceVersion: source.version, maxAttempts: 1 });
    assert.equal(saved.maxAttempts, ['writing', 'speaking'].includes(subject) ? 3 : 1);
    assert.equal(rows[0].questionCount, ['writing', 'speaking'].includes(subject) ? 0 : subject === 'grammar' ? 3 : source.questions.length);
    assert.equal(rows[0].format, source.format);
  }
  assert.equal(catalog.preview('1:speaking:231').speaking.sentence, 'Hello, how are you?');
  assert.ok(catalog.preview('1:writing:1001').writing.promptZh);
});
test('grammar retains learning with exactly three distinct same-concept checks; vocab reveals meanings not answer IDs', () => {
  const catalog = createPracticeCatalog(curriculum());
  const source = catalog.preview('1:grammar:201');
  assert.equal(source.questions.length, 3);
  assert.ok(source.learning.rule.en.includes('consonant'));
  assert.ok(source.learning.description.zh);
  assert.deepEqual(source.questions.map(q => q.prompt), ['I have ___ cat.', 'She sees ___ elephant.', 'He eats ___ red apple.']);
  const vocab = catalog.preview('1:vocab:1');
  const saved = catalog.assignment({ sourceId: vocab.id, sourceVersion: vocab.version });
  const safe = assignmentForStudent(saved);
  assert.deepEqual(safe.learning, { words: [{ word: 'his', meaningZh: '他的' }] });
  assert.equal(safe.format, 'quiz');
  assert.ok(!JSON.stringify(safe).includes('correctOptionId'));
  assert.ok(!JSON.stringify(safe).includes('correctIndex'));
});
test('unusable grammar is excluded with source-specific diagnostics without poisoning other sources', () => {
  const data = curriculum();
  delete data['1-2'].grammar[0].rule;
  data['1-2'].grammar[1].questions = [data['1-2'].grammar[1].questions[0]];
  const catalog = createPracticeCatalog(data);
  assert.ok(!catalog.list(1, 'grammar').some(s => ['1:grammar:201', '1:grammar:202'].includes(s.id)));
  assert.ok(catalog.validationErrors().some(e => e.sourceId === '1:grammar:201' && /rule/i.test(e.error)));
  assert.throws(() => catalog.preview('1:grammar:201'));
  assert.ok(catalog.list(1, 'reading').length);
});
test('grammar skips invalid and duplicate checks but never borrows a different concept', () => {
  const data = curriculum();
  const first = data['1-2'].grammar[0];
  first.questions.unshift(null, { q: 'Invalid type', options: 4 }, { q: 'Invalid', options: ['same', 'same'], a: 'same' }, first.questions[0]);
  const source = createPracticeCatalog(data).preview('1:grammar:201');
  assert.deepEqual(source.questions.map(q => q.prompt), ['I have ___ cat.', 'She sees ___ elephant.', 'He eats ___ red apple.']);
});
test('grammar finds its first three valid questions even after malformed older entries', () => {
  const data = curriculum();
  data['1-2'].grammar[0].questions.unshift(...Array.from({ length: 30 }, () => ({ q: 'Broken', options: [] })));
  const source = createPracticeCatalog(data).preview('1:grammar:201');
  assert.equal(source.questions.length, 3);
  assert.equal(source.questions[0].prompt, 'I have ___ cat.');
});
test('versions include learning and prompts and saved sources remain immutable and untamperable', () => {
  const data = curriculum();
  const original = createPracticeCatalog(data);
  for (const [subject, id, mutate] of [
    ['grammar', 201, item => { item.rule.en += ' Extra example.'; }],
    ['writing', 1001, item => { item.en += ' Be kind.'; }],
    ['speaking', 231, item => { item.en = 'Good morning.'; }],
  ]) {
    const source = original.preview(`1:${subject}:${id}`);
    const saved = original.assignment({ sourceId: source.id, sourceVersion: source.version });
    mutate(data['1-2'][subject][0]);
    const changed = createPracticeCatalog(data);
    assert.throws(() => changed.assignment({ sourceId: source.id, sourceVersion: source.version }), e => e.code === 'practice_source_changed');
    assert.throws(() => original.assignment({ sourceId: source.id, sourceVersion: source.version, score: 5 }));
    assert.equal(saved.sourceVersion, source.version);
    source.title = 'Tampered';
    assert.notEqual(original.preview(source.id).title, 'Tampered');
  }
});
test('legacy missing-format validation and serialization keep the original quiz path', () => {
  const saved = validateAssignment({ title: 'Legacy', subject: 'other', level: 1, maxAttempts: 2, questions: [{ prompt: 'Old?', options: ['Yes', 'No'], correctIndex: 1 }] });
  assert.equal(saved.format, undefined);
  assert.equal(assignmentForStudent(saved).maxAttempts, 2);
  assert.equal(assignmentForStudent(saved).questions[0].id, saved.questions[0].id);
  assert.throws(() => validateAssignment({ title: 'Legacy', subject: 'other', level: 1, maxAttempts: 2, questions: [] }));
});
