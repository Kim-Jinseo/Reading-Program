import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { approvalHarness, teacher, student, other, admin } from './helpers/approvalHarness.js';

test('administrator teacher and class lists expose counts without invitations or student identities', async () => {
  const { db, request, classroom, join } = await approvalHarness();
  await join();
  await db.classes.updateOne({ _id: classroom.id }, { $set: { memberIds: ['555555555555555555555555'], members: [{ id: '555555555555555555555555', name: 'PRIVATE-STUDENT' }] } });
  const list = await request('/admin/teachers', admin);
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.teachers, [
    { id: teacher, name: 'Teacher A', classCount: 1, studentCount: 1, pendingCount: 1 },
    { id: other, name: 'Teacher B', classCount: 0, studentCount: 0, pendingCount: 0 },
  ]);
  assert.equal(list.body.nextCursor, null);
  const detail = await request(`/admin/teachers/${teacher}/classes`, admin);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.teacher.name, 'Teacher A');
  assert.equal(detail.body.classes[0].pendingCount, 1);
  for (const response of [list, detail]) {
    assert.match(response.headers.get('cache-control'), /private.*no-store/);
    for (const secret of ['SECRET', 'PRIVATE-STUDENT', 'student-account', classroom.invitationCode, student]) assert.ok(!JSON.stringify(response.body).includes(secret));
  }
});

test('administrator class report matches lesson completion and activity without raw work or new write/media access', async () => {
  const { db, request, lessonRequest, classroom } = await approvalHarness();
  await db.classes.updateOne({ _id: classroom.id }, { $set: { memberIds: [student], members: [{ id: student, name: '小明' }] } });
  await db.lessons.insertOne({ _id: 'lesson', collectionId: 'course', published: true });
  const submittedAt = new Date();
  for (const part of ['slides', 'vocabulary', 'speaking', 'writing', 'questions'])
    await db.lessonParts.insertOne({ _id: part, classId: classroom.id, lessonId: 'lesson', studentId: student, part,
      attempts: [{ score: 1, total: 1, submittedAt, text: 'PRIVATE-ESSAY', audioBase64: 'PRIVATE-RECORDING' }] });
  const report = await request(`/admin/classes/${classroom.id}/report`, admin);
  assert.equal(report.status, 200);
  assert.deepEqual(report.body.class, { id: classroom.id, name: 'Class A' });
  assert.deepEqual(report.body.teacher, { id: teacher, name: 'Teacher A' });
  assert.deepEqual(report.body.students, [{ id: student, name: '小明', assigned: 1, completed: 1, studyDays28: 1, lastSubmittedAt: submittedAt.toISOString(), activitiesSubmitted: 4 }]);
  assert.ok(!JSON.stringify(report.body).includes('PRIVATE'));
  assert.ok(!JSON.stringify(report.body).includes(classroom.invitationCode));
  assert.equal((await request(`/classes/${classroom.id}/invitation`, admin, {})).status, 404);
  assert.equal((await lessonRequest(`/classes/${classroom.id}/settings`, admin, { collectionId: 'course', revision: 0 })).status, 404);
  assert.equal((await lessonRequest(`/classes/${classroom.id}/lessons/lesson/audio/recording`, admin)).status, 404);
});

test('oversight requires current database administrator role and current session', async () => {
  const { db, request, classroom } = await approvalHarness();
  const paths = ['/admin/teachers', `/admin/teachers/${teacher}/classes`, `/admin/classes/${classroom.id}/report`];
  for (const who of [teacher, student, other, null]) for (const path of paths)
    assert.equal((await request(path, who)).status, who ? 403 : 401);
  await db.users.updateOne({ _id: new ObjectId(admin) }, { $set: { tokenVersion: 1 } });
  assert.equal((await request('/admin/teachers', admin)).status, 401);
  await db.users.updateOne({ _id: new ObjectId(admin) }, { $set: { tokenVersion: 0, role: 'student' } });
  assert.equal((await request('/admin/teachers', admin)).status, 403);
});

test('teacher pagination has no omissions or duplicates and reports admin-owned classes', async () => {
  const { db, request } = await approvalHarness();
  await request('/classes', admin, { name: 'Admin class' });
  for (let n = 0; n < 55; n++) await db.users.insertOne({ _id: new ObjectId((1000 + n).toString(16).padStart(24, '0')), role: 'teacher', username: `Teacher ${n}` });
  const all = [];
  let after = null, pages = 0;
  do {
    const page = await request(`/admin/teachers${after ? `?after=${after}` : ''}`, admin);
    assert.equal(page.status, 200);
    all.push(...page.body.teachers);
    after = page.body.nextCursor;
    assert.ok(++pages < 5);
  } while (after);
  assert.ok(pages > 1);
  assert.equal(all.length, 58);
  assert.equal(new Set(all.map(row => row.id)).size, 58);
  assert.equal(all.find(row => row.id === admin).classCount, 1);
  assert.equal((await request('/admin/teachers?after=bad-cursor', admin)).status, 400);
  assert.equal((await request('/admin/teachers/not-a-user/classes', admin)).status, 404);
});
