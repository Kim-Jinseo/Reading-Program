import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { LessonPlayer } from './LessonPlayer';
jest.mock('./SlideViewer', () => ({
  SlideViewer: ({ onViewedAll }) => <button onClick={onViewedAll}>View all sample slides</button>,
}));
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

test('a saved zero-score task shows its reward, but failed saves never claim completion', async () => {
  const api = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({
    attempt: { requestId: 'reward-request-1', score: 0, total: 1, rewardStars: 3, submittedAt: '2026-09-06T08:00:00Z' },
    lessonRewardStars: 3,
  });
  const onRewards = jest.fn();
  render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} onRewards={onRewards} />);
  fireEvent.click(screen.getByRole('button', { name: /^Vocabulary/ }));
  fireEvent.click(screen.getByLabelText('B. 风扇'));
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  const retry = await screen.findByRole('button', { name: 'Retry saving this answer' });
  expect(screen.queryByText('Completed · +3 stars')).not.toBeInTheDocument();
  expect(onRewards).not.toHaveBeenCalled();
  fireEvent.click(retry);
  await screen.findByText('Completed · +3 stars');
  expect(screen.getByText('0 / 1')).toBeInTheDocument();
  expect(onRewards).toHaveBeenCalledWith(3);
});

test('reward remains visible after refresh or a retry, without claiming a second reward', () => {
  const attempts = [
    { requestId: 'first', rewardStars: 3, text: 'My room.', submittedAt: '2026-09-06T08:00:00Z' },
    { requestId: 'retry', rewardStars: 0, text: 'My room is big.', submittedAt: '2026-09-06T09:00:00Z' },
  ];
  render(<LessonPlayer data={{ ...initial, parts: [{ part: 'writing', attempts }] }} classId="c" lang="zh" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /写作/ }));
  expect(screen.getByText('已完成 · +3 颗星星')).toBeInTheDocument();
  expect(screen.getByText('每项任务只奖励一次，重试不会重复获得星星。')).toBeInTheDocument();
});
test('opening slides is not completion; submit only after explicitly viewing every slide', async () => {
  const api = jest.fn(async () => ({ attempt: { requestId: 'saved1', submittedAt: new Date().toISOString() } }));
  render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} />);
  expect(screen.getByRole('button', { name: 'I have reviewed all slides' })).toBeDisabled();
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('View all sample slides'));
  fireEvent.click(screen.getByRole('button', { name: 'I have reviewed all slides' }));
  await screen.findByText('Activity completed');
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
  fireEvent.click(screen.getByRole('button', { name: /^Vocabulary/ }));
  fireEvent.click(screen.getByLabelText('A. 课桌'));
  fireEvent.click(screen.getByLabelText('B. 风扇'));
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  await screen.findByText('0 / 1');
  expect(api.mock.calls[0][1].answers).toEqual([{ questionId: 'q', optionId: 'b' }]);
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Try again!' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Vocabulary.*Completed/ })).toBeInTheDocument();
  expect(screen.getByText('1 of 5 activities completed')).toBeInTheDocument();
});
test('uncertain save retries the same answer and ID, and teacher history is read-only', async () => {
  const api = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network failed'))
    .mockResolvedValue({
      attempt: { requestId: 'saved1', text: 'I see a desk.', submittedAt: new Date().toISOString() },
    });
  const { unmount } = render(<LessonPlayer data={initial} classId="c" lang="en" onBack={() => {}} api={api} />);
  fireEvent.click(screen.getByRole('button', { name: /^Writing/ }));
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'I see a desk.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Retry saving this answer' }));
  await screen.findByText('Activity completed');
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
  fireEvent.click(screen.getByRole('button', { name: /^Writing/ }));
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Submit this activity' })).not.toBeInTheDocument();
});

const savedData = (part, attempts, extra = {}) => ({ ...initial, ...extra, parts: [{ part, attempts }] });
const saved = { requestId: 'saved-attempt-1', submittedAt: '2026-09-06T08:00:00Z', score: 0, total: 3, transcript: '""', automaticallyAssessed: true };

test('speaking opens on its result, and only Try again reveals a fresh recorder', () => {
  render(<LessonPlayer data={savedData('speaking', [saved])} classId="c" lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Speaking/ }));
  expect(screen.getByText('Activity completed')).toBeInTheDocument();
  expect(screen.getByText('0 / 3')).toBeInTheDocument();
  expect(screen.getByText(/No words were detected/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Record \(/ })).not.toBeInTheDocument();
  expect(screen.getByText('2 attempts remaining')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again!' }));
  expect(screen.getByRole('button', { name: /Record \(/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit this activity' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Back to saved result' }));
  expect(screen.getByText('Activity completed')).toBeInTheDocument();
});

test('writing retries are explicit, keep earlier answers, and return to completed results after saving', async () => {
  const api = jest.fn(async () => ({ attempt: { requestId: 'saved-attempt-2', text: 'I like this room.', submittedAt: '2026-09-06T09:00:00Z' } }));
  render(<LessonPlayer data={savedData('writing', [{ ...saved, score: undefined, text: 'I see a desk.' }])} classId="c" lang="en" onBack={() => {}} api={api} />);
  fireEvent.click(screen.getByRole('button', { name: /Writing/ }));
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again!' }));
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'I like this room.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit this activity' }));
  await screen.findByText('I like this room.');
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
  const history = screen.getByText('Previous attempts (1)').closest('details');
  expect(history).not.toHaveAttribute('open');
  expect(within(history).getByText('I see a desk.')).toBeInTheDocument();
  expect(screen.getByText('1 attempt remaining')).toBeInTheDocument();
});

test.each(['vocabulary', 'questions'])('saved %s is review-only even with legacy extra attempts', part => {
  render(<LessonPlayer data={savedData(part, [saved, { ...saved, requestId: 'old-second' }])} classId="c" lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: part === 'vocabulary' ? /Vocabulary/ : /Quick check/ }));
  expect(screen.getByText('Activity completed')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Try again!' })).not.toBeInTheDocument();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  expect(screen.getByText('Previous attempts (1)')).toBeInTheDocument();
});

test.each([{}, { readOnly: true, isOwner: true }])('used-up or read-only speaking results cannot start another attempt', extra => {
  const attempts = [1, 2, 3].map(n => ({ ...saved, requestId: `old-${n}` }));
  render(<LessonPlayer data={savedData('speaking', extra.readOnly ? [saved] : attempts, extra)} classId="c" lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Speaking/ }));
  expect(screen.getByText('Activity completed')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Try again!' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Record \(/ })).not.toBeInTheDocument();
});
