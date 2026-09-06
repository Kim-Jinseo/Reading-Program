// Private, short-lived in-memory reads only. Never persist class data to disk.
let session;
const copy = value => JSON.parse(JSON.stringify(value));
export async function classRequest({ token, key, write, fresh }, load) {
  if (!session || session.token !== token) session = { token, entries: new Map(), generation: 0, writes: 0 };
  const scope = session;
  const invalidate = () => { scope.generation++; scope.entries.clear(); };
  if (write) {
    invalidate(); scope.writes++;
    try { return await load(); }
    finally { scope.writes--; invalidate(); }
  }
  if (fresh) scope.entries.delete(key);
  if (!token || scope.writes) return load();
  const cached = scope.entries.get(key);
  if (cached && (cached.pending || cached.expires > Date.now())) return copy(await cached.promise);
  const generation = scope.generation;
  const entry = { pending: true };
  entry.promise = load().then(value => {
    entry.pending = false;
    entry.expires = Date.now() + 30000;
    if (scope.generation !== generation && scope.entries.get(key) === entry) scope.entries.delete(key);
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
