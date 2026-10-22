import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { TeacherOversight } from './TeacherOversight';

const teacher = { id: 't1', name: 'Ms Chen', classCount: 1, studentCount: 2, pendingCount: 1 };
const classroom = { id: 'c1', name: 'Monday English', studentCount: 2, pendingCount: 1 };
function setup(overrides = {}) {
  const api = jest.fn(async path => {
    if (path === '/admin/teachers') return { teachers: [teacher], nextCursor: null };
    if (path === '/admin/teachers/t1/classes') return { teacher, classes: [classroom] };
    if (path === '/admin/classes/c1/report') return { teacher, class: classroom, students: [
      { id: 's1', name: 'Xiaoming', assigned: 3, completed: 2, studyDays28: 4, activitiesSubmitted: 8, lastSubmittedAt: '2026-10-21T10:00:00Z' },
      { id: 's2', name: 'Lily', assigned: 3, completed: 0, studyDays28: 0, activitiesSubmitted: 0, lastSubmittedAt: null },
    ] };
    throw Error(`Unexpected request: ${path}`);
  });
  const props = { api, role: 'admin', lang: 'en', ...overrides };
  return { ...props, view: render(<TeacherOversight {...props} />) };
}

test('administrator can inspect a teacher, classes and lesson progress without edit controls', async () => {
  setup();
  fireEvent.click(await screen.findByRole('button', { name: 'View classes: Ms Chen' }));
  fireEvent.click(await screen.findByRole('button', { name: 'View progress: Monday English' }));
  const student = (await screen.findByRole('heading', { name: 'Xiaoming' })).closest('article');
  expect(within(student).getByText('2 / 3')).toBeVisible();
  expect(within(student).getByText('4')).toBeVisible();
  expect(screen.getByText('No submissions yet')).toBeVisible();
  expect(screen.getByText(/not a teacher performance score/i)).toBeVisible();
  expect(screen.queryByRole('button', { name: /Approve|Decline|Assign|Class settings/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to classes' }));
  expect(await screen.findByRole('button', { name: 'View progress: Monday English' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to teachers' }));
  expect(await screen.findByRole('button', { name: 'View classes: Ms Chen' })).toBeVisible();
});

test.each(['teacher', 'student', undefined])('%s cannot load administrator oversight', async role => {
  const { api } = setup({ role });
  expect(screen.getByRole('alert')).toHaveTextContent('Administrator access required');
  expect(api).not.toHaveBeenCalled();
  expect(screen.queryByText('Ms Chen')).not.toBeInTheDocument();
});

test('empty data and recoverable request failure are explicit', async () => {
  let failed = true;
  setup({ api: async () => { if (failed) throw Error('Please try again.'); return { teachers: [], nextCursor: null }; } });
  expect(await screen.findByRole('alert')).toHaveTextContent('Please try again.');
  failed = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No teachers yet.')).toBeVisible();
});

test('teacher pages can be advanced and returned without losing navigation', async () => {
  setup({ api: async path => path.includes('?after=')
    ? { teachers: [{ ...teacher, id: 't2', name: 'Mr Lee' }], nextCursor: null }
    : { teachers: [teacher], nextCursor: 't1' } });
  await screen.findByText('Ms Chen');
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(await screen.findByText('Mr Lee')).toBeVisible();
  expect(screen.queryByText('Ms Chen')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(await screen.findByText('Ms Chen')).toBeVisible();
});

test('late class report cannot replace the screen after navigating back', async () => {
  let release;
  const waiting = new Promise(resolve => { release = resolve; });
  const { api } = setup();
  fireEvent.click(await screen.findByRole('button', { name: 'View classes: Ms Chen' }));
  await screen.findByRole('button', { name: 'View progress: Monday English' });
  api.mockImplementationOnce(() => waiting);
  fireEvent.click(screen.getByRole('button', { name: 'View progress: Monday English' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to classes' }));
  await screen.findByRole('button', { name: 'View progress: Monday English' });
  await act(async () => release({ teacher, class: classroom, students: [{ id: 'old', name: 'Stale student', completed: 1, assigned: 1 }] }));
  expect(screen.queryByText('Stale student')).not.toBeInTheDocument();
});

test('Chinese administrator labels are available', async () => {
  setup({ lang: 'zh' });
  expect(await screen.findByRole('button', { name: '查看班级：Ms Chen' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '教师概览' })).toBeVisible();
  expect(screen.getByText('待审批申请')).toBeVisible();
});
