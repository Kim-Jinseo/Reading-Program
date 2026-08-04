import { Hono } from 'hono';
import { handle } from 'hono/vercel';
const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', msg: 'Node.js Serverless works' }));
app.post('/auth/login', (c) => c.json({ status: 'ok', msg: 'POST auth login Node works' }));
export default handle(app);