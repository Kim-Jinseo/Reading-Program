import { Hono } from 'hono';
const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', msg: 'Web Standard works on Node' }));
export default function(req) { return app.fetch(req); }