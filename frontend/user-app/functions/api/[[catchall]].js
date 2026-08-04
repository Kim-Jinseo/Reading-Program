export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Reconstruct the destination URL to point to Vercel
  // url.pathname starts with /api/...
  const targetUrl = `https://reading-program-wine.vercel.app${url.pathname}${url.search}`;

  // Clone headers and remove ones that could cause Vercel to reject the request
  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.delete('Host');
  modifiedHeaders.delete('Referer');

  // Prepare the proxy fetch options
  const fetchOptions = {
    method: request.method,
    headers: modifiedHeaders,
    redirect: 'manual'
  };

  // Only attach the body for methods that allow payloads
  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    // We can stream the body directly to Vercel
    fetchOptions.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    
    // Create a new response to return to the client
    const proxyResponse = new Response(response.body, response);
    
    // We don't strictly need CORS headers since the request is same-origin from the browser's perspective,
    // but we can add them just in case they are needed for any external tools.
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return proxyResponse;
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Proxy failed to reach Vercel backend' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
