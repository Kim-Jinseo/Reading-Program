import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonPlayer } from './LessonPlayer';

test('switching lesson activities retains the displayed slide and avoids downloading it again', async () => {
  const originalFetch = global.fetch, create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  global.fetch = jest.fn(async () => ({ ok: true, blob: async () => new Blob(['image']) }));
  URL.createObjectURL = jest.fn(() => 'blob:slide');
  URL.revokeObjectURL = jest.fn();
  localStorage.setItem('token', 'synthetic-slide-test');
  const data = { parts: [], revision: 0, lesson: { id: 'l', title: 'Our room', number: 1,
    slides: [{ id: 's', alt: 'Our classroom slide' }], vocabulary: [], questions: [],
    speaking: { sentence: 'This is my room.' }, writing: { prompt: 'Describe your room.', starters: [] } } };
  const { unmount } = render(<LessonPlayer data={data} classId="c" lang="en" onBack={() => {}} />);
  try {
    const image = await screen.findByAltText('Our classroom slide');
    fireEvent.load(image);
    fireEvent.click(screen.getByRole('button', { name: /^Writing/ }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Slides/ }));
    await screen.findByAltText('Our classroom slide');
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'I have reviewed all slides' })).toBeEnabled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:slide');
  } finally {
    unmount();
    global.fetch = originalFetch; URL.createObjectURL = create; URL.revokeObjectURL = revoke; localStorage.clear();
  }
});
