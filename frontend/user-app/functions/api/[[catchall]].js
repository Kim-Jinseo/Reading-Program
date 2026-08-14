const API_ORIGIN = 'https://reading-program-wine.vercel.app';
const MAX_PROXY_BODY_BYTES = 5 * 1024 * 1024;
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_PROXY_BODY_BYTES) {
    return new Response(JSON.stringify({ success: false, error: 'Request is too large.' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  const targetUrl = API_ORIGIN + url.pathname + url.search;
  const modifiedHeaders = new Headers(request.headers);
  [
    'host',
    'referer',
    'origin',
    'content-length',
    'x-forwarded-for',
    'x-real-ip',
    'x-vercel-forwarded-for',
    'cf-connecting-ip'
  ].forEach(header => modifiedHeaders.delete(header));

  const fetchOptions = {
    method,
    headers: modifiedHeaders,
    redirect: 'manual'
  };

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_PROXY_BODY_BYTES) {
      return new Response(JSON.stringify({ success: false, error: 'Request is too large.' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }
    fetchOptions.body = body;
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const headers = new Headers(response.headers);
    [
      'access-control-allow-origin',
      'access-control-allow-credentials',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ].forEach(header => headers.delete(header));
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Service is temporarily unavailable.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
}
