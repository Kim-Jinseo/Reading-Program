import { randomInt, randomUUID } from 'node:crypto';

export class ClassroomError extends Error {
  constructor(message, status = 400, code = 'invalid_input') { super(message); this.status = status; this.code = code; }
}
export const requireText = (value, name, max, optional = false) => {
  if (optional && (value === undefined || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)) {
    throw new ClassroomError(`Please enter a valid ${name} (up to ${max} characters).`);
  }
  return value.trim();
};

export function validateAssignment(body, { caseSensitiveChoices = false } = {}) {
  const title = requireText(body.title, 'assignment title', 120);
  const instructions = requireText(body.instructions, 'instructions', 2000, true);
  const passage = requireText(body.passage, 'lesson text', 12000, true);
  if (!['reading', 'vocab', 'grammar', 'other'].includes(body.subject) || ![1, 2, 3].includes(body.level)) throw new ClassroomError('Choose a subject and level.');
  if (![1, 2, 3].includes(body.maxAttempts)) throw new ClassroomError('Choose 1, 2 or 3 attempts.');
  if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > 30) throw new ClassroomError('Add between 1 and 30 questions.');
  const questions = body.questions.map(q => {
    const prompt = requireText(q?.prompt, 'question', 600);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) throw new ClassroomError('Each question needs 2 to 4 choices.');
    const texts = q.options.map(o => requireText(o, 'answer choice', 300));
    if (new Set(texts.map(o => caseSensitiveChoices ? o.normalize('NFKC') : o.normalize('NFKC').toLowerCase())).size !== texts.length) throw new ClassroomError('Answer choices must be different.');
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= texts.length) throw new ClassroomError('Select one correct answer for every question.');
    const options = texts.map(text => ({ id: randomUUID(), text }));
    return { id: randomUUID(), prompt, options, correctOptionId: options[q.correctIndex].id, explanation: requireText(q.explanation, 'explanation', 1000, true) };
  });
  return { title, instructions, passage, subject: body.subject, level: body.level, maxAttempts: body.maxAttempts, questions };
}

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = randomInt(i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function assignmentForStudent(assignment) {
  const { _id, classId, title, instructions, passage, subject, level, maxAttempts, createdAt } = assignment;
  return { id: _id, classId, title, instructions, passage, subject, level, maxAttempts, createdAt,
    questions: assignment.questions.map(({ id, prompt, options }) => ({ id, prompt, options: shuffled(options) })) };
}
export function gradeAssignment(assignment, answers) {
  if (!Array.isArray(answers) || answers.length !== assignment.questions.length || new Set(answers.map(a => a?.questionId)).size !== answers.length) throw new ClassroomError('Answer every question once before submitting.');
  const responses = assignment.questions.map(q => {
    const answer = answers.find(a => a?.questionId === q.id);
    if (!answer || !q.options.some(o => o.id === answer.optionId)) throw new ClassroomError('Choose a valid answer for every question.');
    return { questionId: q.id, optionId: answer.optionId, correctOptionId: q.correctOptionId, correct: answer.optionId === q.correctOptionId };
  });
  return { score: responses.filter(r => r.correct).length, total: responses.length, responses };
}
export function summarizeAttempts(attempts = []) {
  if (!attempts.length) return { count: 0, first: null, latest: null, best: null };
  const brief = a => ({ score: a.score, total: a.total, submittedAt: a.submittedAt });
  return { count: attempts.length, first: brief(attempts[0]), latest: brief(attempts.at(-1)), best: brief(attempts.reduce((best, a) => a.score > best.score ? a : best)) };
}
