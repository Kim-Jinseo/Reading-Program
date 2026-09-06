import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { LessonSpeaking } from './LessonSpeaking';

let playback, original;
beforeEach(() => {
  original = { fetch: global.fetch, Audio: global.Audio, create: URL.createObjectURL, revoke: URL.revokeObjectURL, recorder: global.MediaRecorder, media: navigator.mediaDevices };
  playback = { play: jest.fn(async () => {}), pause: jest.fn() };
  global.fetch = jest.fn(async () => ({ ok: true, blob: async () => new Blob(['audio'], { type: 'audio/mpeg' }) }));
  global.Audio = jest.fn(() => playback);
  URL.createObjectURL = jest.fn(() => 'blob:recording');
  URL.revokeObjectURL = jest.fn();
});
afterEach(() => {
  global.fetch = original.fetch; global.Audio = original.Audio; global.MediaRecorder = original.recorder;
  URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke;
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original.media });
});
const props = { sentence: 'I see a desk.', hintZh: '我看到一张课桌。', lang: 'en', onRecording: jest.fn(), onStatus: jest.fn() };

test.each(['onerror', 'onstalled', 'onabort'])('audio %s restores usable controls and supports retry', async event => {
  const { unmount } = render(<LessonSpeaking {...props} />);
  expect(screen.getByText('我看到一张课桌。')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Hear the sentence' }));
  await waitFor(() => expect(playback.play).toHaveBeenCalled());
  act(() => playback[event]?.());
  expect(screen.getByRole('button', { name: /Record \(/ })).toBeEnabled();
  expect(screen.getByRole('alert')).toHaveTextContent(/Audio/);
  fireEvent.click(screen.getByRole('button', { name: 'Hear the sentence' }));
  await waitFor(() => expect(playback.play).toHaveBeenCalledTimes(2));
  unmount();
  expect(playback.pause).toHaveBeenCalled();
});

test('microphone is not ready until recording starts, then offers playback without submitting', async () => {
  let allowMic, recording;
  const stopped = jest.fn(), onRecording = jest.fn();
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => new Promise(resolve => { allowMic = resolve; }) } });
  global.MediaRecorder = class {
    static isTypeSupported() { return true; }
    constructor() { recording = this; this.state = 'inactive'; this.mimeType = 'audio/webm'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['test recording']) }); this.onstop(); }
  };
  render(<LessonSpeaking {...props} onRecording={onRecording} />);
  fireEvent.click(screen.getByRole('button', { name: /Record \(/ }));
  expect(screen.getByRole('status')).toHaveTextContent(/Getting/);
  await act(async () => allowMic({ getTracks: () => [{ stop: stopped }] }));
  expect(screen.getByRole('status')).not.toHaveTextContent(/speak now/i);
  act(() => recording.onstart?.());
  expect(screen.getByRole('status')).toHaveTextContent(/speak now/i);
  fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
  await waitFor(() => expect(onRecording).toHaveBeenLastCalledWith(expect.objectContaining({ audioMime: 'audio/webm', audioBase64: expect.any(String) })));
  expect(stopped).toHaveBeenCalled();
  expect(screen.getByLabelText('Your recording')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('a late failure from an expired audio request cannot interrupt a new playback', async () => {
  jest.useFakeTimers();
  let rejectOld;
  global.fetch.mockImplementationOnce(() => new Promise((resolve, reject) => { rejectOld = reject; }));
  try {
    render(<LessonSpeaking {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hear the sentence' }));
    act(() => jest.advanceTimersByTime(20000));
    expect(screen.getByRole('button', { name: /Record \(/ })).toBeEnabled();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Hear the sentence' })));
    await act(async () => rejectOld(Error('old request aborted')));
    expect(screen.getByRole('status')).toHaveTextContent('Playing the example');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  } finally { jest.useRealTimers(); }
});
