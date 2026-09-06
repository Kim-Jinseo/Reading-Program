import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TeacherClassView } from './TeacherClassView';
const student = { id: 's', name: '王小明', completed: 1, assigned: 2, studyDays28: 3, lastSubmittedAt: '2026-09-06T08:00:00Z' };
function setup(extra = {}) {
  const api = jest.fn(async path => path.endsWith('/report') ? { students: [{ ...student, completed: 2, assigned: 3, averagePercent: 75, practice: {} }], assignments: [] } : { results: [] });
  const lessonsApi = jest.fn(async path => path.endsWith('/report') ? { students: [student] }
    : path.includes('/students/') ? { lessons: [{ id: 'l', number: 1, title: 'Our classroom', titleZh: '我们的教室', progress: { done: ['writing'], total: 5 } }] }
    : path.includes('/lessons/') ? { lesson: { id: 'l' }, readOnly: true, parts: [] }
    : { collection: { _id: 'course', level: 2, year: 2026, season: 'summer' }, lessons: [], history: [] });
  const props = { detail: { class: { id: 'c', name: 'Monday English', invitationCode: 'PRIVATE-CODE' }, isOwner: true, assignments: [] }, api, lessonsApi, lang: 'en', onOpen: jest.fn(), onAssign: jest.fn(), onCopy: jest.fn(), onReplace: jest.fn(), ...extra };
  return { ...props, view: render(<TeacherClassView {...props} />) };
}
test('compact teacher class hides invitations and progress until requested', async () => {
  const { api, lessonsApi } = setup();
  await screen.findByText('2026 Summer · Level 2 (Grades 3–4)');
  expect(screen.queryByDisplayValue('PRIVATE-CODE')).not.toBeInTheDocument();
  expect(screen.queryByText('王小明')).not.toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
  expect(lessonsApi.mock.calls.some(([path]) => path.endsWith('/report'))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Invite students' }));
  expect(screen.getByDisplayValue('PRIVATE-CODE')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  await screen.findByText('王小明');
  expect(screen.getAllByText('王小明')).toHaveLength(1);
  expect(screen.queryByText('Lesson progress and consistency')).not.toBeInTheDocument();
  expect(screen.queryByText('Student progress')).not.toBeInTheDocument();
});
test('profile separates scores, lazily opens work and retains the lesson-work tab on return', async () => {
  const { api, lessonsApi, onOpen } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /View profile.*王小明/ }));
  expect(screen.getByRole('heading', { name: '王小明' })).toBeVisible();
  expect(screen.getByText('1 / 2')).toBeVisible();
  expect(screen.getByText('2 / 3')).toBeVisible();
  expect(lessonsApi.mock.calls.some(([path]) => path.includes('/students/'))).toBe(false);
  expect(api.mock.calls.some(([path]) => path.includes('/students/'))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Lesson work', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /Our classroom/ }));
  await waitFor(() => expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ readOnly: true }), 's'));
  expect(screen.getByRole('button', { name: 'Lesson work', exact: true })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Back to students' }));
  expect(screen.getAllByText('王小明')).toHaveLength(1);
});
test('an old profile response cannot reopen a profile after returning to students', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const lessonsApi = jest.fn(async path => path.endsWith('/report') ? { students: [student] }
    : path.includes('/students/') ? pending : { collection: null, lessons: [], history: [] });
  setup({ lessonsApi });
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /View profile.*王小明/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Lesson work', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to students' }));
  await act(async () => finish({ lessons: [{ id: 'old', title: 'Old student work', progress: { done: [], total: 5 } }] }));
  expect(screen.queryByText('Old student work')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '王小明', level: 2 })).not.toBeInTheDocument();
});

test('failed reports show retry instead of inventing empty progress', async () => {
  let failed = true;
  const api = jest.fn(async () => {
    if (failed) throw new Error('Report unavailable');
    return { students: [{ ...student, practice: {} }], assignments: [] };
  });
  setup({ api });
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  await screen.findByRole('alert');
  expect(screen.queryByText('Invite students to see their progress here.')).not.toBeInTheDocument();
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try loading again' }));
  await screen.findByRole('button', { name: /View profile.*王小明/ });
  expect(api.mock.calls.at(-1)[2]).toEqual({ fresh: true });
});

test('clicking the active profile tab does not strand a pending lesson request', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const lessonsApi = jest.fn(async path => path.endsWith('/report') ? { students: [student] }
    : path.includes('/students/') ? { lessons: [{ id: 'l', title: 'Our classroom', progress: { done: [] } }] }
    : path.includes('/lessons/') ? pending : { collection: null, lessons: [], history: [] });
  const { onOpen } = setup({ lessonsApi });
  fireEvent.click(screen.getByRole('button', { name: 'Students', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /View profile.*王小明/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Lesson work', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: /Our classroom/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Lesson work', exact: true }));
  await act(async () => finish({ lesson: { id: 'l' }, readOnly: true, parts: [] }));
  expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ readOnly: true }), 's');
  expect(screen.getByRole('button', { name: /Our classroom/ })).toBeEnabled();
});
