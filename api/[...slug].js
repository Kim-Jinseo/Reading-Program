import { Hono } from 'hono';
export const config = { runtime: 'edge' };
const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', msg: 'Edge Runtime works' }));
app.post('/auth/login', (c) => c.json({ status: 'ok', msg: 'POST auth login Edge works' }));
export default app;