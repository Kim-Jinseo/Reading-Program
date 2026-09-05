import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignmentPlayer } from './AssignmentPlayer';
import { randomFillSync } from 'crypto';

// This older jsdom lacks the Web Crypto API provided by HTTPS browsers.
Object.defineProperty(window, 'crypto', { value: { getRandomValues: randomFillSync }, configurable: true });

const lesson = { id: 'quiz1', title: 'At the farm', instructions: 'Read and choose.', passage: 'A duck swims.', maxAttempts: 2, questions: [
  { id: 'q1', prompt: 'What swims?', options: [{ id: 'a', text: 'A duck' }, { id: 'b', text: 'A hen' }] }
] };
test('selection can change before submit and only submission sends the chosen answer', async () => {
  const calls = [];
  const api = async (path, body) => { calls.push({ path, body }); return { attempt: { score: 0, total: 1, requestId: body.requestId, submittedAt: '2026-09-05T10:00:00Z', responses: [{ questionId: 'q1', optionId: 'b', correctOptionId: 'a', correct: false }] } }; };
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('radio', { name: /A hen/ }));
  expect(calls).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Submit assignment' }));
  await screen.findByText('0 / 1 correct');
  expect(calls[0].body.answers).toEqual([{ questionId: 'q1', optionId: 'b' }]);
  expect(screen.getByText(/Correct answer: A duck/)).toBeInTheDocument();
});
test('an incomplete assignment cannot be submitted', () => {
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={async () => { throw Error(); }} lang="en" onBack={() => {}} />);
  expect(screen.getByRole('button', { name: 'Submit assignment' })).toBeDisabled();
});
test('a network retry keeps its submission identifier and selected answer', async () => {
  const calls = [];
  const api = async (path, body) => { calls.push(body); throw Error('Network unavailable'); };
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit assignment' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }));
  await waitFor(() => expect(calls).toHaveLength(2));
  expect(calls[0].requestId).toBe(calls[1].requestId);
  expect(calls[0].answers).toEqual(calls[1].answers);
});
test('a completed assignment has no retry when the teacher allows one attempt', () => {
  render(<AssignmentPlayer data={{ assignment: { ...lesson, maxAttempts: 1 }, attempts: [{ score: 1, total: 1, responses: [], submittedAt: '2026-09-05T10:00:00Z' }] }} api={async () => {}} lang="zh" onBack={() => {}} />);
  expect(screen.getByText('答对 1 / 1 题')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /再试一次/ })).not.toBeInTheDocument();
});
test('an attempt used in another tab shows saved results instead of an endless save retry', async () => {
  const saved = { score: 1, total: 1, responses: [], submittedAt: '2026-09-05T10:00:00Z' };
  const api = async (path, body) => {
    if (body) throw Object.assign(new Error('No attempts left'), { code: 'attempt_limit' });
    return { assignment: { ...lesson, maxAttempts: 1 }, attempts: [saved], review: [] };
  };
  render(<AssignmentPlayer data={{ assignment: { ...lesson, maxAttempts: 1 }, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit assignment' }));
  await screen.findByText('1 / 1 correct');
  expect(screen.queryByRole('button', { name: 'Retry saving' })).not.toBeInTheDocument();
});
