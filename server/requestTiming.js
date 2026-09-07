// Browser Network tools can separate server work from network/download time.
// Do not include account IDs, answers, URLs, or database configuration.
export async function requestTiming(c, next) {
  const start = performance.now();
  await next();
  c.header('Server-Timing', `app;dur=${(performance.now() - start).toFixed(1)}`);
}
