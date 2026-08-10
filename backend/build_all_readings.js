import fs from 'fs';
import { readingsG12 } from './readings_g12.js';
import { readingsG34 } from './readings_g34.js';
import { readingsG56 } from './readings_g56.js';

const frontendPath = '../frontend/user-app/src/data/curriculum.json';
const backendPath = './curriculum.json';

const curriculum = JSON.parse(fs.readFileSync(frontendPath, 'utf8'));

console.log('Validating all 180 reading passages before build...');

const allPacks = [
  { grade: '1-2', passages: readingsG12 },
  { grade: '3-4', passages: readingsG34 },
  { grade: '5-6', passages: readingsG56 }
];

let totalPassages = 0;
let totalQuestions = 0;
let errors = [];

allPacks.forEach(({ grade, passages }) => {
  if (passages.length !== 60) {
    errors.push(`Grade ${grade} does not have exactly 60 passages (found ${passages.length})`);
  }

  const diffCounts = { easy: 0, medium: 0, hard: 0, super_hard: 0 };
  const expectedQCounts = { easy: 3, medium: 4, hard: 5, super_hard: 6 };

  passages.forEach((p, index) => {
    totalPassages++;
    diffCounts[p.difficulty] = (diffCounts[p.difficulty] || 0) + 1;

    if (p.dayIndex !== index) {
      errors.push(`Grade ${grade} passage ID ${p.id} has dayIndex ${p.dayIndex}, expected ${index}`);
    }

    if (!p.title || !p.title.en || !p.title.zh) {
      errors.push(`Grade ${grade} passage ID ${p.id} missing title.en/zh`);
    }

    if (!p.text || !p.text.en || !p.text.zh) {
      errors.push(`Grade ${grade} passage ID ${p.id} missing text.en/zh`);
    }

    const expectedQ = expectedQCounts[p.difficulty];
    if (!p.questions || p.questions.length !== expectedQ) {
      errors.push(`Grade ${grade} passage ID ${p.id} (${p.difficulty}) has ${p.questions?.length} questions, expected ${expectedQ}`);
    }

    p.questions.forEach((q, qIdx) => {
      totalQuestions++;
      if (!q.q) {
        errors.push(`Grade ${grade} passage ID ${p.id} Q${qIdx} missing question text`);
      }
      if (!q.options || q.options.length !== 4) {
        errors.push(`Grade ${grade} passage ID ${p.id} Q${qIdx} does not have 4 options`);
      }
      if (q.correct === undefined || q.correct < 0 || q.correct > 3) {
        errors.push(`Grade ${grade} passage ID ${p.id} Q${qIdx} invalid correct index (${q.correct})`);
      }
      if (new Set(q.options).size !== 4) {
        errors.push(`Grade ${grade} passage ID ${p.id} Q${qIdx} has duplicate options`);
      }
    });
  });

  if (diffCounts.easy !== 25 || diffCounts.medium !== 15 || diffCounts.hard !== 10 || diffCounts.super_hard !== 10) {
    errors.push(`Grade ${grade} difficulty breakdown mismatch: ${JSON.stringify(diffCounts)}`);
  }
});

if (errors.length > 0) {
  console.error('BUILD FAILED WITH ERRORS:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
}

console.log(`Validation SUCCESS! Checked ${totalPassages} passages and ${totalQuestions} questions with 0 errors.`);

// Update curriculum JSON
curriculum['1-2'].reading = readingsG12;
curriculum['3-4'].reading = readingsG34;
curriculum['5-6'].reading = readingsG56;

fs.writeFileSync(frontendPath, JSON.stringify(curriculum, null, 2), 'utf8');
fs.writeFileSync(backendPath, JSON.stringify(curriculum, null, 2), 'utf8');

console.log(`Successfully updated ${frontendPath} and ${backendPath} with 180 brand new reading passages!`);
