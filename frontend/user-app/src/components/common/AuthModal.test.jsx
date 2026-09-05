import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { useAppContext } from '../../context/AppContext';
import { TRANSLATIONS } from '../../data/translations';
jest.mock('../../context/AppContext', () => ({ useAppContext: jest.fn() }));

const setUser = jest.fn();
beforeEach(() => {
  localStorage.clear(); setUser.mockClear();
  useAppContext.mockReturnValue({ lang: 'en', t: key => TRANSLATIONS.en[key], setUser });
  global.fetch = jest.fn();
});
afterEach(() => jest.restoreAllMocks());
function signup() {
  render(<AuthModal />);
  fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
  fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: '  Student  ' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'test-password-only' } });
  return screen.getAllByRole('button', { name: 'Sign Up' }).at(-1);
}
test('repeated submits send one signup request and display an in-progress state', async () => {
  let finish;
  fetch.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const button = signup();
  fireEvent.submit(button.closest('form'));
  fireEvent.submit(button.closest('form'));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent(/creating/i);
  await act(async () => finish({ ok: true, json: async () => ({ success: true, token: 'synthetic-session', user: { username: 'Student', role: 'student' } }) }));
  expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Student', isGuest: false }));
  expect(localStorage.getItem('token')).toBe('synthetic-session');
  expect(JSON.parse(fetch.mock.calls[0][1].body).username).toBe('Student');
});
test('a server failure is visible, leaves the student signed out, and clears when switching modes', async () => {
  fetch.mockResolvedValue({ ok: false, json: async () => ({ success: false, error: 'Account creation is temporarily unavailable.' }) });
  fireEvent.click(signup());
  expect(await screen.findByRole('alert')).toHaveTextContent('Account creation is temporarily unavailable.');
  expect(setUser).not.toHaveBeenCalled();
  expect(localStorage.getItem('token')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
test('a malformed success response cannot store an invalid session', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, user: { username: 'Student' } }) });
  fireEvent.click(signup());
  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  expect(localStorage.getItem('token')).toBeNull();
  expect(setUser).not.toHaveBeenCalled();
});
test('non-JSON server failures offer a recoverable message and re-enable signup', async () => {
  fetch.mockResolvedValue({ ok: false, json: async () => { throw new Error('HTML gateway error'); } });
  const button = signup(); fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent(/unavailable|connect|try again/i);
  expect(button).not.toBeDisabled();
  expect(localStorage.getItem('token')).toBeNull();
});

test('a stalled request times out without leaving signup permanently disabled', async () => {
  jest.useFakeTimers();
  try {
    fetch.mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('Request timed out')), { once: true });
    }));
    const button = signup(); fireEvent.click(button);
    expect(button).toBeDisabled();
    await act(async () => jest.advanceTimersByTime(30000));
    expect(button).not.toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/try again/i);
    expect(setUser).not.toHaveBeenCalled();
  } finally { jest.useRealTimers(); }
});
