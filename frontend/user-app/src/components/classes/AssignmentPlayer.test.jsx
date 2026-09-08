import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AssignmentPlayer } from './AssignmentPlayer';
import { randomFillSync } from 'crypto';
import { guardedViewChange } from '../../utils/navigationGuard';

// This older jsdom lacks the Web Crypto API provided by HTTPS browsers.
Object.defineProperty(window, 'crypto', { value: { getRandomValues: randomFillSync }, configurable: true });

const lesson = { id: 'quiz1', title: 'At the farm', instructions: 'Read and choose.', passage: 'A duck swims.', maxAttempts: 2, questions: [
  { id: 'q1', prompt: 'What swims?', options: [{ id: 'a', text: 'A duck' }, { id: 'b', text: 'A hen' }] }
] };
const question = (id, prompt) => ({ id, prompt, options: [{ id: `${id}-a`, text: 'First choice' }, { id: `${id}-b`, text: 'Second choice' }] });

test.each([1, 5])('vocabulary with %s words opens on flashcards and starts the matching quiz only after explicit action', count => {
  const words = [{ word: 'duck', meaningZh: '鸭子' }, { word: 'cat', meaningZh: '猫' }, { word: 'bird', meaningZh: '鸟' }, { word: 'fish', meaningZh: '鱼' }, { word: 'dog', meaningZh: '狗' }].slice(0, count);
  const assignment = { ...lesson, format: 'quiz', subject: 'vocab', learning: { words }, questions: words.map((w, i) => question(`word-${i}`, `What does ${w.word} mean?`)) };
  render(<AssignmentPlayer data={{ assignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
  expect(screen.getByText('Learn the words first')).toBeInTheDocument();
  expect(screen.getByText('duck')).toBeInTheDocument();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  for (const [i, word] of words.entries()) {
    expect(screen.getByText(`Word ${i + 1} of ${count}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Flip card: ${word.word}` }));
    expect(screen.getByText(word.meaningZh)).toBeInTheDocument();
    if (i + 1 < count) fireEvent.click(screen.getByRole('button', { name: 'Next word' }));
  }
  fireEvent.click(screen.getByRole('button', { name: 'Start quiz' }));
  expect(screen.getAllByRole('radio')).toHaveLength(count * 2);
});

test('grammar explains one concept before exactly three related questions', () => {
  const assignment = {
    ...lesson,
    format: 'quiz',
    subject: 'grammar',
    learning: {
      description: { en: 'Use is for one thing.', zh: '一个事物使用 is。' },
      rule: { en: 'He is. She is. It is.', zh: 'He、She、It 后使用 is。' },
    },
    questions: [question('q1', 'Question one'), question('q2', 'Question two'), question('q3', 'Question three')],
  };
  render(<AssignmentPlayer data={{ assignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
  expect(screen.getByText('Learn the grammar first')).toBeInTheDocument();
  expect(screen.getByText('Use is for one thing.')).toBeInTheDocument();
  expect(screen.getByText('He is. She is. It is.')).toBeInTheDocument();
  expect(screen.queryByText('Question one')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start quiz' }));
  expect(screen.getAllByText(/Question (one|two|three)/)).toHaveLength(3);
});

test('returning to learning does not destroy editable quiz choices', () => {
  const assignment = { ...lesson, format: 'quiz', subject: 'vocab', learning: { words: [{ word: 'duck', meaningZh: '鸭子' }] } };
  render(<AssignmentPlayer data={{ assignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start quiz' }));
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Review word cards' }));
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Return to quiz' }));
  expect(screen.getByRole('radio', { name: /A duck/ })).toHaveAttribute('aria-checked', 'true');
});
test('selection can change before submit and only submission sends the chosen answer', async () => {
  const calls = [];
  const api = async (path, body) => { calls.push({ path, body }); return { attempt: { score: 0, total: 1, requestId: body.requestId, submittedAt: '2026-09-05T10:00:00Z', responses: [{ questionId: 'q1', optionId: 'b', correctOptionId: 'a', correct: false }] } }; };
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('radio', { name: /A hen/ }));
  expect(calls).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Submit extra practice' }));
  await screen.findByText('0 / 1 correct');
  expect(calls[0].body.answers).toEqual([{ questionId: 'q1', optionId: 'b' }]);
  expect(screen.getByText(/Correct answer: A duck/)).toBeInTheDocument();
});
test('an incomplete assignment cannot be submitted', () => {
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={async () => { throw Error(); }} lang="en" onBack={() => {}} />);
  expect(screen.getByRole('button', { name: 'Submit extra practice' })).toBeDisabled();
});
test('a network retry keeps its submission identifier and selected answer', async () => {
  const calls = [];
  const api = async (path, body) => { calls.push(body); throw Error('Network unavailable'); };
  render(<AssignmentPlayer data={{ assignment: lesson, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit extra practice' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }));
  await waitFor(() => expect(calls).toHaveLength(2));
  expect(calls[0].requestId).toBe(calls[1].requestId);
  expect(calls[0].answers).toEqual(calls[1].answers);
});
test('a completed assignment has no retry when the teacher allows one attempt', () => {
  render(<AssignmentPlayer data={{ assignment: { ...lesson, maxAttempts: 1 }, attempts: [{ score: 1, total: 1, responses: [], submittedAt: '2026-09-05T10:00:00Z' }] }} api={async () => {}} lang="zh" onBack={() => {}} />);
  expect(screen.getByText('答对 1 / 1 题')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /再试一次/ })).not.toBeInTheDocument();
});
test('an attempt used in another tab shows saved results instead of an endless save retry', async () => {
  const saved = { score: 1, total: 1, responses: [], submittedAt: '2026-09-05T10:00:00Z' };
  const api = async (path, body) => {
    if (body) throw Object.assign(new Error('No attempts left'), { code: 'attempt_limit' });
    return { assignment: { ...lesson, maxAttempts: 1 }, attempts: [saved], review: [] };
  };
  render(<AssignmentPlayer data={{ assignment: { ...lesson, maxAttempts: 1 }, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.click(screen.getByRole('radio', { name: /A duck/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit extra practice' }));
  await screen.findByText('1 / 1 correct');
  expect(screen.queryByRole('button', { name: 'Retry saving' })).not.toBeInTheDocument();
});

const writingAssignment = {
  id: 'writing1', title: 'My room', instructions: 'Write, then submit for feedback.', subject: 'writing', format: 'writing', maxAttempts: 3,
  questions: [], writing: { prompt: 'Describe your room.', promptZh: '描述你的房间。' },
};
const writingAttempt = {
  requestId: 'saved-writing', submittedAt: '2026-09-07T08:00:00Z', score: 4, total: 5, text: 'My room is bright.', automaticallyAssessed: true,
  writingFeedback: { feedback: 'Clear description.', feedbackZh: '描述清楚。', corrections: 'Add an article.', correctionsZh: '添加冠词。', improvement: 'Add one detail.', improvementZh: '增加一个细节。' },
};

const speakingAssignment = {
  id: 'speaking1', title: 'Read aloud', subject: 'speaking', format: 'speaking', maxAttempts: 3, questions: [],
  speaking: { sentence: 'I see a desk.', hintZh: '我看到一张课桌。' },
};
const speakingAttempt = {
  requestId: 'saved-speaking', submittedAt: '2026-09-07T08:00:00Z', score: 2, total: 3,
  feedback: 'Clear speech.', hasAudio: true, automaticallyAssessed: true,
};

function installSpeechCapture() {
  const original = { recorder: global.MediaRecorder, media: navigator.mediaDevices, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  let recorder;
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop: jest.fn() }] }) } });
  global.MediaRecorder = class {
    static isTypeSupported() { return true; }
    constructor() { recorder = this; this.state = 'inactive'; this.mimeType = 'audio/webm'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['recorded voice']) }); this.onstop(); }
  };
  URL.createObjectURL = jest.fn(() => 'blob:voice'); URL.revokeObjectURL = jest.fn();
  return {
    recorder: () => recorder,
    restore: () => {
      global.MediaRecorder = original.recorder;
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original.media });
      URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke;
    },
  };
}

async function finishSpeechRecording(getRecorder) {
  fireEvent.click(screen.getByRole('button', { name: /Record \(/ }));
  await waitFor(() => expect(getRecorder()).toBeDefined());
  act(() => getRecorder().onstart());
  fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
  await screen.findByLabelText('Your recording');
}

test('writing is editable until explicit submission, then shows feedback and remaining attempts', async () => {
  const api = jest.fn(async (path, body) => ({ attempt: { ...writingAttempt, requestId: body.requestId, text: body.text }, review: [] }));
  render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'My room is bright.' } });
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit writing' }));
  expect(await screen.findByText('Writing completed')).toBeInTheDocument();
  expect(screen.getByText('4 / 5')).toBeInTheDocument();
  expect(screen.getByText('Clear description.')).toBeInTheDocument();
  expect(screen.getByText('2 attempts remaining')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/assignments/writing1/submit', { requestId: expect.any(String), text: 'My room is bright.' });
});

test('an uncertain writing retry keeps the frozen request ID and original text', async () => {
  const calls = [];
  const api = jest.fn(async (path, body) => { calls.push(body); if (calls.length === 1) throw new Error('Connection lost'); return { attempt: { ...writingAttempt, requestId: body.requestId, text: body.text } }; });
  render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'Original answer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit writing' }));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Your writing')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving writing' }));
  await screen.findByText('Writing completed');
  expect(calls[1]).toEqual(calls[0]);
});

test('writing keeps its frozen submission after an uncertain response followed by rate limiting', async () => {
  const calls = [];
  const api = jest.fn(async (path, body) => {
    calls.push(body);
    if (calls.length === 1) throw new Error('Connection lost');
    if (calls.length === 2) throw Object.assign(new Error('Too many requests'), { code: 'rate_limited', status: 429 });
    return { attempt: { ...writingAttempt, requestId: body.requestId, text: body.text } };
  });
  render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'Frozen answer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit writing' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving writing' }));
  await waitFor(() => expect(calls).toHaveLength(2));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Retry saving writing' })).toBeEnabled());
  expect(screen.getByLabelText('Your writing')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving writing' }));
  await screen.findByText('Writing completed');
  expect(calls[1]).toEqual(calls[0]);
  expect(calls[2]).toEqual(calls[0]);
});

test('known-unsaved AI failure keeps writing editable and starts a fresh request', async () => {
  const calls = [];
  const api = jest.fn(async (path, body) => {
    calls.push(body);
    if (calls.length === 1) throw Object.assign(new Error('Writing feedback is temporarily unavailable. Nothing was saved.'), { code: 'writing_unavailable', status: 503 });
    return { attempt: { ...writingAttempt, requestId: body.requestId, text: body.text } };
  });
  render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'First draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit writing' }));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Your writing')).toBeEnabled();
  expect(screen.getByLabelText('Your writing')).toHaveValue('First draft');
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'Revised draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Try submission again' }));
  await screen.findByText('Writing completed');
  expect(calls[1].requestId).not.toBe(calls[0].requestId);
  expect(calls[1].text).toBe('Revised draft');
});

test('productive attempt-limit recovery loads the saved result', async () => {
  const api = jest.fn(async (path, body) => {
    if (body) throw Object.assign(new Error('Attempts used'), { code: 'attempt_limit', status: 409 });
    return { assignment: writingAssignment, attempts: [writingAttempt], review: [] };
  });
  render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'My room is bright.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit writing' }));
  expect(await screen.findByText('Writing completed')).toBeInTheDocument();
  expect(screen.queryByLabelText('Your writing')).not.toBeInTheDocument();
});

test('speaking reuses microphone readiness and playback before explicit submission', async () => {
  const original = { recorder: global.MediaRecorder, media: navigator.mediaDevices, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  let recorder;
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop: jest.fn() }] }) } });
  global.MediaRecorder = class {
    static isTypeSupported() { return true; }
    constructor() { recorder = this; this.state = 'inactive'; this.mimeType = 'audio/webm'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['recorded voice']) }); this.onstop(); }
  };
  URL.createObjectURL = jest.fn(() => 'blob:voice'); URL.revokeObjectURL = jest.fn();
  const assignment = { id: 'speaking1', title: 'Read aloud', subject: 'speaking', format: 'speaking', maxAttempts: 3, questions: [], speaking: { sentence: 'I see a desk.', hintZh: '我看到一张课桌。' } };
  const api = jest.fn(async (path, body) => ({ attempt: { requestId: body.requestId, submittedAt: '2026-09-07T08:00:00Z', score: 3, total: 3, feedback: 'Clear speech.', hasAudio: true } }));
  try {
    render(<AssignmentPlayer data={{ assignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Record \(/ }));
    await waitFor(() => expect(recorder).toBeDefined());
    expect(screen.getByRole('status')).not.toHaveTextContent(/speak now/i);
    act(() => recorder.onstart());
    expect(screen.getByRole('status')).toHaveTextContent(/speak now/i);
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
    await screen.findByLabelText('Your recording');
    expect(api).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit recording' }));
    expect(await screen.findByText('Speaking completed')).toBeInTheDocument();
    expect(screen.getByText('Clear speech.')).toBeInTheDocument();
  } finally {
    global.MediaRecorder = original.recorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original.media });
    URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke;
  }
});

test('playing the speaking example does not create an unsent-work navigation guard', async () => {
  const original = { fetch: global.fetch, Audio: global.Audio, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  const playback = { play: jest.fn(async () => {}), pause: jest.fn() };
  global.fetch = jest.fn(async () => ({ ok: true, blob: async () => new Blob(['example'], { type: 'audio/mpeg' }) }));
  global.Audio = jest.fn(() => playback);
  URL.createObjectURL = jest.fn(() => 'blob:example'); URL.revokeObjectURL = jest.fn();
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const view = render(<AssignmentPlayer data={{ assignment: speakingAssignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Hear the sentence' }));
    await waitFor(() => expect(playback.play).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Back to class' })).toBeEnabled();
    expect(guardedViewChange('classes', 'dashboard')).toBe('dashboard');
    expect(confirm).not.toHaveBeenCalled();
  } finally {
    view.unmount(); confirm.mockRestore();
    global.fetch = original.fetch; global.Audio = original.Audio;
    URL.createObjectURL = original.create; URL.revokeObjectURL = original.revoke;
  }
});

test('speech unavailable keeps the recording playable without using an attempt', async () => {
  const speech = installSpeechCapture();
  const api = jest.fn(async () => { throw Object.assign(new Error('Speech feedback is temporarily unavailable. Nothing was saved.'), { code: 'speech_unavailable', status: 503 }); });
  const view = render(<AssignmentPlayer data={{ assignment: speakingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  try {
    await finishSpeechRecording(speech.recorder);
    fireEvent.click(screen.getByRole('button', { name: 'Submit recording' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Your recording')).toHaveAttribute('src', 'blob:voice');
    expect(screen.getByText(/3 attempts remaining/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try submission again' })).toBeEnabled();
  } finally { view.unmount(); speech.restore(); }
});

test('an uncertain speaking retry keeps the identical audio and request ID', async () => {
  const speech = installSpeechCapture(), calls = [];
  const api = jest.fn(async (path, body) => {
    calls.push(body);
    if (calls.length === 1) throw new Error('Connection lost');
    return { attempt: { ...speakingAttempt, requestId: body.requestId } };
  });
  const view = render(<AssignmentPlayer data={{ assignment: speakingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  try {
    await finishSpeechRecording(speech.recorder);
    fireEvent.click(screen.getByRole('button', { name: 'Submit recording' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving recording' }));
    await screen.findByText('Speaking completed');
    expect(calls[1]).toEqual(calls[0]);
    expect(calls[1]).toEqual({ requestId: expect.any(String), audioBase64: expect.any(String), audioMime: 'audio/webm' });
  } finally { view.unmount(); speech.restore(); }
});

test('speaking keeps its frozen submission after an uncertain response followed by provider failure', async () => {
  const speech = installSpeechCapture(), calls = [];
  const api = jest.fn(async (path, body) => {
    calls.push(body);
    if (calls.length === 1) throw new Error('Connection lost');
    if (calls.length === 2) throw Object.assign(new Error('Speech feedback is temporarily unavailable. Nothing was saved.'), { code: 'speech_unavailable', status: 503 });
    return { attempt: { ...speakingAttempt, requestId: body.requestId } };
  });
  const view = render(<AssignmentPlayer data={{ assignment: speakingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  try {
    await finishSpeechRecording(speech.recorder);
    fireEvent.click(screen.getByRole('button', { name: 'Submit recording' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving recording' }));
    await waitFor(() => expect(calls).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry saving recording' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving recording' }));
    await screen.findByText('Speaking completed');
    expect(calls[1]).toEqual(calls[0]);
    expect(calls[2]).toEqual(calls[0]);
  } finally { view.unmount(); speech.restore(); }
});

test('speaking attempt-limit recovery shows the saved result and remaining attempts', async () => {
  const speech = installSpeechCapture();
  const api = jest.fn(async (path, body) => {
    if (body) throw Object.assign(new Error('Attempts used'), { code: 'attempt_limit', status: 409 });
    return { assignment: speakingAssignment, attempts: [speakingAttempt], review: [] };
  });
  const view = render(<AssignmentPlayer data={{ assignment: speakingAssignment, attempts: [] }} api={api} lang="en" onBack={() => {}} />);
  try {
    await finishSpeechRecording(speech.recorder);
    fireEvent.click(screen.getByRole('button', { name: 'Submit recording' }));
    expect(await screen.findByText('Speaking completed')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByText('2 attempts remaining')).toBeInTheDocument();
  } finally { view.unmount(); speech.restore(); }
});

test('in-app navigation can cancel an unsent writing discard and releases the guard on unmount', () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const view = render(<AssignmentPlayer data={{ assignment: writingAssignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
  fireEvent.change(screen.getByLabelText('Your writing'), { target: { value: 'Keep this draft' } });
  expect(guardedViewChange('classes', 'dashboard')).toBe('classes');
  expect(screen.getByLabelText('Your writing')).toHaveValue('Keep this draft');
  confirm.mockReturnValue(true);
  expect(guardedViewChange('classes', 'dashboard')).toBe('dashboard');
  view.unmount();
  confirm.mockClear().mockReturnValue(false);
  expect(guardedViewChange('classes', 'practice')).toBe('practice');
  expect(confirm).not.toHaveBeenCalled();
  confirm.mockRestore();
});

test('microphone preparation is protected before a recording blob exists', async () => {
  const original = { media: navigator.mediaDevices, recorder: window.MediaRecorder };
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => new Promise(() => {}) } });
  window.MediaRecorder = class { static isTypeSupported() { return true; } };
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const assignment = { id: 'speaking1', title: 'Read aloud', subject: 'speaking', format: 'speaking', maxAttempts: 3, questions: [], speaking: { sentence: 'I see a desk.' } };
  try {
    render(<AssignmentPlayer data={{ assignment, attempts: [] }} api={jest.fn()} lang="en" onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Record \(/ }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Getting the microphone ready'));
    expect(guardedViewChange('classes', 'dashboard')).toBe('classes');
    expect(confirm).toHaveBeenCalled();
  } finally {
    confirm.mockRestore();
    window.MediaRecorder = original.recorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: original.media });
  }
});
