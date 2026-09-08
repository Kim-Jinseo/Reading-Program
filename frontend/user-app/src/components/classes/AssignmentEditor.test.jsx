import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AssignmentEditor } from './AssignmentEditor';

const source = { id: '1:reading:101', version: 'source-v1', title: 'A garden', titleZh: '花园', level: 1, subject: 'reading', instructions: 'Read and choose.', passage: 'A bee is on a flower.', questions: [{ prompt: 'Where is the bee?', options: ['On a leaf', 'On a flower', 'On a tree'], correctIndex: 1 }] };
const list = { sources: [{ id: source.id, title: source.title, titleZh: source.titleZh, questionCount: 1 }] };
const base = '/classes/class1/practice-catalog';
const mount = api => render(<AssignmentEditor lang="en" classId="class1" api={api} onBack={() => {}} onPublished={() => {}} />);

const wordBundle = number => ({ id: `vocab-bundle:${number}`, version: `bundle-v${number}`, title: `Word bundle ${number}`, subject: 'vocab', level: 1, format: 'quiz',
  learning: { words: Array.from({ length: 5 }, (_, i) => ({ word: `word${number}-${i}`, meaningZh: `词义${i}` })) },
  questions: Array.from({ length: 5 }, (_, i) => ({ prompt: `Meaning ${i}?`, options: ['词义', '其他'], correctIndex: i % 2 })),
});

test('switching from a pending reading preview to vocabulary does not leave bundle publication disabled', async () => {
  let finishReading;
  const api = jest.fn(async path => path.endsWith('/vocabulary-bundle') ? { source: wordBundle(1), remaining: 10 }
    : path.includes('?') ? list : new Promise(resolve => { finishReading = resolve; }));
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await waitFor(() => expect(finishReading).toBeDefined());
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'vocab' } });
  await screen.findByText('Word bundle 1');
  expect(screen.getByRole('button', { name: 'Assign to class' })).not.toBeDisabled();
  await act(async () => finishReading({ source }));
  expect(screen.queryByText(source.passage)).not.toBeInTheDocument();
});

test('vocab generates five cards, reshuffles the preview, and publishes only the latest bundle reference', async () => {
  let generation = 0;
  const api = jest.fn(async (path, body) => path.endsWith('/vocabulary-bundle')
    ? { source: wordBundle(++generation), remaining: 15 } : body ? { success: true } : list);
  mount(api);
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'vocab' } });
  await screen.findByText('Word bundle 1');
  expect(screen.queryByLabelText('Choose content')).not.toBeInTheDocument();
  expect(screen.getByText('Word 1 of 5')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next word' }));
  fireEvent.click(screen.getByRole('button', { name: 'Shuffle again' }));
  await screen.findByText('Word bundle 2');
  expect(screen.getByText('Word 1 of 5')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/classes/class1/vocabulary-bundle', { level: 1 });
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await screen.findByText('Extra practice assigned');
  expect(api).toHaveBeenCalledWith('/classes/class1/assignments', { sourceId: 'vocab-bundle:2', sourceVersion: 'bundle-v2', maxAttempts: 3, requestId: expect.any(String) });
});

test('stale bundle responses cannot replace the grade selection and exhausted pools cannot be assigned', async () => {
  let finish;
  const api = jest.fn(async (path, body) => {
    if (!path.endsWith('/vocabulary-bundle')) return list;
    if (body.level === 1) return new Promise(resolve => { finish = resolve; });
    throw Object.assign(new Error('Only 4 unused words remain.'), { code: 'vocabulary_exhausted' });
  });
  mount(api);
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'vocab' } });
  await waitFor(() => expect(finish).toBeDefined());
  fireEvent.change(screen.getByLabelText('Grade band'), { target: { value: '2' } });
  await screen.findByRole('alert');
  await act(async () => finish({ source: wordBundle(1), remaining: 10 }));
  expect(screen.queryByText('Word bundle 1')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
});

test('a vocabulary publication conflict unlocks generation instead of retrying an overlapping bundle', async () => {
  const api = jest.fn(async (path, body) => {
    if (path.endsWith('/vocabulary-bundle')) return { source: wordBundle(1), remaining: 8 };
    if (body) throw Object.assign(new Error('Already assigned.'), { code: 'vocabulary_overlap' });
    return list;
  });
  mount(api);
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'vocab' } });
  await screen.findByText('Word bundle 1');
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
  expect(screen.getByLabelText('Grade band')).not.toBeDisabled();
  expect(screen.getByRole('button', { name: 'Generate five words' })).not.toBeDisabled();
});

test('teacher previews read-only website content and publishes only its verified reference', async () => {
  const api = jest.fn(async (path, body) => body ? { success: true } : path.includes('?') ? list : { source });
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await screen.findByText(source.passage);
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  expect(screen.getByText('Where is the bee?')).toBeInTheDocument();
  expect(screen.getByText(/Correct answer: On a flower/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Assignment title')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add question' })).not.toBeInTheDocument();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Allowed attempts'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/classes/class1/assignments', { sourceId: source.id, sourceVersion: 'source-v1', maxAttempts: 2, requestId: expect.any(String) }));
});

test.each([
  ['writing', { id: '1:writing:1', version: 'w1', title: 'My room', titleZh: '我的房间', subject: 'writing', format: 'writing', questions: [], writing: { prompt: 'Describe your room.', promptZh: '描述你的房间。' } }, 'Describe your room.'],
  ['speaking', { id: '1:speaking:1', version: 's1', title: 'Read aloud', titleZh: '朗读', subject: 'speaking', format: 'speaking', questions: [], speaking: { sentence: 'I see a desk.', hintZh: '我看到一张课桌。' } }, 'I see a desk.'],
])('teacher can choose and preview %s without a zero-question label', async (subject, productive, previewText) => {
  const api = jest.fn(async path => path.includes('?')
    ? { sources: [{ id: productive.id, title: productive.title, titleZh: productive.titleZh, format: productive.format, questionCount: 0 }] }
    : { source: productive });
  mount(api);
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: subject } });
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: productive.id } });
  expect(await screen.findByText(previewText)).toBeInTheDocument();
  expect(screen.queryByText(/0 questions/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('Allowed attempts')).toHaveValue('3');
  expect(screen.getByLabelText('Allowed attempts')).toBeDisabled();
});

test('changing filters clears the old preview and stale responses cannot be assigned', async () => {
  let resolvePreview;
  const api = jest.fn((path) => path.includes('?') ? Promise.resolve(path.includes('level=2') ? { sources: [] } : list) : new Promise(resolve => { resolvePreview = resolve; }));
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await waitFor(() => expect(api).toHaveBeenCalledWith(`${base}/${encodeURIComponent(source.id)}`));
  fireEvent.change(screen.getByLabelText('Grade band'), { target: { value: '2' } });
  await screen.findByText('No content is available for this grade band and subject.');
  await act(async () => resolvePreview({ source }));
  expect(screen.queryByText(source.passage)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
  expect(api).toHaveBeenCalledWith(`${base}?level=2&subject=reading`);
});

test('catalog errors can be retried, and an unpreviewed source cannot be assigned', async () => {
  let failed = true;
  const api = jest.fn(async () => { if (failed) throw new Error('Network failed'); return list; });
  mount(api);
  expect(await screen.findByRole('alert')).toHaveTextContent('Network failed');
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry loading' }));
  await screen.findByLabelText('Choose content');
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
});

test('a changed source must be previewed again after publication is rejected', async () => {
  const api = jest.fn(async (path, body) => {
    if (body) throw Object.assign(new Error('Preview again.'), { code: 'practice_source_changed', status: 409 });
    return path.includes('?') ? list : { source };
  });
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await screen.findByText(source.passage);
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'Assign to class' })).toBeDisabled();
});

test('an uncertain publication retry keeps its request ID and selection locked', async () => {
  const bodies = [];
  const api = jest.fn(async (path, body) => {
    if (body) { bodies.push(body); if (bodies.length === 1) throw new Error('Lost response'); return { success: true }; }
    return path.includes('?') ? list : { source };
  });
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await screen.findByText(source.passage);
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Grade band')).toBeDisabled();
  expect(screen.getByLabelText('Choose content')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry assigning' }));
  await screen.findByText('Extra practice assigned');
  expect(bodies).toHaveLength(2);
  expect(bodies[0].requestId).toMatch(/^[a-zA-Z0-9_-]{12,80}$/);
  expect(bodies[1]).toEqual(bodies[0]);
});

test('a failed class refresh cannot publish already-saved work again', async () => {
  const api = jest.fn(async (path, body) => body ? { success: true } : path.includes('?') ? list : { source });
  render(<AssignmentEditor lang="en" classId="class1" api={api} onBack={() => {}} onPublished={async () => { throw new Error('Refresh failed'); }} />);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await screen.findByText(source.passage);
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await screen.findByText('Extra practice assigned');
  expect(screen.queryByRole('button', { name: 'Assign to class' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Back to class' })).toBeInTheDocument();
});
