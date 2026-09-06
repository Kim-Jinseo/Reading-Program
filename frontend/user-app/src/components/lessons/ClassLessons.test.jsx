import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ClassLessons } from './ClassLessons';

test('refresh clears an old selected-student snapshot instead of leaving stale lesson progress visible', async () => {
  const api = async path => path.endsWith('/report')
    ? { students: [{ id: 's', name: '小明', completed: 0, assigned: 1, studyDays28: 1 }] }
    : path.includes('/students/') ? { lessons: [{ id: 'l', title: 'Our classroom', progress: { done: [], total: 5 } }] }
    : { lessons: [], history: [], collection: null };
  const props = { classId: 'c', isOwner: true, lang: 'en', onOpen: () => {}, api };
  const { rerender } = render(<ClassLessons {...props} refreshKey={0} />);
  fireEvent.click(await screen.findByRole('button', { name: /小明/ }));
  await screen.findByRole('heading', { name: '小明' });
  rerender(<ClassLessons {...props} refreshKey={1} />);
  await waitFor(() => expect(screen.queryByRole('heading', { name: '小明' })).not.toBeInTheDocument());
});

test('student details arriving after a refresh cannot restore the obsolete snapshot', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const api = async path => path.endsWith('/report')
    ? { students: [{ id: 's', name: '小明', completed: 0, assigned: 1, studyDays28: 1 }] }
    : path.includes('/students/') ? pending : { lessons: [], history: [], collection: null };
  const props = { classId: 'c', isOwner: true, lang: 'en', onOpen: () => {}, api };
  const { rerender } = render(<ClassLessons {...props} refreshKey={0} />);
  fireEvent.click(await screen.findByRole('button', { name: /小明/ }));
  rerender(<ClassLessons {...props} refreshKey={1} />);
  await act(async () => finish({ lessons: [{ id: 'l', title: 'Old progress', progress: { done: [], total: 5 } }] }));
  expect(screen.queryByRole('heading', { name: '小明' })).not.toBeInTheDocument();
  expect(screen.queryByText(/Old progress/)).not.toBeInTheDocument();
});

test('leaving a class while a lesson opens cannot navigate back into that class later', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const api = async path => path.includes('/lessons/') ? pending : { lessons: [{ id: 'l', number: 1, title: 'Room', progress: { done: [], total: 5 } }], history: [], collection: null };
  const onOpen = jest.fn();
  const { unmount } = render(<ClassLessons classId="c" lang="en" api={api} onOpen={onOpen} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Open lesson' }));
  unmount();
  await act(async () => finish({ lesson: { id: 'l' }, parts: [] }));
  expect(onOpen).not.toHaveBeenCalled();
});
