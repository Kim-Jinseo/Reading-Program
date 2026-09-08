import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { collectionName } from './shared';
import { CoursePicker } from './CoursePicker';

test.each([
  [1, 'en', '2026 Summer · Grades 1–2'],
  [2, 'en', '2026 Summer · Grades 3–4'],
  [3, 'en', '2026 Summer · Grades 5–6'],
  [1, 'zh', '2026 暑期 · 1–2 年级'],
  [2, 'zh', '2026 暑期 · 3–4 年级'],
  [3, 'zh', '2026 暑期 · 5–6 年级'],
])('course level %s is presented as its grade band in %s', (level, lang, expected) => {
  expect(collectionName({ year: 2026, season: 'summer', level }, lang)).toBe(expected);
});

test('choosing a displayed grade band keeps the original course identifier', () => {
  const onChange = jest.fn();
  render(<CoursePicker lang="en" value="summer" onChange={onChange} collections={[
    { id: 'summer', year: 2026, season: 'summer', level: 1 },
    { id: 'autumn', year: 2026, season: 'autumn', level: 3 },
  ]} />);
  const course = screen.getByRole('combobox', { name: 'Term and grade band' });
  expect(screen.getByRole('option', { name: '2026 Autumn · Grades 5–6' })).toHaveValue('autumn');
  fireEvent.change(course, { target: { value: 'autumn' } });
  expect(onChange).toHaveBeenCalledWith('autumn');
});
