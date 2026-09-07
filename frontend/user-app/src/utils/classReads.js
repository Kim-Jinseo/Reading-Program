// Private, short-lived in-memory reads only. Never persist class data to disk.
let session;
const copy = value => JSON.parse(JSON.stringify(value));
const affectedReads = key => {
  const match = key.match(/^\/(?:lessons|classroom)\/classes\/([^/?]+)\//);
  if (!match) return () => true; // Unknown mutation: invalidate conservatively.
  const classId = match[1];
  return readKey => readKey === '/classroom/classes' ||
    ['/lessons/classes/', '/classroom/classes/'].some(prefix =>
      readKey === prefix + classId || readKey.startsWith(prefix + classId + '/') || readKey.startsWith(prefix + classId + '?'));
};
export async function classRequest({ token, key, write, fresh }, load) {
  if (!session || session.token !== token) session = { token, entries: new Map(), writes: new Set() };
  const scope = session;
  const invalidate = (affected = () => true) => {
    for (const entryKey of scope.entries.keys()) if (affected(entryKey)) scope.entries.delete(entryKey);
  };
  if (write) {
    const affected = affectedReads(key);
    invalidate(affected); scope.writes.add(affected);
    try { return await load(); }
    finally { scope.writes.delete(affected); invalidate(affected); }
  }
  if (fresh && !scope.entries.get(key)?.pending) scope.entries.delete(key);
  if (!token || [...scope.writes].some(affected => affected(key))) return load();
  const cached = scope.entries.get(key);
  if (cached && (cached.pending || cached.expires > Date.now())) return copy(await cached.promise);
  const entry = { pending: true };
  entry.promise = load().then(value => {
    entry.pending = false;
    entry.expires = Date.now() + 30000;
    return value;
  }).catch(error => {
    if (scope.entries.get(key) === entry) scope.entries.delete(key);
    if (error.status === 401 || error.status === 403) invalidate();
    throw error;
  });
  if (scope.entries.size >= 40) scope.entries.delete(scope.entries.keys().next().value);
  scope.entries.set(key, entry);
  return copy(await entry.promise);
}
