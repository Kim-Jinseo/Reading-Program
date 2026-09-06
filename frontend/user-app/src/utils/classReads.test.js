import { classroomApi } from '../components/classes/shared';
import { lessonApi } from '../components/lessons/shared';

const response = value => ({ ok: true, json: async () => ({ success: true, value }) });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
let originalFetch, sequence = 0;
beforeEach(() => {
  originalFetch = global.fetch;
  localStorage.setItem('token', `synthetic-session-${++sequence}`);
});
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); localStorage.clear(); });

test('repeated and simultaneous class reads reuse one request, but explicit refresh fetches fresh data', async () => {
  const pending = deferred();
  global.fetch = jest.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(response('new'));
  const first = classroomApi('/classes'), second = classroomApi('/classes');
  pending.resolve(response('old'));
  expect((await first).value).toBe('old');
  expect((await second).value).toBe('old');
  expect((await classroomApi('/classes')).value).toBe('old');
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect((await classroomApi('/classes', undefined, { fresh: true })).value).toBe('new');
});

test('lesson submissions invalidate both class and lesson reads and POST is never cached', async () => {
  let saved = false;
  global.fetch = jest.fn(async (_, options) => {
    if (options.method === 'POST') saved = true;
    return response(saved ? 'completed' : 'not started');
  });
  await classroomApi('/classes/c'); await lessonApi('/classes/c');
  await lessonApi('/classes/c/lessons/l/parts/writing', { text: 'My class.' });
  expect((await classroomApi('/classes/c')).value).toBe('completed');
  expect((await lessonApi('/classes/c')).value).toBe('completed');
  await lessonApi('/classes/c/lessons/l/parts/writing', { text: 'My class.' });
  expect(global.fetch.mock.calls.filter(([, o]) => o.method === 'POST')).toHaveLength(2);
});

test('changing accounts and expired entries require a fresh authorized read', async () => {
  let now = 1000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  global.fetch = jest.fn(async (_, options) => response(options.headers.Authorization));
  expect((await lessonApi('/classes/c')).value).toBe(`Bearer synthetic-session-${sequence}`);
  localStorage.setItem('token', 'different-student');
  expect((await lessonApi('/classes/c')).value).toBe('Bearer different-student');
  now += 31000;
  await lessonApi('/classes/c');
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

test('a read started before a submission cannot repopulate the cache with old progress', async () => {
  const old = deferred();
  global.fetch = jest.fn().mockReturnValueOnce(old.promise).mockResolvedValue(response('saved'));
  const before = lessonApi('/classes/c');
  await lessonApi('/classes/c/lessons/l/parts/slides', {});
  old.resolve(response('outdated'));
  await before;
  expect((await lessonApi('/classes/c')).value).toBe('saved');
});

test('failed requests are not cached', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ code: 'not_found' }) }).mockResolvedValue(response('available'));
  await expect(classroomApi('/classes/c')).rejects.toMatchObject({ status: 403 });
  expect((await classroomApi('/classes/c')).value).toBe('available');
});
