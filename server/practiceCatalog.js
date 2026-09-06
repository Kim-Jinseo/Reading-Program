import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { buildReviewedCurriculum } from '../frontend/user-app/src/data/reviewedCurriculum.js';
import { ClassroomError, validateAssignment } from './classroomDomain.js';

const gradeKeys = { 1: '1-2', 2: '3-4', 3: '5-6' };
const subjects = ['reading', 'vocab', 'grammar'];
const invalidSource = () => new ClassroomError('Choose existing website content for extra practice.', 400, 'invalid_practice_source');

export function createPracticeCatalog(curriculum) {
  const sources = new Map();
  for (const level of [1, 2, 3]) {
    for (const subject of subjects) {
      for (const item of curriculum[gradeKeys[level]]?.[subject] || []) {
        const rawQuestions = subject === 'vocab'
          ? [{ q: `What does “${item.word}” mean?`, options: item.options, a: item.answer || item.def }]
          : item.questions;
        const definition = {
          title: item.title?.en || item.word,
          subject, level,
          instructions: subject === 'reading' ? 'Read the passage and choose one answer for each question.' : 'Choose the correct answer for each question.',
          passage: subject === 'reading' ? item.text?.en : '',
          questions: (rawQuestions || []).slice(0, 30).map(q => ({
            prompt: q.q || q.question,
            options: q.options,
            correctIndex: Number.isInteger(q.correct) ? q.correct : (q.options || []).indexOf(q.a || q.answer),
            explanation: typeof q.explanation === 'string' ? q.explanation : q.explanation?.en || '',
          })),
        };
        // Check the canonical source before offering it; never silently drop
        // malformed questions or let the browser supply a replacement key.
        validateAssignment({ ...definition, maxAttempts: 3 }, { caseSensitiveChoices: subject === 'grammar' });
        const id = `${level}:${subject}:${item.id}`;
        if (item.id === undefined || sources.has(id)) throw new Error(`Duplicate or missing practice source ID: ${id}`);
        const version = createHash('sha256').update(JSON.stringify(definition)).digest('hex');
        sources.set(id, { ...definition, id, version, titleZh: item.title?.zh || item.word, difficulty: item.difficulty || null });
      }
    }
  }
  return {
    list(level, subject) {
      if (![1, 2, 3].includes(level) || !subjects.includes(subject)) throw invalidSource();
      return [...sources.values()].filter(s => s.level === level && s.subject === subject)
        .map(({ id, title, titleZh, difficulty, questions }) => ({ id, title, titleZh, difficulty, questionCount: questions.length }));
    },
    preview(id) {
      if (typeof id !== 'string' || !sources.has(id)) throw invalidSource();
      return structuredClone(sources.get(id));
    },
    assignment(body) {
      if (Object.keys(body).some(key => !['sourceId', 'sourceVersion', 'maxAttempts'].includes(key))) throw invalidSource();
      const source = this.preview(body.sourceId);
      if (body.sourceVersion !== source.version) throw new ClassroomError('This content has changed. Preview it again before assigning.', 409, 'practice_source_changed');
      return { ...validateAssignment({ ...source, maxAttempts: body.maxAttempts ?? 3 }, { caseSensitiveChoices: source.subject === 'grammar' }), sourceId: source.id, sourceVersion: source.version };
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
