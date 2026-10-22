import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ClassesView } from './ClassesView';
import { TeacherClassView } from '../components/classes/TeacherClassView';
import { useAppContext } from '../context/AppContext';

jest.mock('../context/AppContext', () => ({ useAppContext: jest.fn() }));
const classroom = { id: 'c', name: 'Monday English', studentCount: 0 };
const request = { id: 'r', classId: 'c', className: 'Monday English', status: 'pending', requestedAt: '2026-10-22T01:00:00Z' };
const lessonsApi = jest.fn(async path => path.endsWith('/report') ? { students: [] } : { lessons: [], history: [], collection: null });
beforeEach(() => {
  localStorage.clear();
  lessonsApi.mockImplementation(async path => path === '/collections' ? { collections: [] } : path.endsWith('/report') ? { students: [] } : { lessons: [], history: [], collection: null });
  useAppContext.mockReturnValue({ user: { username: 'student', name: 'Sam', role: 'student' }, lang: 'en', setUser: jest.fn() });
});

test('joining creates a pending request without opening protected class data; checking status reveals approved membership', async () => {
  let joined = false, approved = false;
  const api = jest.fn(async (path, body) => {
    if (path === '/classes/join') { joined = true; return { success: true, status: 'pending', class: classroom, request }; }
    if (path === '/classes') return { classes: approved ? [classroom] : [], joinRequests: joined && !approved ? [request] : [] };
    throw new Error(`Unexpected protected request ${path}`);
  });
  render(<ClassesView api={api} lessonsApi={lessonsApi} />);
  await screen.findByText(/No classes yet/);
  fireEvent.change(screen.getByLabelText('Class invitation code'), { target: { value: 'ABC123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Join class', exact: true }));
  expect(await screen.findByText('Waiting for teacher approval')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Request sent');
  expect(api).toHaveBeenCalledWith('/classes/join', { code: 'ABC123', displayName: 'Sam' });
  expect(api.mock.calls.some(([path]) => path === '/classes/c')).toBe(false);
  expect(lessonsApi).not.toHaveBeenCalled();
  approved = true;
  fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
  expect(await screen.findByRole('button', { name: /Monday English/ })).toBeEnabled();
  expect(screen.queryByText('Waiting for teacher approval')).not.toBeInTheDocument();
});

test('pending and declined requests remain non-interactive and focus refresh obtains their current status', async () => {
  let declined = false;
  const api = jest.fn(async () => ({ classes: [], joinRequests: [{ ...request, status: declined ? 'declined' : 'pending' }] }));
  render(<ClassesView api={api} lessonsApi={lessonsApi} />);
  expect(await screen.findByText('Waiting for teacher approval')).toBeVisible();
  expect(screen.queryByRole('button', { name: /Monday English/ })).not.toBeInTheDocument();
  declined = true;
  fireEvent.focus(window);
  expect(await screen.findByText('Request declined')).toBeVisible();
});

test('failed status checks preserve the pending application and can be retried', async () => {
  let failed = false;
  const api = jest.fn(async () => { if (failed) throw new Error('Status unavailable'); return { classes: [], joinRequests: [request] }; });
  render(<ClassesView api={api} lessonsApi={lessonsApi} />);
  await screen.findByText('Waiting for teacher approval');
  failed = true;
  fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Status unavailable');
  expect(screen.getByText('Waiting for teacher approval')).toBeVisible();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

test.each([false, true])('student and teacher class hide retained assignments while lessons remain (owner: %s)', async owner => {
  useAppContext.mockReturnValue({ user: { username: 'sam', role: owner ? 'teacher' : 'student' }, lang: 'en' });
  const api = async path => path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: owner, assignments: [{ id: 'a', title: 'Hidden saved practice', progress: { count: 0 } }] };
  render(<ClassesView api={api} lessonsApi={lessonsApi} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  expect(await screen.findByRole('heading', { name: 'Class lessons' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /Extra practice/i })).not.toBeInTheDocument();
  expect(screen.queryByText('Hidden saved practice')).not.toBeInTheDocument();
});

test.each(['approve', 'decline'])('owner %s locks repeated decisions and refreshes pending requests and the lesson roster', async decision => {
  let finish, decided = false;
  const pending = { id: 'r', studentId: 's', name: 'Sam Teacher Name', username: 'sam-account', requestedAt: request.requestedAt };
  const api = jest.fn(async (path, body) => {
    if (body) { await new Promise(resolve => { finish = resolve; }); decided = true; return { success: true, status: decision === 'approve' ? 'approved' : 'declined' }; }
    return { class: classroom, isOwner: true, assignments: [], joinRequests: decided ? [] : [pending] };
  });
  const lessonRequests = jest.fn(async path => path.endsWith('/report') ? { students: decided && decision === 'approve' ? [{ id: 's', name: 'Approved Sam', completed: 0, assigned: 2 }] : [] } : { lessons: [], history: [], collection: null });
  render(<TeacherClassView detail={{ class: classroom, isOwner: true, assignments: [], joinRequests: [pending] }} lang="en" api={api} lessonsApi={lessonRequests} />);
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  expect(await screen.findByText('Sam Teacher Name')).toBeVisible();
  expect(screen.getByText('sam-account')).toBeVisible();
  const action = screen.getByRole('button', { name: decision === 'approve' ? /Approve/ : /Decline/ });
  fireEvent.click(action);
  fireEvent.click(action);
  expect(action).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(screen.queryByText('sam-account')).not.toBeInTheDocument());
  expect(api.mock.calls.filter(([, body]) => body)).toEqual([[`/classes/c/join-requests/r/decision`, { decision }]]);
  expect(lessonRequests.mock.calls.filter(([path]) => path.endsWith('/report')).length).toBeGreaterThanOrEqual(2);
  expect(api.mock.calls.some(([path]) => path.endsWith('/report'))).toBe(false);
  if (decision === 'approve') expect(await screen.findByRole('button', { name: /View profile: Approved Sam/ })).toBeVisible();
});

test('failed owner decision preserves pending application and offers retry without optimistic membership', async () => {
  const pending = { id: 'r', name: 'Sam Teacher Name', username: 'sam-account', requestedAt: request.requestedAt };
  const api = jest.fn(async (path, body) => { if (body) throw new Error('Decision unavailable'); return { joinRequests: [pending] }; });
  render(<TeacherClassView detail={{ class: classroom, assignments: [], joinRequests: [pending] }} lang="en" api={api} lessonsApi={lessonsApi} />);
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /Approve/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Decision unavailable');
  expect(screen.getByRole('button', { name: /Approve/ })).toBeEnabled();
  expect(screen.getByText('sam-account')).toBeVisible();
});

test('a decision finishing while the class is hidden does not strand disabled controls on return', async () => {
  let finish;
  const pending = { id: 'r', name: 'Sam', username: 'sam-account', requestedAt: request.requestedAt };
  const api = async (path, body) => {
    if (body) return new Promise((resolve, reject) => { finish = () => reject(new Error('Unavailable')); });
    return { joinRequests: [pending] };
  };
  const props = { detail: { class: classroom, assignments: [], joinRequests: [pending] }, lang: 'en', api, lessonsApi };
  const view = render(<TeacherClassView {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: 'Approve Sam' }));
  view.rerender(<TeacherClassView {...props} visible={false} />);
  await act(async () => finish());
  view.rerender(<TeacherClassView {...props} visible />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Approve Sam' })).toBeEnabled());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
