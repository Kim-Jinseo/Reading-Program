import { createHash } from 'node:crypto';
import { ClassroomError } from './classroomDomain.js';
import { seededChoiceRandom, spreadAnswerChoices } from './answerChoices.js';

export const vocabularyKey = word => typeof word === 'string' ? word.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ') : '';
export const bundlePrefix = 'vocab-bundle:';
const invalid = () => new ClassroomError('Generate a five-word vocabulary bundle from website content.', 400, 'invalid_practice_source');

export function bundleFromId(id, sources) {
  let ids;
  try {
    if (id.length > 2000) throw invalid();
    ids = JSON.parse(Buffer.from(id.slice(bundlePrefix.length), 'base64url').toString('utf8'));
  } catch { throw invalid(); }
  if (!Array.isArray(ids) || ids.length !== 5 || new Set(ids).size !== 5 || ids.some(value => typeof value !== 'string')) throw invalid();
  const selected = ids.map(value => sources.get(value));
  if (selected.some(s => !s || s.subject !== 'vocab' || s.level !== selected[0].level)) throw invalid();
  const words = selected.map(s => s.learning.words[0]);
  if (new Set(words.map(w => vocabularyKey(w.word))).size !== 5) throw invalid();
  const title = 'Vocabulary: ' + words.map(w => w.word).join(', ');
  const source = { title: title.length <= 120 ? title : 'Vocabulary practice · 5 words', titleZh: '词汇练习 · 5 个单词',
    subject: 'vocab', level: selected[0].level, format: 'quiz', maxAttempts: 3,
    instructions: 'Learn the five word cards first, then answer five questions.', passage: '',
    learning: { words }, sourceIds: ids,
    questions: spreadAnswerChoices(selected.flatMap(s => s.questions), seededChoiceRandom(id)),
  };
  return structuredClone({ ...source, id, version: createHash('sha256').update(JSON.stringify(source)).digest('hex') });
}

// Read the saved snapshot first; older single-word assignments also stored the
// word as their title/source reference. Never alter historical assignments.
export function assignedVocabulary(assignments, sources) {
  const used = new Set();
  for (const a of assignments) {
    if (a.subject !== 'vocab') continue;
    const words = [...(a.learning?.words || []), ...(sources.get(a.sourceId)?.learning?.words || [])];
    words.forEach(w => used.add(vocabularyKey(w.word)));
    used.add(vocabularyKey(a.title));
    for (const q of a.questions || []) {
      const match = q.prompt?.match(/^What does [“"'](.+?)[”"'] mean\?/i);
      if (match) used.add(vocabularyKey(match[1]));
    }
  }
  used.delete('');
  return used;
}
