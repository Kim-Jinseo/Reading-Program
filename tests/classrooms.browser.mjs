// Optional local browser QA against synthetic data; never connects to MongoDB.
// Build frontend/user-app first. Set CLASSROOM_PLAYWRIGHT_MODULE if Playwright
// is provided by a separate development runtime, then run this file with Node.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import { createClassroomRouter } from '../server/classrooms.js';
import { memoryDb } from './helpers/memoryDb.js';

const { chromium } = await import(process.env.CLASSROOM_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.CLASSROOM_PLAYWRIGHT_MODULE).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'frontend/user-app/build');
const artifacts = path.join(root, 'artifacts/classrooms');
await mkdir(artifacts, { recursive: true });
const db = memoryDb();
const ids = { admin: '111111111111111111111111', teacher: '222222222222222222222222', student: '333333333333333333333333' };
for (const [name, id] of Object.entries(ids)) await db.users.insertOne({ _id: new ObjectId(id), username: name + ' Demo', role: name === 'admin' ? 'admin' : 'student', tokenVersion: 0 });
const publicUser = ({ _id, username, role }) => ({ id: String(_id), username, role });
const app = new Hono();
const sessionId = c => c.req.header('authorization')?.replace(/^Bearer /, '');
app.get('/api/auth/me', async c => {
  const id = sessionId(c);
  const user = ObjectId.isValid(id) ? await db.users.findOne({ _id: new ObjectId(id) }) : null;
  return user ? c.json({ success: true, user: publicUser(user) }) : c.json({ success: false }, 401);
});
app.get('/api/curriculum', c => c.json({ success: false }));
app.get('/api/leaderboard', c => c.json({ success: true, data: [] }));
app.route('/api/classroom', createClassroomRouter({ getDb: async () => db, publicUser, createSessionToken: async u => String(u._id), requireAuth: async (c, next) => {
  const id = sessionId(c);
  if (!Object.values(ids).includes(id)) return c.json({ success: false }, 401);
  c.set('user', { userId: id, tokenVersion: 0 });
  await next();
} }));
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const response = await app.request(url.href, { method: req.method, headers: req.headers, ...(body.length ? { body } : {}) });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const filename = path.resolve(build, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!filename.startsWith(build + path.sep)) { res.writeHead(404); res.end(); return; }
    const content = await readFile(filename);
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(filename)] || 'application/octet-stream');
    res.end(content);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CLASSROOM_BROWSER_CHANNEL ? { channel: process.env.CLASSROOM_BROWSER_CHANNEL } : {}) });
  const newUser = async name => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', hasTouch: name === 'student' });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await context.addInitScript(id => localStorage.setItem('token', id), ids[name]);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.getByRole('navigation').getByRole('button', { name: 'Classes', exact: true }).click();
    return page;
  };
  const layout = async (page, label) => {
    for (const [device, width, height] of [['desktop', 1440, 1000], ['tablet', 820, 1180], ['phone', 390, 844], ['small-phone', 320, 740]]) {
      await page.setViewportSize({ width, height });
      const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && getComputedStyle(element).visibility !== 'hidden' && (rect.right > innerWidth + 2 || rect.left < -2);
      }).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 60) })).slice(0, 4));
      assert.deepEqual(overflow, [], `${label} overflows ${device}: ${JSON.stringify(overflow)}`);
      await page.screenshot({ path: path.join(artifacts, `${label}-${device}.png`), animations: 'disabled' });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  };
  const admin = await newUser('admin');
  await admin.getByRole('button', { name: 'Generate teacher code', exact: true }).click();
  const teacherCode = await admin.getByLabel('Copy this code now').inputValue();
  const teacher = await newUser('teacher');
  await teacher.getByText('Are you a teacher?', { exact: true }).click();
  await teacher.getByLabel('Teacher verification code').fill(teacherCode);
  await teacher.getByRole('button', { name: 'Verify teacher', exact: true }).click();
  await teacher.getByLabel('Class name', { exact: true }).fill('Monday English');
  await teacher.getByRole('button', { name: 'Create class', exact: true }).click();
  const classCode = await teacher.getByLabel('Share this class invitation code with students').inputValue();
  await teacher.getByRole('button', { name: 'New assignment', exact: true }).click();
  await teacher.getByLabel('Copy questions from a lesson (optional)').selectOption('0');
  await teacher.getByRole('button', { name: 'Use this lesson', exact: true }).click();
  await layout(teacher, 'teacher-editor');
  await teacher.getByRole('button', { name: 'Publish assignment', exact: true }).click();
  await teacher.getByRole('heading', { name: 'Student progress', exact: true }).waitFor();
  const student = await newUser('student');
  await layout(student, 'student-join');
  await student.getByLabel('Class invitation code', { exact: true }).fill(classCode);
  await student.getByLabel('Your name for the teacher', { exact: true }).fill('小明');
  await student.getByRole('button', { name: 'Join class', exact: true }).click();
  await student.getByRole('button', { name: 'Start assignment', exact: true }).click();
  const questions = student.getByRole('radiogroup');
  await questions.first().waitFor();
  for (const group of await questions.all()) await group.getByRole('radio').first().click();
  await layout(student, 'student-assignment');
  await student.getByRole('button', { name: 'Submit assignment', exact: true }).click();
  await student.getByRole('heading', { name: /\d+ \/ \d+ correct/ }).waitFor();
  await layout(student, 'student-result');
  await teacher.getByRole('button', { name: 'Refresh results', exact: true }).click();
  await teacher.getByRole('button', { name: 'View answers and attempts', exact: true }).click();
  await teacher.getByRole('button', { name: 'Load answers', exact: true }).click();
  await teacher.locator('summary').filter({ hasText: 'Attempt 1' }).click();
  await layout(teacher, 'teacher-report');
  await teacher.getByRole('button', { name: '中文', exact: true }).click();
  await teacher.getByRole('heading', { name: '学生学习情况', exact: true }).waitFor();
  await layout(teacher, 'teacher-report-zh');
  assert.equal(db.submissions.docs.length, 1);
  assert.equal(db.submissions.docs[0].attempts.length, 1);
  assert.deepEqual(errors, []);
  console.log('Browser workflow passed: admin invitation → teacher verification → class → assignment → student join/submit → teacher answers. Four viewport sizes, English/Chinese; no page errors or horizontal overflow. Synthetic database only.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
