// A database-boundary adapter for route tests: no production accounts or network.
import { ObjectId } from 'mongodb';
const clone = value => value instanceof ObjectId ? new ObjectId(value) : value instanceof Date ? new Date(value) : Array.isArray(value) ? value.map(clone) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)])) : value;
const eq = (a, b) => a instanceof ObjectId || b instanceof ObjectId ? String(a) === String(b) : a === b;
const path = (obj, parts) => !parts.length ? obj : Array.isArray(obj) && !/^\d+$/.test(parts[0]) ? obj.flatMap(item => path(item, parts)) : path(obj?.[parts[0]], parts.slice(1));
function matches(doc, query) {
  return Object.entries(query).every(([key, wanted]) => {
    const value = path(doc, key.split('.'));
    if (wanted && typeof wanted === 'object' && !(wanted instanceof ObjectId) && !(wanted instanceof Date)) {
      return Object.entries(wanted).every(([op, target]) => {
        if (op === '$in') return target.some(item => eq(value, item));
        if (op === '$ne') return Array.isArray(value) ? !value.some(item => eq(item, target)) : !eq(value, target);
        if (op === '$exists') return (value !== undefined) === target;
        if (op === '$lt') return value < target;
        if (op === '$gt') return value > target;
        throw new Error('Unsupported test query: ' + op);
      });
    }
    return Array.isArray(value) ? value.some(item => eq(item, wanted)) : eq(value, wanted);
  });
}
class MemoryCollection {
  docs = [];
  async createIndex() {}
  find(query = {}) {
    let rows = this.docs.filter(doc => matches(doc, query));
    const cursor = {
      sort(order) { rows.sort((a, b) => { for (const [key, direction] of Object.entries(order)) { if (a[key] < b[key]) return -direction; if (a[key] > b[key]) return direction; } return 0; }); return cursor; },
      limit(n) { rows = rows.slice(0, n); return cursor; },
      async toArray() { return clone(rows); }
    };
    return cursor;
  }
  async findOne(query) { return clone(this.docs.find(doc => matches(doc, query)) || null); }
  async countDocuments(query) { return this.docs.filter(doc => matches(doc, query)).length; }
  async insertOne(doc) {
    if (this.docs.some(row => eq(row._id, doc._id))) throw Object.assign(new Error('Duplicate'), { code: 11000 });
    this.docs.push(clone(doc)); return { insertedId: doc._id };
  }
  async updateOne(query, update, options = {}) {
    let doc = this.docs.find(row => matches(row, query));
    if (!doc && options.upsert) {
      doc = { ...clone(query), ...clone(update.$setOnInsert || {}) };
      await this.insertOne(doc); doc = this.docs.at(-1);
    } else if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    Object.assign(doc, clone(update.$set || {}));
    for (const key of Object.keys(update.$unset || {})) delete doc[key];
    for (const [key, value] of Object.entries(update.$inc || {})) doc[key] = (doc[key] || 0) + value;
    for (const [key, value] of Object.entries(update.$addToSet || {})) { doc[key] ||= []; if (!doc[key].some(item => eq(item, value))) doc[key].push(clone(value)); }
    for (const [key, value] of Object.entries(update.$push || {})) { doc[key] ||= []; doc[key].push(clone(value)); }
    return { matchedCount: 1, modifiedCount: 1 };
  }
}
export function memoryDb() {
  const db=Object.fromEntries(['users', 'classes', 'assignments', 'submissions', 'teacherInvites', 'classroomLimits', 'lessonCollections', 'lessons', 'lessonAssets', 'lessonParts'].map(name => [name, new MemoryCollection()]));
  // Serial test boundary, not an implementation of Mongo's transaction engine.
  let queue=Promise.resolve();
  db.withLessonTransaction=work=>{const result=queue.then(()=>work(undefined));queue=result.catch(()=>{});return result;};
  return db;
}
