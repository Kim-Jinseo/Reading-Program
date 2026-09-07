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

test('teacher reviews productive writing and speaking feedback without student controls', async () => {
  const summary = value => ({ score: value, total: value === 3 ? 3 : 5, submittedAt: '2026-09-07T10:00:00Z' });
  const report = {
    class: { id: 'class1' }, students: [{ id: 'student1', name: '小明', completed: 2, assigned: 2, averagePercent: 90, practice: {} }],
    assignments: [{ id: 'write1', title: 'My room', format: 'writing' }, { id: 'speak1', title: 'Read aloud', format: 'speaking' }],
  };
  const api = jest.fn(async path => {
    if (path.endsWith('/results')) return { results: [
      { assignmentId: 'write1', count: 1, first: summary(4), latest: summary(4), best: summary(4) },
      { assignmentId: 'speak1', count: 1, first: summary(3), latest: summary(3), best: summary(3) },
    ] };
    if (path.includes('/write1/')) return { assignment: { id: 'write1', title: 'My room', format: 'writing', maxAttempts: 3, writing: { prompt: 'Describe your room.', promptZh: '描述你的房间。' }, questions: [] }, attempts: [{ requestId: 'w1', submittedAt: '2026-09-07T10:00:00Z', score: 4, total: 5, text: 'My room is bright.', writingFeedback: { feedback: 'Clear description.', corrections: 'Add an article.', improvement: 'Add one detail.' } }] };
    return { assignment: { id: 'speak1', title: 'Read aloud', format: 'speaking', maxAttempts: 3, speaking: { sentence: 'I see a desk.', hintZh: '我看到一张课桌。' }, questions: [] }, attempts: [{ requestId: 's1', submittedAt: '2026-09-07T10:00:00Z', score: 3, total: 3, feedback: 'Clear speech.', hasAudio: true }] };
  });
  render(<ClassReport report={report} lang="en" api={api} profileStudentId="student1" />);
  const loads = await screen.findAllByRole('button', { name: 'Load work' });
  fireEvent.click(loads[0]);
  expect(await screen.findByText('Describe your room.')).toBeInTheDocument();
  expect(screen.getByText('My room is bright.')).toBeInTheDocument();
  expect(screen.getByText('Clear description.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load work' }));
  expect(await screen.findAllByText('I see a desk.')).toHaveLength(2);
  expect(screen.getByText('Clear speech.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Record \(/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Submit/ })).not.toBeInTheDocument();
});

test('teacher recording playback uses the protected classroom route and revokes its object URL', async () => {
  const original = { fetch: global.fetch, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  global.fetch = jest.fn(async () => ({ ok: true, blob: async () => new Blob(['voice'], { type: 'audio/webm' }) }));
  URL.createObjectURL = jest.fn(() => 'blob:teacher-audio'); URL.revokeObjectURL = jest.fn();
  localStorage.setItem('token', 'teacher-session');
  const score = { score: 2, total: 3, submittedAt: '2026-09-07T10:00:00Z' };
  const report = { class: { id: 'class1' }, students: [{ id: 'student1', name: '小明', completed: 1, assigned: 1, averagePercent: 67, practice: {} }], assignments: [{ id: 'speak1', title: 'Read aloud', format: 'speaking' }] };
  const api = jest.fn(async path => path.endsWith('/results') ? { results: [{ assignmentId: 'speak1', count: 1, first: score, latest: score, best: score }] } : { assignment: { id: 'speak1', title: 'Read aloud', format: 'speaking', maxAttempts: 3, speaking: { sentence: 'I see a desk.' }, questions: [] }, attempts: [{ ...score, requestId: 'voice1', feedback: 'Keep practicing.', hasAudio: true }] });
  try {
    const view = render(<ClassReport report={report} lang="en" api={api} profileStudentId="student1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Load work' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Listen to saved recording' }));
    expect(await screen.findByLabelText('Saved recording')).toHaveAttribute('src', 'blob:teacher-audio');
    expect(global.fetch).toHaveBeenCalledWith('/api/classroom/assignments/speak1/audio/voice1?studentId=student1', expect.objectContaining({ headers: { Authorization: 'Bearer teacher-session' } }));
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:teacher-audio');
  } finally {
    global.fetch = original.fetch; URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke; localStorage.clear();
  }
});
