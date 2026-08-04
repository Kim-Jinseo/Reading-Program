import { Hono } from 'hono';
import { handle } from 'hono/vercel';
const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', msg: 'Minimal app works' }));
app.post('/auth/login', (c) => c.json({ status: 'ok', msg: 'POST auth login works' }));
export default handle(app);