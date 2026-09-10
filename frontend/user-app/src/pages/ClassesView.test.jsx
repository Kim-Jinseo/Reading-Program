import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
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

test.each(['student', 'teacher'])('%s sees the restored Classes banner on the list and class overview', async role => {
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] }
    : { class: classroom, isOwner: role === 'teacher', assignments: [] });
  render(<Harness api={api} initialUser={{ ...student, role }} />);
  expect(screen.getByRole('heading', { name: 'Classes', exact: true })).toBeVisible();
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByRole('heading', { name: 'Class lessons' });
  expect(screen.getByRole('heading', { name: 'Classes', exact: true })).toBeVisible();
  expect(screen.getByText(/Help your students grow|Learn together\. Try something new/)).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Monday English' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'All classes' }));
  expect(await screen.findByRole('heading', { name: 'My classes' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Classes', exact: true })).toBeVisible();
});

test.each(['student', 'teacher'])('%s sees existing classes before the join or create form', async role => {
  const api = jest.fn(async () => ({ classes: [classroom] }));
  render(<Harness api={api} initialUser={{ ...student, role }} />);
  const existing = await screen.findByRole('heading', { name: 'My classes' });
  const form = screen.getByRole('heading', { name: role === 'teacher' ? 'Create a class' : 'Join a class' });
  expect(existing.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole('button', { name: /Monday English/ })).toBeEnabled();
});

test('opening a class responds immediately and starts its lesson request before class details finish', async () => {
  let resolveDetails;
  const details = new Promise(resolve => { resolveDetails = resolve; });
  const api = jest.fn(path => path === '/classes' ? Promise.resolve({ classes: [classroom] }) : details);
  const lessonRequests = jest.fn(lessonsApi);
  render(<Harness api={api} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  expect(screen.getByRole('heading', { name: 'Monday English' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading class');
  expect(lessonRequests.mock.calls.some(([path]) => path === '/classes/class1')).toBe(true);
  await act(async () => resolveDetails({ class: classroom, isOwner: false, assignments: [] }));
  await screen.findByRole('heading', { name: 'Class lessons' });
});

test('teacher returns from read-only lesson work to the same student profile', async () => {
  const pupil = { id: 's', name: '王小明', completed: 0, assigned: 1, studyDays28: 1, practice: {} };
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] }
    : path.endsWith('/report') ? { students: [pupil], assignments: [] }
    : { class: classroom, isOwner: true, assignments: [] });
  const lessonRequests = jest.fn(async path => path === '/collections' ? { collections: [] }
    : path.endsWith('/report') ? { students: [pupil] }
    : path.includes('/students/') ? { lessons: [{ id: 'l', title: 'Our room', progress: { done: [], total: 5 } }] }
    : path.includes('/lessons/') ? { readOnly: true, revision: 0, parts: [], lesson: { id: 'l', number: 1, title: 'Our room', slides: [], vocabulary: [], questions: [] } }
    : { collection: null, history: [], lessons: [] });
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Students', exact: true }));
  expect(screen.getByRole('button', { name: 'All classes' })).toBeVisible();
  fireEvent.click(await screen.findByRole('button', { name: /View profile.*王小明/ }));
  expect(screen.getByRole('button', { name: 'Back to students' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'All classes' })).not.toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Student review' })).getByText('王小明')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Lesson work', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /Our room/ }));
  await screen.findByTestId('lesson-player');
  expect(within(screen.getByRole('region', { name: 'Student review' })).getByText('王小明')).toBeVisible();
  expect(within(screen.getByRole('region', { name: 'Student review' })).getByText('Monday English')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Submit this activity' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '← Back to 王小明’s profile' }));
  expect(screen.getByRole('heading', { name: '王小明', level: 2 })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Lesson work', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: 'All classes' })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: /Our room/ })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Extra practice', exact: true }));
  expect(screen.queryByRole('button', { name: 'All classes' })).not.toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Student review' })).getByText('王小明')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to students' }));
  expect(screen.queryByRole('region', { name: 'Student review' })).not.toBeInTheDocument();
  expect(screen.getAllByText('王小明')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'All classes' }));
  expect(await screen.findByRole('heading', { name: 'My classes' })).toBeVisible();
});

test('teacher can open a class before a slow report finishes and course lists do not reload on navigation', async () => {
  let finishReport;
  const slowReport = new Promise(resolve => { finishReport = resolve; });
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : path.endsWith('/report') ? slowReport : { class: classroom, isOwner: true, assignments: [] });
  const lessonRequests = jest.fn(lessonsApi);
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} lessonRequests={lessonRequests} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByRole('button', { name: 'Students', exact: true });
  expect(screen.getByRole('heading', { name: 'Class lessons' })).toBeInTheDocument();
  expect(api.mock.calls.some(([path]) => path.endsWith('/report'))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle language' }));
  expect(lessonRequests.mock.calls.filter(([path]) => path === '/collections')).toHaveLength(1);
  await act(async () => finishReport({ students: [], assignments: [] }));
});

test('replacing a class invitation does not discard an already loaded teacher report', async () => {
  window.confirm = jest.fn(() => true);
  const api = async path => path === '/classes' ? { classes: [classroom] }
    : path.endsWith('/report') ? { students: [{ id: 's', name: '王小明', practice: {} }], assignments: [] }
    : { class: { ...classroom, invitationCode: 'INVITE123' }, isOwner: true, assignments: [] };
  render(<Harness api={api} initialUser={{ ...student, role: 'teacher' }} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Students', exact: true }));
  await screen.findByRole('button', { name: /View profile.*王小明/ });
  fireEvent.click(screen.getByRole('button', { name: 'Invite students' }));
  fireEvent.click(screen.getByRole('button', { name: 'Replace code' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Replace code' })).toBeEnabled());
  expect(screen.queryByText(/Loading student report/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /View profile.*王小明/ })).toBeVisible();
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
  fireEvent.click(await screen.findByRole('button', { name: 'Extra practice', exact: true }));
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

test('student class cards label speaking as an activity with its fixed attempt policy', async () => {
  const assignment = { id: 'speak', title: 'Read aloud', subject: 'speaking', format: 'speaking', level: 1, questionCount: 0, maxAttempts: 3, progress: { count: 0 } };
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: false, assignments: [assignment] });
  render(<Harness api={api} />);
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  expect(await screen.findByText('Speaking · Grades 1–2')).toBeInTheDocument();
  expect(screen.getByText('1 activity · Up to 3 attempts')).toBeInTheDocument();
  expect(screen.queryByText(/0 questions/)).not.toBeInTheDocument();
});

test('class navigation works without manual refresh controls and reopening loads lessons', async () => {
  const api = jest.fn(async path => path === '/classes' ? { classes: [classroom] } : { class: classroom, isOwner: false, assignments: [] });
  let published = false;
  const lessonRequests = jest.fn(async () => ({ collection: null, history: [], lessons: published ? [{ id: 'lesson2', number: 2, title: 'New classroom lesson', titleZh: '新课', progress: { done: [], total: 5 } }] : [] }));
  render(<Harness api={api} lessonRequests={lessonRequests} />);
  await screen.findByRole('button', { name: /Monday English/ });
  expect(screen.queryByRole('button', { name: /^Refresh/ })).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByText('No published lessons for this course yet.');
  expect(screen.queryByRole('button', { name: /^Refresh/ })).not.toBeInTheDocument();
  published = true;
  fireEvent.click(screen.getByRole('button', { name: 'All classes' }));
  fireEvent.click(await screen.findByRole('button', { name: /Monday English/ }));
  await screen.findByRole('heading', { name: 'New classroom lesson' });
  expect(lessonRequests.mock.calls.length).toBeGreaterThan(1);
});
