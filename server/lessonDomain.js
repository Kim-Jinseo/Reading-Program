import {
  ClassroomError,
  requireText,
  validateAssignment,
  assignmentForStudent,
  summarizeAttempts,
} from './classroomDomain.js';

export const PARTS = ['slides', 'vocabulary', 'speaking', 'writing', 'questions'];
const englishWord = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const chineseMeaning = text => typeof text === 'string' && /\p{Script=Han}/u.test(text) && !/[A-Za-z]/.test(text);
const legacyWord = prompt => /^What does [“"']?([A-Za-z]+(?:[ '-][A-Za-z]+)*)[”"']? mean\?$/i.exec(prompt || '')?.[1];
export function validateCollection(body) {
  if (
    !['spring', 'summer', 'autumn', 'winter'].includes(body.season) ||
    !Number.isInteger(body.year) ||
    body.year < 2020 ||
    body.year > 2100 ||
    ![1, 2, 3].includes(body.level)
  )
    throw new ClassroomError('Choose a season, year and learning level.');
  return { season: body.season, year: body.year, level: body.level };
}
export function validateLesson(body) {
  const questions = (items, min, max) => {
    if (!Array.isArray(items) || items.length < min || items.length > max)
      throw new ClassroomError(`Add ${min}–${max} questions for this activity.`);
    if (new Set(items.map((q) => q.prompt?.trim().toLowerCase())).size !== items.length)
      throw new ClassroomError('Use different questions in each activity.');
    for (const q of items) {
      if (Array.isArray(q.options) && new Set(q.options.map(o => String(o).normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, ''))).size !== q.options.length)
        throw new ClassroomError('Answer choices must be different, including punctuation and spacing.');
    }
    return validateAssignment({
      title: 'Lesson activity',
      subject: 'other',
      level: 1,
      maxAttempts: 3,
      questions: items,
    }).questions;
  };
  if (!Number.isInteger(body.number) || body.number < 1 || body.number > 100)
    throw new ClassroomError('Lesson number must be between 1 and 100.');
  const starters = body.writing?.starters;
  if (!Array.isArray(starters) || starters.length < 2 || starters.length > 4)
    throw new ClassroomError('Add 2–4 writing sentence starters.');
  return {
    title: requireText(body.title, 'lesson title', 120),
    titleZh: requireText(body.titleZh, 'Chinese title', 120),
    number: body.number,
    vocabulary: questions(Array.isArray(body.vocabulary) ? body.vocabulary.map(q => {
      if (q.word === undefined) return q; // Preserve existing draft formats.
      const word = requireText(q.word, 'English vocabulary word', 60);
      if (!englishWord.test(word)) throw new ClassroomError('Enter an English vocabulary word.');
      if (!Array.isArray(q.options) || !q.options.every(chineseMeaning))
        throw new ClassroomError('Use simple Chinese meanings for every vocabulary choice.');
      return { ...q, prompt: `What does “${word}” mean?` };
    }) : body.vocabulary, 3, 4).map((q, i) => ({ ...q, ...(body.vocabulary[i].word !== undefined ? { word: body.vocabulary[i].word.trim() } : {}) })),
    questions: questions(body.questions, 2, 3),
    speaking: {
      sentence: requireText(body.speaking?.sentence, 'speaking sentence', 280),
      hintZh: requireText(body.speaking?.hintZh, 'Chinese speaking instruction', 300),
    },
    writing: {
      prompt: requireText(body.writing?.prompt, 'writing prompt', 600),
      promptZh: requireText(body.writing?.promptZh, 'Chinese writing prompt', 600),
      starters: starters.map((s) => requireText(s, 'sentence starter', 120)),
    },
  };
}
export function safeLesson(row) {
  const safe = (questions) => assignmentForStudent({ questions }).questions;
  return {
    id: row._id,
    collectionId: row.collectionId,
    title: row.title,
    titleZh: row.titleZh,
    number: row.number,
    level: row.level,
    slides: row.slides,
    vocabulary: safe(row.vocabulary),
    // Learning meanings are intentionally public; quiz answer IDs and Quick
    // check keys remain hidden. Legacy content is mapped only when explicit.
    vocabularyWords: row.vocabulary.flatMap(q => {
      const word = q.word || legacyWord(q.prompt);
      const meaningZh = q.options.find(o => o.id === q.correctOptionId)?.text;
      return word && englishWord.test(word) && chineseMeaning(meaningZh) ? [{ word, meaningZh }] : [];
    }),
    questions: safe(row.questions),
    speaking: row.speaking,
    writing: row.writing,
  };
}
export function lessonSummary(parts) {
  const done = PARTS.filter((part) => parts.some((row) => row.part === part && row.attempts?.length));
  return {
    completed: done.length === PARTS.length,
    done,
    total: PARTS.length,
    scores: Object.fromEntries(
      parts
        .filter((row) => ['vocabulary', 'questions', 'speaking'].includes(row.part))
        .map((row) => [row.part, summarizeAttempts(row.attempts)]),
    ),
  };
}
export const publicParts = (rows) =>
  rows.map(({ part, attempts }) => ({
    part,
    attempts: attempts.map(({ audioBase64, audioMime, ...attempt }) => ({ ...attempt, hasAudio: !!audioBase64 })),
  }));
export function studyDays28(rows, now = new Date()) {
  const day = (date) => new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const start = day(new Date(now.getTime() - 27 * 86400000)),
    end = day(now);
  return new Set(
    rows
      .filter((r) => r.part !== 'slides')
      .flatMap((r) => r.attempts || [])
      .map((a) => day(a.submittedAt))
      .filter((d) => d >= start && d <= end),
  ).size;
}
export function decodeImage(body) {
  if (typeof body.data !== 'string' || body.data.length > 820000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.data))
    throw new ClassroomError('Upload a compressed slide under 600 KB.');
  const bytes = Buffer.from(body.data, 'base64');
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (
    bytes.length > 600000 ||
    bytes.length < 20 ||
    !((body.mime === 'image/jpeg' && jpeg) || (body.mime === 'image/webp' && webp))
  )
    throw new ClassroomError('Only compressed JPEG or WebP slides are accepted.');
  return { data: bytes.toString('base64'), bytes: bytes.length, mime: body.mime };
}
export function decodeAudio(body) {
  if (
    !['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'].includes(body.audioMime) ||
    typeof body.audioBase64 !== 'string' ||
    body.audioBase64.length > 2000000 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(body.audioBase64)
  )
    throw new ClassroomError('Record a short answer (up to 30 seconds).');
  const data = Buffer.from(body.audioBase64, 'base64');
  if (data.length < 100 || data.length > 1500000) throw new ClassroomError('The recording is empty or too large.');
  const valid =
    body.audioMime === 'audio/webm'
      ? data.subarray(0, 4).toString('hex') === '1a45dfa3'
      : body.audioMime === 'audio/mp4'
        ? data.toString('ascii', 4, 8) === 'ftyp'
        : body.audioMime === 'audio/ogg'
          ? data.toString('ascii', 0, 4) === 'OggS'
          : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WAVE';
  if (!valid) throw new ClassroomError('The audio format was not recognised. Record again.');
  return { audioBase64: data.toString('base64'), audioMime: body.audioMime };
}
