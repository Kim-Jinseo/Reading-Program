import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentEditor } from './AssignmentEditor';

const curriculumDb = { '1-2': { reading: [{ title: { en: 'A garden' }, text: { en: 'A bee is on a flower.' }, questions: [{ q: 'Where is the bee?', options: ['On a leaf', 'On a flower', 'On a tree'], correct: 1 }] }] } };
test('copying a reading lesson retains its passage and correct answer when publishing', async () => {
  const api = jest.fn(async () => ({}));
  const published = jest.fn();
  render(<AssignmentEditor lang="en" curriculumDb={curriculumDb} classId="class1" api={api} onBack={() => {}} onPublished={published} />);
  fireEvent.change(screen.getByLabelText('Copy questions from a lesson (optional)'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Use this lesson' }));
  expect(screen.getByLabelText('Assignment title')).toHaveValue('A garden');
  expect(screen.getByLabelText('Lesson text or reading passage (optional)')).toHaveValue('A bee is on a flower.');
  expect(screen.getByRole('radio', { name: 'Correct answer 2 for question 1' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Publish assignment' }));
  expect(api).toHaveBeenCalledWith('/classes/class1/assignments', expect.objectContaining({ questions: [expect.objectContaining({ correctIndex: 1 })] }));
  await screen.findByRole('button', { name: 'Publish assignment' });
  expect(published).toHaveBeenCalledTimes(1);
});
test('teacher cannot publish duplicate answer choices', async () => {
  const api = jest.fn();
  render(<AssignmentEditor lang="en" curriculumDb={curriculumDb} classId="class1" api={api} onBack={() => {}} onPublished={() => {}} />);
  fireEvent.change(screen.getByLabelText('Copy questions from a lesson (optional)'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Use this lesson' }));
  fireEvent.change(screen.getByLabelText('Choice 1'), { target: { value: '  ON A FLOWER  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publish assignment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Each choice must be different');
  expect(api).not.toHaveBeenCalled();
});
