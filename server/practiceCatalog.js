import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { buildReviewedCurriculum } from '../frontend/user-app/src/data/reviewedCurriculum.js';
import { ClassroomError, validateAssignment } from './classroomDomain.js';
import { validateActivity } from './assignmentActivities.js';
import { shuffledChoices, spreadAnswerChoices, seededChoiceRandom } from './answerChoices.js';
import { assignedVocabulary, bundleFromId, bundlePrefix, vocabularyKey } from './vocabularyBundles.js';

const gradeKeys = { 1: '1-2', 2: '3-4', 3: '5-6' };
const subjects = ['reading', 'vocab', 'grammar', 'writing', 'speaking'];
const invalidSource = () => new ClassroomError('Choose existing website content for extra practice.', 400, 'invalid_practice_source');

export function createPracticeCatalog(curriculum) {
  const sources = new Map();
  const errors = [];
  const seen = new Set();
  for (const level of [1, 2, 3]) {
    for (const subject of subjects) {
      for (const item of curriculum[gradeKeys[level]]?.[subject] || []) {
        const id = `${level}:${subject}:${item.id}`;
        if (item.id === undefined || seen.has(id)) throw new Error(`Duplicate or missing practice source ID: ${id}`);
        seen.add(id);
        try {
        const rawQuestions = subject === 'vocab'
          ? [{ q: `What does “${item.word}” mean?`, options: item.options, a: item.answer || item.def }]
          : item.questions;
        const definition = {
          title: item.title?.en || item.word || item.en?.slice(0, 120),
          subject, level,
          format: ['writing', 'speaking'].includes(subject) ? subject : 'quiz',
          instructions: subject === 'reading' ? 'Read the passage and choose one answer for each question.' : subject === 'writing' ? 'Write your answer, then submit for feedback.' : subject === 'speaking' ? 'Record the sentence, listen, then submit for feedback.' : 'Learn first, then choose the correct answer for each question.',
          passage: subject === 'reading' ? item.text?.en : '',
          ...(subject === 'grammar' ? { learning: { description: item.desc, rule: item.rule } } : {}),
          ...(subject === 'vocab' ? { learning: { words: [{ word: item.word, meaningZh: item.def }] } } : {}),
          ...(subject === 'writing' ? { writing: { prompt: item.en, promptZh: item.zh } } : {}),
          ...(subject === 'speaking' ? { speaking: { sentence: item.en, hintZh: item.zh } } : {}),
          questions: (subject === 'grammar' ? rawQuestions || [] : (rawQuestions || []).slice(0, 30)).map(q => ({
            prompt: q?.q || q?.question,
            options: q?.options,
            correctIndex: Number.isInteger(q?.correct) ? q.correct : (Array.isArray(q?.options) ? q.options.indexOf(q.a || q.answer) : -1),
            explanation: typeof q?.explanation === 'string' ? q.explanation : q?.explanation?.en || '',
          })),
        };
        if (subject === 'grammar') {
          const distinct = new Set();
          definition.questions = definition.questions.filter(q => {
            try { validateAssignment({ ...definition, maxAttempts: 3, questions: [q] }, { caseSensitiveChoices: true }); }
            catch { return false; }
            const key = q.prompt.trim().normalize('NFKC').toLowerCase();
            if (distinct.has(key)) return false;
            distinct.add(key); return true;
          }).slice(0, 3);
        }
        const normalized = validateActivity({ ...definition, maxAttempts: 3 });
        // Hash normalized content, not freshly generated question/option IDs.
        normalized.questions = normalized.questions.map(q => ({ prompt: q.prompt, options: q.options.map(o => o.text), correctIndex: q.options.findIndex(o => o.id === q.correctOptionId), explanation: q.explanation }));
        normalized.questions = spreadAnswerChoices(normalized.questions, seededChoiceRandom(id));
        const metadata = { titleZh: item.title?.zh || item.zh?.slice(0, 120) || item.word, difficulty: item.difficulty || null };
        const version = createHash('sha256').update(JSON.stringify({ ...normalized, ...metadata })).digest('hex');
        sources.set(id, { ...normalized, ...metadata, id, version });
        } catch (error) {
          if (!(error instanceof ClassroomError)) throw error;
          errors.push({ sourceId: id, error: error.message, code: error.code });
        }
      }
    }
  }
  return {
    validationErrors() { return structuredClone(errors); },
    list(level, subject) {
      if (![1, 2, 3].includes(level) || !subjects.includes(subject)) throw invalidSource();
      return [...sources.values()].filter(s => s.level === level && s.subject === subject)
        .map(({ id, title, titleZh, difficulty, questions, format }) => ({ id, title, titleZh, difficulty, format, questionCount: questions.length }));
    },
    preview(id) {
      if (typeof id === 'string' && id.startsWith(bundlePrefix)) return bundleFromId(id, sources);
      if (typeof id !== 'string' || !sources.has(id)) throw invalidSource();
      return structuredClone(sources.get(id));
    },
    vocabularyBundle(level, assignments) {
      if (![1, 2, 3].includes(level)) throw invalidSource();
      const used = assignedVocabulary(assignments, sources);
      const unique = new Map();
      for (const s of sources.values()) if (s.subject === 'vocab' && s.level === level) {
        const key = vocabularyKey(s.learning.words[0].word);
        if (!used.has(key) && !unique.has(key)) unique.set(key, s.id);
      }
      if (unique.size < 5) throw new ClassroomError(`Only ${unique.size} unused vocabulary words remain in this grade band. Five are needed for a new bundle. Previously assigned words will not be repeated.`, 409, 'vocabulary_exhausted');
      const ids = shuffledChoices([...unique.values()]).slice(0, 5);
      const id = bundlePrefix + Buffer.from(JSON.stringify(ids)).toString('base64url');
      return { source: this.preview(id), remaining: unique.size };
    },
    assertVocabularyUnused(assignment, previous) {
      if (assignment.subject !== 'vocab') return;
      if (!assignment.sourceId?.startsWith(bundlePrefix) || assignment.learning?.words.length !== 5) throw invalidSource();
      const used = assignedVocabulary(previous, sources);
      if (assignment.learning.words.some(w => used.has(vocabularyKey(w.word))))
        throw new ClassroomError('Some words in this bundle have already been assigned to this class. Generate a new bundle.', 409, 'vocabulary_overlap');
    },
    assignment(body) {
      if (Object.keys(body).some(key => !['sourceId', 'sourceVersion', 'maxAttempts'].includes(key))) throw invalidSource();
      const source = this.preview(body.sourceId);
      if (body.sourceVersion !== source.version) throw new ClassroomError('This content has changed. Preview it again before assigning.', 409, 'practice_source_changed');
      return { ...validateActivity({ ...source, maxAttempts: body.maxAttempts ?? 3 }), sourceId: source.id, sourceVersion: source.version };
    },
  };
}

let catalog;
export function getPracticeCatalog() {
  if (!catalog) {
    const require = createRequire(import.meta.url);
    catalog = createPracticeCatalog(buildReviewedCurriculum(require('../frontend/user-app/src/data/curriculum.json')));
  }
  return catalog;
}
