import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { ClassroomError } from './classroomDomain.js';

const missing = () => { throw new ClassroomError('This class is not available to your account.', 404, 'not_found'); };
const conflict = message => { throw new ClassroomError(message, 409, 'request_changed'); };
const teacherRole = role => ['teacher', 'admin'].includes(role);
const tokenFilter = account => account.tokenVersion === undefined ? { $exists: false } : account.tokenVersion;

async function currentAccount(db, user, options, role) {
  const account = await db.users.findOne({ _id: new ObjectId(user.userId) }, options);
  if (!account || (account.tokenVersion || 0) !== (user.tokenVersion || 0))
    throw new ClassroomError('Please sign in again.', 401, 'session_expired');
  if (role === 'student' ? account.role !== 'student' : !teacherRole(account.role))
    throw new ClassroomError(role === 'student' ? 'Use a student account to join a class.' : 'Teacher access is required.', 403, `${role}_required`);
  const locked = await db.users.updateOne({ _id: account._id, role: account.role, tokenVersion: tokenFilter(account) }, { $inc: { enrollmentWriteVersion: 1 } }, options);
  if (!locked.modifiedCount) throw new ClassroomError('Please sign in again.', 401, 'session_expired');
  return account;
}

export const briefJoinRequest = row => ({ id: row.requestId, status: row.status, requestedAt: row.requestedAt });

export async function requestClassJoin(db, user, code, name) {
  return db.withLessonTransaction(async session => {
    const options = { session };
    await currentAccount(db, user, options, 'student');
    const row = await db.classes.findOne({ invitationCode: code }, options);
    if (!row) return missing();
    const classroom = { id: row._id, name: row.name };
    if (row.memberIds.includes(user.userId)) return { status: 'approved', class: classroom };
    const _id = `${row._id}:${user.userId}`;
    const existing = await db.classJoinRequests.findOne({ _id }, options);
    if (existing?.status === 'pending') return { status: 'pending', class: classroom, request: briefJoinRequest(existing) };
    if (row.memberIds.length >= 200) conflict('This class is full.');
    if (await db.classes.countDocuments({ memberIds: user.userId }, options) >= 20) conflict('You have reached the class limit.');
    if (await db.classJoinRequests.countDocuments({ studentId: user.userId, status: 'pending' }, options) >= 20 ||
      await db.classJoinRequests.countDocuments({ classId: row._id, status: 'pending' }, options) >= 200)
      conflict('There are too many pending requests. Please wait for a teacher to review them.');
    // A class write serializes requests, code rotation and owner changes. The
    // account write above serializes the student's pending/enrollment limits.
    const locked = await db.classes.updateOne({ _id: row._id, invitationCode: code }, { $inc: { enrollmentWriteVersion: 1 } }, options);
    if (!locked.modifiedCount) conflict('The class invitation changed. Please try again.');
    const request = { classId: row._id, className: row.name, studentId: user.userId, name, requestId: randomUUID(), status: 'pending', requestedAt: new Date() };
    await db.classJoinRequests.updateOne({ _id }, { $set: request, $unset: { decidedAt: '', decidedBy: '' } }, { ...options, upsert: true });
    return { status: 'pending', class: classroom, request: briefJoinRequest(request) };
  });
}

export async function decideClassJoin(db, user, classId, requestId, decision) {
  return db.withLessonTransaction(async session => {
    const options = { session };
    await currentAccount(db, user, options, 'teacher');
    const row = await db.classes.findOne({ _id: classId }, options);
    if (!row || row.ownerId !== user.userId) return missing();
    const request = await db.classJoinRequests.findOne({ classId, requestId }, options);
    if (!request) conflict('This request changed. Refresh the class before deciding.');
    const status = decision === 'approve' ? 'approved' : 'declined';
    if (request.status !== 'pending') {
      if (request.status === status) return { status };
      conflict('This request has already been decided. Refresh the class.');
    }
    if (decision === 'approve' && !row.memberIds.includes(request.studentId)) {
      const student = await db.users.findOne({ _id: new ObjectId(request.studentId) }, options);
      if (student?.role !== 'student') conflict('This applicant no longer has a student account.');
      if (row.memberIds.length >= 200) conflict('This class is full.');
      if (await db.classes.countDocuments({ memberIds: request.studentId }, options) >= 20) conflict('This student has reached the class limit.');
      // Competing approvals in different classes must conflict on the same
      // student row, so a transaction retry rechecks the 20-class limit.
      const locked = await db.users.updateOne({ _id: student._id, role: 'student', tokenVersion: tokenFilter(student) }, { $inc: { enrollmentWriteVersion: 1 } }, options);
      if (!locked.modifiedCount) conflict('The student account changed. Please try again.');
      const enrolled = await db.classes.updateOne({ _id: classId, ownerId: user.userId, memberIds: { $ne: request.studentId }, 'memberIds.199': { $exists: false } }, {
        $addToSet: { memberIds: request.studentId },
        $push: { members: { id: request.studentId, name: request.name, joinedAt: new Date() } },
        $inc: { enrollmentWriteVersion: 1 },
      }, options);
      if (!enrolled.modifiedCount) conflict('The class changed. Please try again.');
    } else {
      const locked = await db.classes.updateOne({ _id: classId, ownerId: user.userId }, { $inc: { enrollmentWriteVersion: 1 } }, options);
      if (!locked.modifiedCount) return missing();
    }
    await db.classJoinRequests.updateOne({ _id: request._id, requestId, status: 'pending' }, { $set: { status, decidedAt: new Date(), decidedBy: user.userId } }, options);
    return { status };
  });
}
