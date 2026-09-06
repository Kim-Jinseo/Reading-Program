import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

test('teacher can open a class before a slow report finishes and course lists do not reload on navigation', async () => {
  let finishReport;
  const slowReport = new Promise(resolve => { finishReport = resolve; });
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : path.endsWith('/report') ? slowReport : { class: classroom, isOwner: true, assignments: [] });
  const lessonRequests = jest.fn(lessonsApi);
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByRole('button', { name: 'Assign extra practice' });
  expect(screen.getByRole('heading', { name: 'Class lessons' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
  expect(lessonRequests.mock.calls.filter(([path]) => path === '/collections')).toHaveLength(1);
  await act(async () => finishReport({ students: [], assignments: [] }));
});

test('replacing a class invitation does not discard an already loaded teacher report', async () => {
  window.confirm = jest.fn(() => true);
  const api = async path => path === '/classes' ? { classes: [classroom] }
    : path.endsWith('/report') ? { students: [], assignments: [] }
    : { class: { ...classroom, invitationCode: 'INVITE123' }, isOwner: true, assignments: [] };
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await waitFor(() => expect(screen.queryByText(/Loading student report/)).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Replace code' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Replace code' })).toBeEnabled());
  expect(screen.queryByText(/Loading student report/)).not.toBeInTheDocument();
});

test('returning from a lesson shows the existing class immediately while progress refresh is delayed', async () => {
  let slow = false;
  const never = new Promise(() => {});
  const api = jest.fn(async path => slow ? never : path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: false, assignments: [] });
  const lessonRequests = jest.fn(async path => {
    if (slow) return never;
    if (path.includes('/lessons/')) return { revision: 0, parts: [], lesson: { id: 'l', number: 1, title: 'Our room', slides: [], vocabulary: [], questions: [] } };
    return { collection: null, history: [], lessons: [{ id: 'l', number: 1, title: 'Our room', progress: { done: [], total: 5 } }] };
  });
  render(<Harness api={api} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Open lesson' }));
  await screen.findByTestId('lesson-player');
  slow = true;
  fireEvent.click(screen.getByRole('button', { name: '← Back to class' }));
  expect(screen.getByRole('heading', { name: 'Monday English' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open lesson' })).toBeInTheDocument();
  expect(screen.queryByTestId('lesson-player')).not.toBeInTheDocument();
});

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
  expect(screen.queryByRole('button', { name: 'Assign extra practice' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Assignments' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Extra practice' })).not.toBeInTheDocument();
  expect(screen.queryByText('No assignments have been published yet.')).not.toBeInTheDocument();
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
test('changing language preserves the teacher content selection without reloading classes', async () => {
  const api = jest.fn(async path => {
    if (path === '/classes') return { classes: [classroom] };
    if (path.includes('/practice-catalog?')) return { sources: [{ id: '1:reading:101', title: 'Our garden', titleZh: '我们的花园', questionCount: 1 }] };
    if (path.includes('/practice-catalog/')) return { source: { id: '1:reading:101', version: 'v1', title: 'Our garden', titleZh: '我们的花园', passage: 'I see a bee.', questions: [{ prompt: 'What do I see?', options: ['A bee', 'A cat'], correctIndex: 0 }] } };
    if (path.endsWith('/report')) return { students: [], assignments: [] };
    return { class: { ...classroom, invitationCode: 'ABCD12345678' }, isOwner: true, assignments: [] };
  });
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Assign extra practice' }));
  fireEvent.change(await screen.findByLabelText('Choose content'), { target: { value: '1:reading:101' } });
  await screen.findByText('I see a bee.');
  const calls = api.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
  await waitFor(() => expect(screen.getByLabelText('选择内容')).toHaveValue('1:reading:101'));
  expect(api).toHaveBeenCalledTimes(calls);
});

test('students see assigned extra practice and their existing results, separate from class lessons', async () => {
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: false, assignments: [{ id: 'old', title: 'Our garden', subject: 'reading', level: 1, questionCount: 3, maxAttempts: 2, progress: { count: 1, latest: { score: 2, total: 3 }, best: { score: 2, total: 3 } } }] });
  render(<Harness api={api} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByRole('heading', { name: 'Extra practice' });
  expect(screen.getByText('Assigned by your teacher.')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Class lessons' })).toBeInTheDocument();
  expect(screen.getByText('Latest: 2 / 3 · Best: 2 / 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Review / Try again' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Assign extra practice' })).not.toBeInTheDocument();
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
