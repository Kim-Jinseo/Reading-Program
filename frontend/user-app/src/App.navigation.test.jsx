import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

jest.mock('./context/AppContext', () => {
  const actual = jest.requireActual('./context/AppContext');
  const Probe = () => {
    const { setView } = actual.useAppContext();
    return <><button onClick={() => setView('practice')}>Attempt hidden view</button><button onClick={() => setView('shop')}>Attempt hidden shop</button></>;
  };
  return { ...actual, AppProvider: ({ children }) => <actual.AppProvider><Probe />{children}</actual.AppProvider> };
});
const originalFetch = global.fetch;
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'navigation-test-session');
  global.fetch = jest.fn(async path => {
    if (path === '/api/auth/me') return { ok: true, json: async () => ({ success: true, user: { id: 'student-1', username: 'Sam', role: 'student', stars: 17, trophies: 23 } }) };
    if (path === '/api/classroom/classes') return { ok: true, json: async () => ({ success: true, classes: [], joinRequests: [] }) };
    if (path === '/api/curriculum') return { ok: true, json: async () => ({ success: false }) };
    throw new Error(`Unexpected navigation request: ${path}`);
  });
});
afterEach(() => { global.fetch = originalFetch; });

test('Home and sidebar hide standalone practice but retain classes and other destinations', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Grades 3–4/ });
  const main = screen.getByRole('main'), nav = screen.getByRole('navigation');
  for (const name of ['Extra practice', 'Vocabulary', 'Grammar', 'Reading', 'Writing', 'Speaking']) {
    expect(within(nav).queryByRole('button', { name, exact: true })).not.toBeInTheDocument();
    expect(within(main).queryByRole('button', { name, exact: true })).not.toBeInTheDocument();
  }
  expect(within(main).queryByRole('region', { name: 'Extra practice' })).not.toBeInTheDocument();
  for (const name of ['Classes', 'Leaderboard', 'Test']) expect(within(main).getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible();
  fireEvent.click(within(nav).getByRole('button', { name: 'Classes' }));
  expect(await screen.findByRole('heading', { name: 'Classes', exact: true })).toBeVisible();
});

test('hidden view navigation cannot render practice modules or leave a blank workspace', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Grades 3–4/ });
  fireEvent.click(screen.getByRole('button', { name: 'Attempt hidden view' }));
  expect(screen.queryByRole('heading', { name: 'Extra practice', exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Home.*Grades 3–4/ })).toBeVisible();
});

test('Shop stays hidden on Home and navigation', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Grades 3–4/ });
  expect(within(screen.getByRole('main')).queryByRole('button', { name: /^Shop\b/ })).not.toBeInTheDocument();
  expect(within(screen.getByRole('navigation')).queryByRole('button', { name: 'Shop', exact: true })).not.toBeInTheDocument();
});

test('direct Shop navigation returns Home instead of rendering the store', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Grades 3–4/ });
  fireEvent.click(screen.getByRole('button', { name: 'Attempt hidden shop' }));
  expect(screen.getByRole('heading', { name: /Home.*Grades 3–4/ })).toBeVisible();
  expect(screen.queryByRole('heading', { name: /Shop/i })).not.toBeInTheDocument();
});

test('collapsed navigation and Chinese Home retain classes without practice entry points', async () => {
  render(<App />);
  await screen.findByRole('heading', { name: /Home.*Grades 3–4/ });
  fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
  fireEvent.click(screen.getByRole('button', { name: '中文' }));
  expect(within(screen.getByRole('navigation')).getByRole('button', { name: '班级' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '拓展练习' })).not.toBeInTheDocument();
  expect(screen.queryAllByRole('button', { name: /商店/ })).toHaveLength(0);
});
