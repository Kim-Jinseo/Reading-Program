import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { createClassroomRouter } from '../../server/classrooms.js';
import { createLessonRouter } from '../../server/lessons.js';
import { memoryDb } from './memoryDb.js';

export const teacher = '111111111111111111111111', student = '222222222222222222222222',
  other = '333333333333333333333333', admin = '444444444444444444444444';
export async function approvalHarness() {
  const db = memoryDb();
  for (const [id, role, username] of [[teacher, 'teacher', 'Teacher A'], [student, 'student', 'student-account'], [other, 'teacher', 'Teacher B'], [admin, 'admin', 'Administrator']])
    await db.users.insertOne({ _id: new ObjectId(id), role, username, tokenVersion: 0, pin: 'SECRET-PIN', passwordHash: 'SECRET-HASH' });
  const requireAuth = async (c, next) => {
    const userId = c.req.header('authorization');
    if (!userId) return c.json({}, 401);
    c.set('user', { userId, tokenVersion: 0, role: 'admin' });
    await next();
  };
  const app = createClassroomRouter({ getDb: async () => db, requireAuth });
  const lessonApp = createLessonRouter({ getDb: async () => db, requireAuth });
  const call = router => async (path, who = teacher, body) => {
    const response = await router.request(path, { method: body === undefined ? 'GET' : 'POST',
      headers: { ...(who ? { authorization: who } : {}), 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: response.headers.get('content-type')?.includes('json') ? await response.json() : await response.text(), headers: response.headers };
  };
  const request = call(app), lessonRequest = call(lessonApp);
  const created = await request('/classes', teacher, { name: 'Class A' });
  assert.equal(created.status, 201);
  const classroom = created.body.class;
  await db.classes.updateOne({ _id: classroom.id }, { $set: { collectionId: 'course', lessonRevision: 0 } });
  const join = (who = student, name = '小明') => request('/classes/join', who, { code: classroom.invitationCode, displayName: name });
  const decide = (requestId, decision = 'approve', who = teacher) => request(`/classes/${classroom.id}/join-requests/${requestId}/decision`, who, { decision });
  return { db, request, lessonRequest, classroom, join, decide };
}
