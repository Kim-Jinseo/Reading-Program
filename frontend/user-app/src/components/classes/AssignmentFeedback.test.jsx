import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentFeedback } from './AssignmentFeedback';

test('saved audio resets and revokes the old object URL when the displayed attempt changes', async () => {
  const original = { fetch: global.fetch, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  global.fetch = jest.fn(async () => ({ ok: true, blob: async () => new Blob(['voice'], { type: 'audio/webm' }) }));
  URL.createObjectURL = jest.fn(() => 'blob:first-attempt'); URL.revokeObjectURL = jest.fn();
  const assignment = { id: 'speak1', format: 'speaking', maxAttempts: 3, speaking: { sentence: 'Read this.' } };
  const attempt = requestId => ({ requestId, submittedAt: '2026-09-07T10:00:00Z', score: 2, total: 3, feedback: 'Keep practicing.', hasAudio: true });
  let view;
  try {
    view = render(<AssignmentFeedback assignment={assignment} attempts={[attempt('first')]} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Listen to saved recording' }));
    expect(await screen.findByLabelText('Saved recording')).toHaveAttribute('src', 'blob:first-attempt');
    view.rerender(<AssignmentFeedback assignment={assignment} attempts={[attempt('second')]} lang="en" />);
    expect(screen.queryByLabelText('Saved recording')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Listen to saved recording' })).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first-attempt');
  } finally {
    view?.unmount(); global.fetch = original.fetch; URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke;
  }
});
