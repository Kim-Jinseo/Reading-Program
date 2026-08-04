import { Hono } from 'hono';

const app = new Hono().basePath('/api');
app.get('/health', (c) => c.json({ status: 'ok', msg: 'Manual adapter works' }));
app.post('/auth/login', (c) => c.json({ status: 'ok', msg: 'Manual adapter POST works' }));

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `${protocol}://${host}`);
    
    const init = {
      method: req.method,
      headers: req.headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        // Vercel pre-parses body sometimes, if not we could stream it. For simplicity, just stringify if it's an object
        init.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }
    }
    
    const request = new Request(url, init);
    const response = await app.fetch(request);
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}