import { createHash, randomInt } from 'node:crypto';

export function shuffledChoices(items, random = randomInt) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A catalog preview must keep its order/version across server instances.
export function seededChoiceRandom(seed) {
  let index = 0;
  return max => createHash('sha256').update(`${seed}:${index++}`).digest().readUInt32BE(0) % max;
}

// Balance the available positions across questions with 2, 3 or 4 options. Only move
// choices, never question IDs, option IDs or the identity of the correct answer.
export function spreadAnswerChoices(questions, random = randomInt) {
  const counts = [0, 0, 0, 0];
  return questions.map(q => {
    const size = q.options.length;
    const used = counts.slice(0, size);
    const least = Math.min(...used);
    const available = used.flatMap((count, i) => count === least ? [i] : []);
    const position = available[random(available.length)];
    counts[position]++;
    const indexed = Number.isInteger(q.correctIndex);
    const correctIndex = indexed ? q.correctIndex : q.options.findIndex(o => o.id === q.correctOptionId);
    const options = shuffledChoices(q.options.filter((_, i) => i !== correctIndex), random);
    options.splice(position, 0, q.options[correctIndex]);
    return { ...q, options, ...(indexed ? { correctIndex: position } : {}) };
  });
}
