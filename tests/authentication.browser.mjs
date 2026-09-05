// Local-only browser regression: real frontend + real auth routes with an
// in-memory database boundary. No production accounts or network requests.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mock } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient, ObjectId } from 'mongodb';
import { memoryDb } from './helpers/memoryDb.js';

const { chromium } = await import(process.env.CLASSROOM_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.CLASSROOM_PLAYWRIGHT_MODULE).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'frontend/user-app/build');
const artifacts = path.join(root, 'artifacts/authentication');
await mkdir(artifacts, { recursive: true });
const policy = (await readFile(path.join(root, 'frontend/user-app/public/_headers'), 'utf8')).match(/Content-Security-Policy: (.+)/)[1].replace('; upgrade-insecure-requests', '');
const db = memoryDb();
const insert = db.users.insertOne.bind(db.users);
db.users.insertOne = doc => insert({ _id: new ObjectId(), ...doc });
mock.method(MongoClient.prototype, 'connect', async function () { return this; });
mock.method(MongoClient.prototype, 'db', () => ({ collection: name => db[name] || {} }));
process.env.MONGODB_URI = 'mongodb://127.0.0.1/synthetic-browser-test';
delete process.env.JWT_SECRET;
const { GET, POST } = await import('../api/index.js');
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/auth/')) {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const response = await (req.method === 'GET' ? GET : POST)(new Request(url, { method: req.method, headers: req.headers, ...(body.length ? { body } : {}) }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false })); return;
    }
    const filename = path.resolve(build, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!filename.startsWith(build + path.sep)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Security-Policy': policy, 'Content-Type': ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(filename)] || 'application/octet-stream' });
    res.end(await readFile(filename));
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CLASSROOM_BROWSER_CHANNEL ? { channel: process.env.CLASSROOM_BROWSER_CHANNEL } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true });
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
  const signup = page.locator('form').getByRole('button', { name: 'Sign Up', exact: true });
  for (const [device, width, height] of [['desktop', 1440, 1000], ['tablet', 820, 1180], ['phone', 390, 844], ['small-phone', 320, 740], ['phone-keyboard', 390, 420]]) {
    await page.setViewportSize({ width, height });
    const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(el => {
      const rect = el.getBoundingClientRect(); return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(el => el.tagName));
    assert.deepEqual(overflow, [], `${device} horizontal overflow`);
    assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    await signup.scrollIntoViewIfNeeded();
    assert.equal(await signup.isVisible(), true);
    await page.getByRole('heading', { name: 'Create Account' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(artifacts, `signup-${device}.png`), animations: 'disabled' });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Your Name').fill('Browser Student');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
  await signup.click();
  await page.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
  assert.equal(db.users.docs.length, 0);
  await page.screenshot({ path: path.join(artifacts, 'signup-error-phone.png') });
  process.env.JWT_SECRET = 'synthetic-browser-test-secret-with-over-32-characters';
  await signup.click();
  await page.getByRole('navigation').waitFor();
  assert.equal(db.users.docs.length, 1);
  assert.equal(db.users.docs[0].role, 'student');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')?.split('.').length), 3);
  await page.reload();
  await page.getByRole('navigation').waitFor(); // Real /auth/me restores the issued JWT.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel('Your Name').fill('Browser Student');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
  await page.locator('form').getByRole('button', { name: 'Log In', exact: true }).click();
  await page.getByRole('navigation').waitFor();
  assert.equal(db.users.docs.length, 1);
  assert.deepEqual(errors, []);
  console.log('PASS: translucent signup at five sizes, safe configuration failure, signup, saved session restore, and login.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  mock.restoreAll();
}
