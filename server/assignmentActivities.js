import { ClassroomError, requireText, validateAssignment } from './classroomDomain.js';
import { decodeAudio } from './lessonDomain.js';
import { validateWritingFeedback } from './lessonWriting.js';

const bilingual = (value, name, max) => ({
  en: requireText(value?.en, name, max),
  zh: requireText(value?.zh, `Chinese ${name}`, max, true),
});

// This wrapper leaves the legacy validator (also used by lessons) unchanged.
export function validateActivity(body) {
  if (body.format === undefined) return validateAssignment(body);
  if (body.format === 'quiz') {
    const quiz = validateAssignment(body, { caseSensitiveChoices: body.subject === 'grammar' });
    let learning;
    if (body.subject === 'grammar') {
      if (quiz.questions.length !== 3 || new Set(quiz.questions.map(q => q.prompt.normalize('NFKC').toLowerCase())).size !== 3)
        throw new ClassroomError('Grammar needs three distinct valid questions from the same concept.');
      learning = { description: bilingual(body.learning?.description, 'grammar explanation', 2000), rule: bilingual(body.learning?.rule, 'grammar rule and examples', 4000) };
    }
    if (body.subject === 'vocab') {
      if (!Array.isArray(body.learning?.words) || ![1, 5].includes(body.learning.words.length) || body.learning.words.length !== quiz.questions.length) throw new ClassroomError('Vocabulary needs one question per word.');
      learning = { words: body.learning.words.map(w => {
        const word = requireText(w.word, 'vocabulary word', 60);
        const meaningZh = requireText(w.meaningZh, 'Chinese meaning', 300);
        if (!/\p{Script=Han}/u.test(meaningZh)) throw new ClassroomError('Vocabulary needs a Chinese meaning.');
        return { word, meaningZh };
      }) };
    }
    return { ...quiz, format: 'quiz', ...(learning ? { learning } : {}) };
  }
  if (!['writing', 'speaking'].includes(body.format) || body.subject !== body.format || ![1, 2, 3].includes(body.level))
    throw new ClassroomError('Choose a valid activity format and level.');
  if (!Array.isArray(body.questions) || body.questions.length) throw new ClassroomError('Productive activities do not have quiz questions.');
  const activity = { title: requireText(body.title, 'assignment title', 120), instructions: requireText(body.instructions, 'instructions', 2000, true),
    passage: '', subject: body.subject, level: body.level, format: body.format, questions: [], maxAttempts: 3 };
  if (body.format === 'writing') activity.writing = { prompt: requireText(body.writing?.prompt, 'writing prompt', 600), promptZh: requireText(body.writing?.promptZh, 'Chinese writing prompt', 600, true) };
  else activity.speaking = { sentence: requireText(body.speaking?.sentence, 'speaking sentence', 280), hintZh: requireText(body.speaking?.hintZh, 'Chinese speaking instruction', 300, true) };
  return activity;
}

export function productiveInput(assignment, body) {
  return assignment.format === 'writing' ? { text: requireText(body.text, 'writing answer', 2000) } : decodeAudio(body);
}

export async function gradeProductive(assignment, input, { evaluateWriting, evaluateSpeech, authorization, timeoutMs = 25000 }) {
  const writing = assignment.format === 'writing';
  const controller = new AbortController();
  let timer;
  try {
    const evaluation = writing
      ? () => evaluateWriting?.({ text: input.text, prompt: assignment.writing.prompt, level: assignment.level, signal: controller.signal })
      : () => evaluateSpeech?.({ sentence: assignment.speaking.sentence, ...input, authorization, signal: controller.signal });
    const evaluated = await Promise.race([
      Promise.resolve().then(evaluation),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Evaluation timed out')); }, timeoutMs); }),
    ]);
    if (writing) {
      const { score, ...writingFeedback } = validateWritingFeedback(evaluated);
      return { text: input.text, score, total: 5, writingFeedback, automaticallyAssessed: true, reviewStatus: 'ai_feedback_available' };
    }
    if (!evaluated?.success || !Number.isInteger(evaluated.score) || evaluated.score < 0 || evaluated.score > 3 || typeof evaluated.feedback !== 'string' || !evaluated.feedback.trim())
      throw new Error('Invalid speech evaluation');
    return { ...input, score: evaluated.score, total: 3, feedback: evaluated.feedback.slice(0, 2000),
      ...(typeof evaluated.transcript === 'string' ? { transcript: evaluated.transcript.slice(0, 2000) } : {}),
      ...(typeof evaluated.speechDetected === 'boolean' ? { speechDetected: evaluated.speechDetected }
        : typeof evaluated.transcript === 'string' ? { speechDetected: !!evaluated.transcript.trim() } : {}),
      automaticallyAssessed: true };
  } catch {
    throw new ClassroomError(`${writing ? 'AI writing feedback' : 'Speech checking'} is temporarily unavailable. Your answer has not been saved and no attempt was used. Please try again.`, 503, writing ? 'writing_unavailable' : 'speech_unavailable');
  } finally { clearTimeout(timer); }
}

export function publicAssignmentAttempt({ audioBase64, audioMime, ...attempt }) {
  return { ...attempt, ...(audioBase64 || audioMime ? { hasAudio: true } : {}) };
}
