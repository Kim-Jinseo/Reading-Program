import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassReport } from './ClassReport';

test('teacher loads answer details only after selecting a student and assignment', async () => {
  const score = { score: 1, total: 1, submittedAt: '2026-09-05T10:00:00Z' };
  const report = { class: { id: 'class1' }, students: [{ id: 'student1', name: '小明', completed: 1, assigned: 1, averagePercent: 100, practice: {} }], assignments: [{ id: 'quiz1', title: 'The farm' }] };
  const api = jest.fn(async path => path.endsWith('/results')
    ? { results: [{ assignmentId: 'quiz1', count: 1, first: score, latest: score, best: score }] }
    : { assignment: { questions: [{ id: 'q1', prompt: 'What swims?', options: [{ id: 'duck', text: 'A duck' }], explanation: 'The duck swims.' }] }, attempts: [{ ...score, requestId: 'test-request', responses: [{ questionId: 'q1', optionId: 'duck', correctOptionId: 'duck', correct: true }] }] });
  render(<ClassReport report={report} lang="en" api={api} />);
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'View answers and attempts' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Load answers' }));
  await screen.findByText('Student answer: A duck');
  expect(api.mock.calls.map(([path]) => path)).toEqual(['/classes/class1/students/student1/results', '/assignments/quiz1/students/student1']);
});
