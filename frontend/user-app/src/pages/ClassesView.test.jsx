import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClassesView } from './ClassesView';
import { useAppContext } from '../context/AppContext';

jest.mock('../context/AppContext', () => ({ useAppContext: jest.fn() }));
const student = { username: 'student1', name: '小明', role: 'student' };
const classroom = { id: 'class1', name: 'Monday English', studentCount: 1 };
const lessonsApi = async path => path === '/collections' ? { collections: [] } : path.endsWith('/report') ? { students: [] } : { lessons: [], history: [], collection: null };
function Harness({ api, initialUser = student, lessonRequests = lessonsApi }) {
  const [user, setUser] = useState(initialUser);
  const [lang, setLang] = useState('en');
  useAppContext.mockReturnValue({ user, setUser, lang, curriculumDb: {} });
  return <><button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}>Toggle language</button><ClassesView api={api} lessonsApi={lessonRequests} /></>;
}
beforeEach(() => localStorage.clear());

test('guest must sign in and cannot request private class data', () => {
  const api = jest.fn();
  render(<Harness api={api} initialUser={{ ...student, isGuest: true }} />);
  expect(screen.getByRole('button', { name: 'Sign in / Create account' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Create class' })).not.toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
});
test('student joins using the entered invitation and sees only their assignments', async () => {
  const api = jest.fn(async (path) => {
    if (path === '/classes') return { classes: [] };
    if (path === '/classes/join') return { class: classroom };
    if (path === '/classes/class1') return { class: classroom, isOwner: false, assignments: [] };
    throw new Error('Unexpected private report request');
  });
  render(<Harness api={api} />);
  fireEvent.change(await screen.findByLabelText('Class invitation code'), { target: { value: 'ABCD12345678' } });
  fireEvent.click(screen.getByRole('button', { name: 'Join class' }));
  await screen.findByRole('heading', { name: 'Monday English' });
  expect(api).toHaveBeenCalledWith('/classes/join', { code: 'ABCD12345678', displayName: '小明' });
  expect(screen.queryByRole('button', { name: 'New assignment' })).not.toBeInTheDocument();
  expect(api.mock.calls.some(([path]) => path.endsWith('/report'))).toBe(false);
});
test('successful verification refreshes the session and reveals teacher creation, not admin controls', async () => {
  const api = jest.fn(async path => path === '/teacher/verify'
    ? { user: { username: 'student1', role: 'teacher' }, token: 'new-test-session' }
    : { classes: [] });
  render(<Harness api={api} />);
  fireEvent.change(await screen.findByLabelText('Teacher verification code'), { target: { value: 'private-test-code' } });
  fireEvent.click(screen.getByRole('button', { name: 'Verify teacher' }));
  await screen.findByRole('button', { name: 'Create class' });
  expect(localStorage.getItem('token')).toBe('new-test-session');
  expect(api).toHaveBeenCalledWith('/teacher/verify', { code: 'private-test-code' });
  expect(screen.queryByRole('button', { name: 'Generate teacher code' })).not.toBeInTheDocument();
});
test('changing language does not reload classes or discard an assignment editor draft', async () => {
  const api = jest.fn(async path => {
    if (path === '/classes') return { classes: [classroom] };
    if (path.endsWith('/report')) return { students: [], assignments: [] };
    return { class: { ...classroom, invitationCode: 'ABCD12345678' }, isOwner: true, assignments: [] };
  });
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'New assignment' }));
  fireEvent.change(screen.getByLabelText('Assignment title'), { target: { value: 'Our garden' } });
  const calls = api.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
  await waitFor(() => expect(screen.getByLabelText('作业标题')).toHaveValue('Our garden'));
  expect(api).toHaveBeenCalledTimes(calls);
});

test('Refresh results also reloads newly published class lessons', async () => {
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: false, assignments: [] });
  let published = false;
  const lessonRequests = jest.fn(async () => ({ collection: null, history: [], lessons: published ? [{ id: 'lesson2', number: 2, title: 'New classroom lesson', titleZh: '新课', progress: { done: [], total: 5 } }] : [] }));
  render(<Harness api={api} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByText('No published lessons for this course yet.');
  published = true;
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  await screen.findByRole('heading', { name: 'New classroom lesson' });
  expect(lessonRequests.mock.calls.length).toBeGreaterThan(1);
});
