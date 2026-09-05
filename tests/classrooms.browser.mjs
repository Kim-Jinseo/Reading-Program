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
import { createLessonRouter } from '../server/lessons.js';
import { memoryDb } from './helpers/memoryDb.js';

const { chromium } = await import(process.env.CLASSROOM_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.CLASSROOM_PLAYWRIGHT_MODULE).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'frontend/user-app/build');
const securityPolicy=(await readFile(path.join(root,'frontend/user-app/public/_headers'),'utf8')).match(/Content-Security-Policy: (.+)/)[1].replace('; upgrade-insecure-requests','');
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
app.route('/api/lessons', createLessonRouter({ getDb:async()=>db, requireAuth:async(c,next)=>{const id=sessionId(c);if(!Object.values(ids).includes(id))return c.json({success:false},401);c.set('user',{userId:id,tokenVersion:0});await next();}, evaluateSpeech:async({sentence})=>({success:true,score:2,feedback:'Synthetic speech-service response for browser testing.',transcript:sentence}) }));
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
    res.setHeader('Content-Security-Policy',securityPolicy);
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(filename)] || 'application/octet-stream');
    res.end(content);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
try {
  browser = await chromium.launch({ headless: true, args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'], ...(process.env.CLASSROOM_BROWSER_CHANNEL ? { channel: process.env.CLASSROOM_BROWSER_CHANNEL } : {}) });
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
  await teacher.getByRole('combobox').selectOption('sample-summer-2026-l2');
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

  // Real course API + compressed sample slides + all five activity kinds.
  await student.getByRole('button',{name:'Back to class',exact:true}).first().click();
  await student.getByRole('button',{name:'Open lesson',exact:true}).click();
  const player=student.getByTestId('lesson-player');
  await player.getByRole('img').waitFor();
  await layout(student,'lesson-slides');
  for(let n=1;n<=8;n++){
    await player.getByRole('img').evaluate(img=>img.complete || new Promise(resolve=>img.addEventListener('load',resolve,{once:true})));
    if(n<8)await player.getByRole('button',{name:'Next slide',exact:true}).click();
  }
  await player.getByRole('button',{name:'I have reviewed all slides',exact:true}).click();
  await player.getByRole('heading',{name:'Saved work',exact:true}).waitFor();
  await player.getByRole('button',{name:'Vocabulary',exact:true}).click();
  for(const [n,text] of ['课桌','椅子','黑板','风扇'].entries())await player.locator('fieldset').nth(n).getByRole('radio',{name:new RegExp(text)}).check();
  await layout(student,'lesson-vocabulary');
  await player.getByRole('button',{name:'Submit this activity',exact:true}).click();
  await player.getByText('4 / 4',{exact:true}).waitFor();
  await player.getByRole('button',{name:'Writing',exact:true}).click();
  await player.getByLabel('Your writing',{exact:true}).fill('There is a blackboard. There are ten desks. I like my desk because it is big.');
  await layout(student,'lesson-writing');
  await player.getByRole('button',{name:'Submit this activity',exact:true}).click();
  await player.getByRole('heading',{name:'Saved work',exact:true}).waitFor();
  await player.getByRole('button',{name:'Speaking',exact:true}).click();
  await player.getByRole('button',{name:'Record (up to 30 seconds)',exact:true}).click();
  await player.getByText('Microphone ready — speak now!',{exact:true}).waitFor();
  await layout(student,'lesson-speaking-ready');
  await player.getByRole('button',{name:'Stop recording',exact:true}).click();
  await player.locator('audio').waitFor();
  await player.getByRole('button',{name:'Submit this activity',exact:true}).click();
  await player.getByText('2 / 3 · Automatic speaking feedback',{exact:true}).waitFor();
  await player.getByRole('button',{name:'Quick check',exact:true}).click();
  for(const [n,text] of ['In the classroom.','The teacher.','A blackboard.'].entries())await player.locator('fieldset').nth(n).getByRole('radio',{name:new RegExp(text)}).check();
  await player.getByRole('button',{name:'Submit this activity',exact:true}).click();
  await player.getByText('All activities submitted. You can review your work below.',{exact:true}).waitFor();
  await player.getByRole('button',{name:'← Back to class',exact:true}).click();
  await teacher.getByRole('button',{name:'Refresh results',exact:true}).click();
  await teacher.getByRole('button',{name:/小明.*1 \/ 1 lessons complete/}).click();
  await teacher.getByRole('button',{name:/Our classroom · 5\/5/}).click();
  await teacher.getByRole('button',{name:'✓ Writing',exact:true}).click();
  await teacher.getByText('There is a blackboard. There are ten desks. I like my desk because it is big.',{exact:true}).waitFor();
  await layout(teacher,'lesson-teacher-work');
  await teacher.getByRole('button',{name:'← Back to class',exact:true}).click();

  await admin.getByRole('button',{name:'Manage lesson library',exact:true}).click();
  await admin.getByLabel('Available courses',{exact:true}).selectOption('sample-summer-2026-l2');
  await admin.getByRole('button',{name:/1. Our classroom/}).click();
  await admin.getByRole('img',{name:/Our classroom: a classroom photo/}).waitFor();
  await layout(admin,'lesson-admin-library');
  await admin.getByRole('button',{name:'Back to library',exact:true}).click();
  await admin.getByRole('button',{name:'Add lesson',exact:true}).click();
  await admin.getByLabel('English title',{exact:true}).fill('PDF upload check');
  await admin.getByLabel('Chinese title',{exact:true}).fill('PDF 上传检查');
  const questionInputs=admin.getByLabel('Question in English',{exact:true});
  for(let n=0;n<await questionInputs.count();n++)await questionInputs.nth(n).fill(`What is in picture ${n+1}?`);
  for(const [choice,text] of [[1,'A desk'],[2,'A dog'],[3,'A cup']])for(const input of await admin.getByRole('textbox',{name:`Choice ${choice}`,exact:true}).all())await input.fill(text);
  await admin.getByLabel('Short sentence to read aloud',{exact:true}).fill('I see a desk.');
  await admin.getByLabel('English prompt',{exact:true}).fill('Write three sentences about your classroom. What do you like? Why?');
  await admin.getByLabel('Chinese prompt',{exact:true}).fill('写三个句子介绍你的教室。你喜欢什么？为什么？');
  // One-page valid PDF fixture, generated without external tools or uploads.
  const pdfObjects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 720 405] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const stream='BT /F1 30 Tf 60 300 Td (Our classroom) Tj 0 -60 Td (I see a desk.) Tj ET';pdfObjects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  let pdf='%PDF-1.4\n',offsets=[0];for(const [i,obj] of pdfObjects.entries()){offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;}const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  await admin.getByLabel('Add PDF / slide images (up to 40 slides)',{exact:true}).setInputFiles({name:'classroom.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf)});
  await admin.getByText(/1 new slides · .*MB after compression/).waitFor({timeout:60000});
  await admin.getByRole('button',{name:'Save draft and upload previews',exact:true}).click();
  await admin.getByText('Draft saved. Preview the slides and check every answer before publishing.',{exact:true}).waitFor();
  admin.once('dialog',d=>d.accept());
  await admin.getByRole('button',{name:'Publish — available immediately',exact:true}).click();
  await admin.getByText('Published. Matching classes can start this lesson now.',{exact:true}).waitFor();
  await student.getByRole('button',{name:'Refresh results',exact:true}).click();
  await student.getByRole('heading',{name:'PDF upload check',exact:true}).waitFor();
  assert.equal(db.lessonParts.docs.length,5);
  assert.equal(db.lessons.docs.filter(l=>l.published).length,2);
  console.log('Lesson browser workflow passed: compressed sample slides, vocabulary, writing, fake-microphone speaking, quick check, teacher results; real browser PDF conversion/upload/publication available immediately.');
  await teacher.getByRole('button', { name: '中文', exact: true }).click();
  await teacher.getByRole('heading', { name: '学生学习情况', exact: true }).waitFor();
  await layout(teacher, 'teacher-report-zh');
  assert.equal(db.submissions.docs.length, 1);
  assert.equal(db.submissions.docs[0].attempts.length, 1);
  assert.deepEqual(errors, []);
  console.log('Browser workflow passed: admin invitation → teacher verification → class → assignment → student join/submit → teacher answers. Four viewport sizes, English/Chinese; no page errors or horizontal overflow. Synthetic database only.');
} catch(error) {
  for(const [n,context] of (browser?.contexts()||[]).entries())for(const page of context.pages()){
    console.error(`Browser ${n} state:`,(await page.locator('body').innerText()).slice(-7500));
    await page.screenshot({path:path.join(artifacts,`last-error-${n}.png`),animations:'disabled'});
  }
  console.error('Page errors:',errors);throw error;
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
