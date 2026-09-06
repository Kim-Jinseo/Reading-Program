import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import App from './App';
import { getTodayString } from './utils/dailySelection';

const originalFetch = global.fetch;
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'navigation-test-session');
  global.fetch = jest.fn(async path => {
    if (path === '/api/auth/me') return { ok: true, json: async () => ({ success: true, user: {
      id: 'student-1', username: '小明', role: 'student', stars: 17, trophies: 23,
      dailyProgress: { '3-4_vocab': { date: getTodayString(), bestStars: 2, itemId: [1001] } },
    } }) };
    if (path === '/api/curriculum') return { ok: true, json: async () => ({ success: false }) };
    throw new Error(`Unexpected navigation request: ${path}`);
  });
});
afterEach(() => { global.fetch = originalFetch; });

async function openApp() {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Level 2/ });
  return { main: screen.getByRole('main'), nav: screen.getByRole('navigation') };
}

test('sidebar groups the five subjects under one Extra practice destination', async () => {
  const { nav } = await openApp();
  const menu = within(nav);
  for (const name of ['Vocabulary', 'Grammar', 'Reading', 'Writing', 'Speaking']) {
    expect(menu.queryByRole('button', { name, exact: true })).not.toBeInTheDocument();
  }
  fireEvent.click(menu.getByRole('button', { name: 'Extra practice', exact: true }));
  expect(screen.getByRole('heading', { name: 'Extra practice', exact: true })).toBeInTheDocument();
  expect(menu.getByRole('button', { name: 'Extra practice', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(screen.queryByText('Infinite Extra Practice')).not.toBeInTheDocument();
});

test.each([
  ['Vocabulary', 'Daily Vocab 📖'], ['Grammar', 'Daily Grammar 📜'],
  ['Reading', 'Daily Reading 📘'], ['Writing', "Today's Writing Mission ✏️"],
  ['Speaking', 'Daily Speaking 🎙️'],
])('%s opens its existing exercises and returns to the practice hub', async (subject, heading) => {
  const { main, nav } = await openApp();
  fireEvent.click(within(nav).getByRole('button', { name: 'Extra practice', exact: true }));
  fireEvent.click(within(main).getByRole('button', { name: subject, exact: true }));
  expect(within(main).getByRole('heading', { name: heading, exact: true })).toBeInTheDocument();
  expect(within(nav).getByRole('button', { name: 'Extra practice', exact: true })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(within(main).getByRole('button', { name: 'Back to Extra practice', exact: true }));
  expect(within(main).getByRole('heading', { name: 'Extra practice', exact: true })).toBeInTheDocument();
  expect(within(main).getByRole('button', { name: subject, exact: true })).toBeInTheDocument();
});

test('Home lists main destinations first and keeps daily progress on the lower subject cards', async () => {
  const { main } = await openApp();
  const practice = within(main).getByRole('region', { name: 'Extra practice' });
  const classes = within(main).getByRole('button', { name: /^Classes/ });
  expect(classes.compareDocumentPosition(practice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(practice).getAllByRole('button')).toHaveLength(5);
  expect(within(within(practice).getByRole('button', { name: 'Vocabulary', exact: true })).getByText('Daily done')).toBeInTheDocument();
  expect(within(practice).getByRole('button', { name: 'Vocabulary', exact: true })).toHaveAccessibleDescription(/Daily done/);
  for (const name of ['Leaderboard', 'Shop', 'Test']) expect(within(main).getByRole('button', { name: new RegExp(`^${name}`) })).toBeInTheDocument();
  fireEvent.click(within(practice).getByRole('button', { name: 'Reading', exact: true }));
  fireEvent.click(within(main).getByRole('button', { name: 'Back to Extra practice' }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem('savedUserData')).stars).toBe(17));
  expect(global.fetch.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(0);
});

test('collapsed navigation keeps an accessible practice link and new controls translate to Chinese', async () => {
  const { nav, main } = await openApp();
  fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
  fireEvent.click(within(nav).getByRole('button', { name: 'Extra practice', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '中文', exact: true }));
  expect(within(main).getByRole('heading', { name: '拓展练习', exact: true })).toBeInTheDocument();
  fireEvent.click(within(main).getByRole('button', { name: '词汇', exact: true }));
  fireEvent.click(within(main).getByRole('button', { name: '返回拓展练习', exact: true }));
  expect(within(nav).getByRole('button', { name: '拓展练习', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('opening a lower Home card and returning to the hub reset the workspace scroll', async () => {
  const { main } = await openApp();
  const workspace = main.querySelector('.overflow-y-auto');
  workspace.scrollTop = 512;
  fireEvent.click(within(main).getByRole('button', { name: 'Speaking', exact: true }));
  expect(workspace.scrollTop).toBe(0);
  workspace.scrollTop = 300;
  fireEvent.click(within(main).getByRole('button', { name: 'Back to Extra practice' }));
  expect(workspace.scrollTop).toBe(0);
});
