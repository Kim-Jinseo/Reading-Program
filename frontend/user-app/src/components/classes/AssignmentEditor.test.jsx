import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AssignmentEditor } from './AssignmentEditor';

const source = { id: '1:reading:101', version: 'source-v1', title: 'A garden', titleZh: '花园', level: 1, subject: 'reading', instructions: 'Read and choose.', passage: 'A bee is on a flower.', questions: [{ prompt: 'Where is the bee?', options: ['On a leaf', 'On a flower', 'On a tree'], correctIndex: 1 }] };
const list = { sources: [{ id: source.id, title: source.title, titleZh: source.titleZh, questionCount: 1 }] };
const base = '/classes/class1/practice-catalog';
const mount = api => render(<AssignmentEditor lang="en" classId="class1" api={api} onBack={() => {}} onPublished={() => {}} />);

test('teacher previews read-only website content and publishes only its verified reference', async () => {
  const api = jest.fn(async (path, body) => body ? { success: true } : path.includes('?') ? list : { source });
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await screen.findByText(source.passage);
  expect(screen.getByText('Where is the bee?')).toBeInTheDocument();
  expect(screen.getByText(/Correct answer: On a flower/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Assignment title')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add question' })).not.toBeInTheDocument();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Allowed attempts'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Assign to class' }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/classes/class1/assignments', { sourceId: source.id, sourceVersion: 'source-v1', maxAttempts: 2, requestId: expect.any(String) }));
});

test('changing filters clears the old preview and stale responses cannot be assigned', async () => {
  let resolvePreview;
  const api = jest.fn((path) => path.includes('?') ? Promise.resolve(path.includes('level=2') ? { sources: [] } : list) : new Promise(resolve => { resolvePreview = resolve; }));
  mount(api);
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: source.id } });
  await waitFor(() => expect(api).toHaveBeenCalledWith(`${base}/${encodeURIComponent(source.id)}`));
  fireEvent.change(screen.getByLabelText('Level'), { target: { value: '2' } });
  await screen.findByText('No content is available for this level and subject.');
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
  expect(screen.getByLabelText('Level')).toBeDisabled();
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
