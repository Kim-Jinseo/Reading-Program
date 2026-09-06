import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { LessonLibrary } from './LessonLibrary';

test('lesson uploads explicitly connect an English word with its selected Chinese meaning', async () => {
  const api = async path => path === '/collections' ? { collections: [{ id: 'summer', year: 2026, level: 2, season: 'summer' }] } : { lessons: [] };
  render(<LessonLibrary lang="en" api={api} onBack={() => {}} />);
  await screen.findByRole('option', { name: /2026 Summer/ });
  fireEvent.change(screen.getByLabelText('Available courses'), { target: { value: 'summer' } });
  const add = await screen.findByRole('button', { name: 'Add lesson' });
  await waitFor(() => expect(add).toBeEnabled());
  fireEvent.click(add);
  const inputs = screen.getAllByLabelText('English word');
  expect(inputs).toHaveLength(4);
  fireEvent.change(inputs[0], { target: { value: 'desk' } });
  const item = inputs[0].closest('fieldset');
  fireEvent.change(within(item).getByLabelText('Choice 1'), { target: { value: '椅子' } });
  fireEvent.change(within(item).getByLabelText('Choice 2'), { target: { value: '课桌' } });
  fireEvent.click(within(item).getByLabelText('Choice 2 is correct'));
  expect(within(item).getByText('What does “desk” mean?')).toBeInTheDocument();
  expect(within(item).getByText('Flashcard meaning: 课桌')).toBeInTheDocument();
  expect(screen.getAllByLabelText('Question in English')).toHaveLength(3); // Quick check stays free-form.
});
