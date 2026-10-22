import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { approvalHarness, teacher, student, other, admin } from './helpers/approvalHarness.js';

test('a join request stays outside membership and cannot cross classroom or lesson access boundaries', async () => {
  const { db, request, lessonRequest, classroom, join } = await approvalHarness();
  const first = await join();
  assert.equal(first.status, 200);
  assert.equal(first.body.status, 'pending');
  const replay = await join(student, 'Do not replace pending name');
  assert.equal(replay.body.request.id, first.body.request.id);
  assert.deepEqual((await db.classes.findOne({ _id: classroom.id })).memberIds, []);
  const ownList = (await request('/classes', student)).body;
  assert.deepEqual(ownList.classes, []);
  assert.deepEqual(ownList.joinRequests, [{ id: first.body.request.id, classId: classroom.id, className: 'Class A', status: 'pending', requestedAt: first.body.request.requestedAt }]);
  const owner = (await request(`/classes/${classroom.id}`)).body;
  assert.equal(owner.joinRequests[0].name, '小明');
  assert.equal(owner.joinRequests[0].username, 'student-account');
  assert.equal(owner.students.length, 0);
  await db.assignments.insertOne({ _id: 'assignment', classId: classroom.id, questions: [] });
  await db.lessons.insertOne({ _id: 'lesson', collectionId: 'course', published: true, slides: [{ id: 'slide' }] });
  for (const path of [`/classes/${classroom.id}`, '/assignments/assignment', '/assignments/assignment/audio/recording'])
    assert.equal((await request(path, student)).status, 404);
  assert.equal((await request('/assignments/assignment/submit', student, {})).status, 404);
  for (const path of [`/classes/${classroom.id}`, `/classes/${classroom.id}/lessons/lesson`, `/classes/${classroom.id}/lessons/lesson/slides/slide`, `/classes/${classroom.id}/lessons/lesson/audio/recording`])
    assert.equal((await lessonRequest(path, student)).status, 404);
  assert.equal((await lessonRequest(`/classes/${classroom.id}/lessons/lesson/parts/slides`, student, {})).status, 404);
});

test('only the owning teacher can approve and approval retries enroll exactly once', async () => {
  const { db, request, classroom, join, decide } = await approvalHarness();
  const pending = (await join()).body.request;
  assert.ok(pending?.id);
  for (const who of [student, other, admin]) assert.ok([403, 404].includes((await decide(pending.id, 'approve', who)).status));
  const results = await Promise.all([decide(pending.id), decide(pending.id)]);
  assert.deepEqual(results.map(r => r.body.status), ['approved', 'approved']);
  const row = await db.classes.findOne({ _id: classroom.id });
  assert.deepEqual(row.memberIds, [student]);
  assert.equal(row.members.length, 1);
  assert.equal((await decide(pending.id, 'decline')).status, 409);
  assert.equal((await request(`/classes/${classroom.id}`, student)).status, 200);
  assert.deepEqual((await request('/classes', student)).body.joinRequests, []);
  assert.equal((await join()).body.status, 'approved');
});

test('declines preserve denial, reapplication replaces request identity, and stale decisions cannot enroll', async () => {
  const { request, classroom, join, decide } = await approvalHarness();
  const pending = (await join()).body.request;
  assert.ok(pending?.id);
  assert.equal((await decide(pending.id, 'decline')).body.status, 'declined');
  assert.equal((await decide(pending.id, 'decline')).body.status, 'declined');
  assert.equal((await request(`/classes/${classroom.id}`, student)).status, 404);
  assert.equal((await request('/classes', student)).body.joinRequests[0].status, 'declined');
  const again = (await join()).body.request;
  assert.notEqual(again.id, pending.id);
  assert.equal((await decide(pending.id)).status, 409);
  assert.equal((await decide(again.id)).body.status, 'approved');
});

test('existing enrollment stays enrolled without creating a join request', async () => {
  const { db, request, classroom, join } = await approvalHarness();
  await db.classes.updateOne({ _id: classroom.id }, { $set: { memberIds: [student], members: [{ id: student, name: 'Legacy name' }] } });
  assert.equal((await join()).body.status, 'approved');
  assert.equal((await request(`/classes/${classroom.id}`, student)).status, 200);
  assert.equal((await request(`/classes/${classroom.id}`)).body.students[0].name, 'Legacy name');
  assert.equal(db.classJoinRequests.docs.length, 0);
});

test('decisions recheck roles and token versions and administrators may approve only their own class', async () => {
  for (const change of ['owner-role', 'owner-token', 'student-role']) {
    const { db, join, decide, classroom } = await approvalHarness();
    const pending = (await join()).body.request;
    assert.ok(pending?.id);
    const id = change === 'student-role' ? student : teacher;
    await db.users.updateOne({ _id: new ObjectId(id) }, { $set: change === 'owner-token' ? { tokenVersion: 1 } : { role: change === 'student-role' ? 'teacher' : 'student' } });
    assert.ok([401, 403, 409].includes((await decide(pending.id)).status));
    assert.deepEqual((await db.classes.findOne({ _id: classroom.id })).memberIds, []);
  }
  const env = await approvalHarness();
  await env.db.classes.updateOne({ _id: env.classroom.id }, { $set: { ownerId: admin } });
  const pending = (await env.join()).body.request;
  assert.equal((await env.decide(pending.id, 'approve', admin)).body.status, 'approved');
});

test('approval refuses full classes and simultaneous approvals cannot exceed the student class quota', async () => {
  const full = await approvalHarness();
  const pending = (await full.join()).body.request;
  assert.ok(pending?.id);
  await full.db.classes.updateOne({ _id: full.classroom.id }, { $set: { memberIds: Array.from({ length: 200 }, (_, n) => `member-${n}`) } });
  assert.equal((await full.decide(pending.id)).status, 409);
  assert.equal((await full.request('/classes', student)).body.joinRequests[0].status, 'pending');
  const env = await approvalHarness();
  for (let n = 0; n < 19; n++) await env.db.classes.insertOne({ _id: `old-${n}`, ownerId: other, memberIds: [student], members: [] });
  const first = (await env.join()).body.request;
  const secondClass = (await env.request('/classes', other, { name: 'Class B' })).body.class;
  const second = (await env.request('/classes/join', student, { code: secondClass.invitationCode, displayName: '小明' })).body.request;
  const results = await Promise.all([env.decide(first.id), env.request(`/classes/${secondClass.id}/join-requests/${second.id}/decision`, other, { decision: 'approve' })]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal(await env.db.classes.countDocuments({ memberIds: student }), 20);
});
