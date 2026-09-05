import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonPlayer } from './LessonPlayer';
jest.mock('./SlideViewer', () => ({
  SlideViewer: ({ onViewedAll }) => <button onClick={onViewedAll}>View all sample slides</button>,
}));
jest.mock('./LessonSpeaking', () => ({ LessonSpeaking: () => <p>Recorder</p> }));
const q = {
  id: 'q',
  prompt: 'What does desk mean?',
  options: [
    { id: 'a', text: '课桌' },
    { id: 'b', text: '风扇' },
    { id: 'c', text: '椅子' },
  ],
};
const initial = {
  revision: 0,
  readOnly: false,
  parts: [],
  lesson: {
    id: 'l',
    title: 'Our classroom',
    titleZh: '我们的教室',
    number: 1,
    slides: [],
    vocabulary: [q],
    questions: [q],
    speaking: { sentence: 'I see a desk.' },
    writing: {
      prompt: 'Write three sentences. What do you like? Why?',
      promptZh: '写三个句子。你喜欢什么？为什么？',
      starters: ['I see ...', 'I like ...'],
    },
  },
};
beforeEach(() => {
  window.confirm = jest.fn(() => true);
});
test('opening slides is not completion; submit only after explicitly viewing every slide', async () => {
  const api = jest.fn(async () => ({ attempt: { requestId: 'saved1', submittedAt: new Date().toISOString() } }));
  render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} />);
  expect(screen.getByRole('button', { name: 'I have reviewed all slides' })).toBeDisabled();
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('View all sample slides'));
  fireEvent.click(screen.getByRole('button', { name: 'I have reviewed all slides' }));
  await screen.findByText('Saved work');
  expect(api.mock.calls[0][0]).toBe('/classes/c/lessons/l/parts/slides');
});
test('choice clicks stay editable; server results are saved only on submit', async () => {
  const api = jest.fn(async () => ({
    attempt: {
      requestId: 'saved1',
      score: 0,
      total: 1,
      submittedAt: new Date().toISOString(),
      responses: [{ questionId: 'q', optionId: 'b', correctOptionId: 'a', correct: false }],
    },
  }));
  render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} />);
  fireEvent.click(screen.getByRole('button', { name: 'Vocabulary' }));
  fireEvent.click(screen.getByLabelText('A. 课桌'));
  fireEvent.click(screen.getByLabelText('B. 风扇'));
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  await screen.findByText('0 / 1');
  expect(api.mock.calls[0][1].answers).toEqual([{ questionId: 'q', optionId: 'b' }]);
});
test('uncertain save retries the same answer and ID, and teacher history is read-only', async () => {
  const api = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network failed'))
    .mockResolvedValue({
      attempt: { requestId: 'saved1', text: 'I see a desk.', submittedAt: new Date().toISOString() },
    });
  const { unmount } = render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} />);
  fireEvent.click(screen.getByRole('button', { name: 'Writing' }));
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'I see a desk.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Retry saving this answer' }));
  await screen.findByText('Saved work');
  expect(api.mock.calls[0][1]).toEqual(api.mock.calls[1][1]);
  unmount();
  render(
    <LessonPlayer
      data={{ ...initial, readOnly: true, isOwner: true }}
      classId="c"
      lang="en"
      onBack={() => {}}
      api={api}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Writing' }));
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Submit this activity' })).not.toBeInTheDocument();
});
