import { ObjectId } from 'mongodb';
import { ClassroomError, latestSubmission } from './classroomDomain.js';
import { lessonSummary, studyDays28 } from './lessonDomain.js';

const missing = () => { throw new ClassroomError('This teacher or class is not available.', 404, 'not_found'); };
const teacherBrief = row => ({ id: String(row._id), name: row.username || 'Teacher' });
const classProjection = { ownerId: 1, name: 1, memberIds: 1, createdAt: 1, collectionId: 1 };

export async function teacherOverview(db, after) {
  if (after !== undefined && !/^[a-fA-F0-9]{24}$/.test(after)) throw new ClassroomError('Choose a valid teacher page.');
  const page = await db.users.find({ role: { $in: ['teacher', 'admin'] }, ...(after ? { _id: { $gt: new ObjectId(after) } } : {}) }, { projection: { username: 1, role: 1 } }).sort({ _id: 1 }).limit(51).toArray();
  const users = page.slice(0, 50), ids = users.map(user => String(user._id));
  const classes = await db.classes.find({ ownerId: { $in: ids } }, { projection: classProjection }).toArray();
  const pending = await db.classJoinRequests.find({ classId: { $in: classes.map(row => row._id) }, status: 'pending' }, { projection: { classId: 1 } }).toArray();
  return {
    teachers: users.flatMap(user => {
      const own = classes.filter(row => row.ownerId === String(user._id));
      if (user.role === 'admin' && !own.length) return [];
      const ownIds = new Set(own.map(row => row._id));
      return [{ ...teacherBrief(user), classCount: own.length, studentCount: own.reduce((sum, row) => sum + row.memberIds.length, 0), pendingCount: pending.filter(row => ownIds.has(row.classId)).length }];
    }),
    nextCursor: page.length > 50 ? String(users.at(-1)._id) : null,
  };
}

export async function teacherClasses(db, teacherId) {
  if (!ObjectId.isValid(teacherId)) return missing();
  const account = await db.users.findOne({ _id: new ObjectId(teacherId), role: { $in: ['teacher', 'admin'] } }, { projection: { username: 1 } });
  if (!account) return missing();
  const classes = await db.classes.find({ ownerId: teacherId }, { projection: classProjection }).sort({ createdAt: -1 }).toArray();
  const requests = await db.classJoinRequests.find({ classId: { $in: classes.map(row => row._id) }, status: 'pending' }, { projection: { classId: 1 } }).toArray();
  return { teacher: teacherBrief(account), classes: classes.map(row => ({ id: row._id, name: row.name, studentCount: row.memberIds.length, pendingCount: requests.filter(request => request.classId === row._id).length, createdAt: row.createdAt, collectionId: row.collectionId || null })) };
}

export async function administratorClassReport(db, classId) {
  const row = await db.classes.findOne({ _id: classId }, { projection: { ownerId: 1, name: 1, memberIds: 1, members: 1, collectionId: 1 } });
  if (!row) return missing();
  const [teacher, lessons, parts] = await Promise.all([
    db.users.findOne({ _id: new ObjectId(row.ownerId) }, { projection: { username: 1 } }),
    db.lessons.find({ collectionId: row.collectionId || '', published: true }, { projection: { _id: 1 } }).limit(100).toArray(),
    db.lessonParts.find({ classId }, { projection: { studentId: 1, lessonId: 1, part: 1, 'attempts.score': 1, 'attempts.total': 1, 'attempts.submittedAt': 1 } }).toArray(),
  ]);
  return { class: { id: row._id, name: row.name }, teacher: teacher ? teacherBrief(teacher) : { id: row.ownerId, name: 'Teacher' }, students: row.members.filter(member => row.memberIds.includes(member.id)).map(member => {
    const own = parts.filter(part => part.studentId === member.id);
    return { id: member.id, name: member.name, assigned: lessons.length,
      completed: lessons.filter(lesson => lessonSummary(own.filter(part => part.lessonId === lesson._id)).completed).length,
      studyDays28: studyDays28(own), lastSubmittedAt: latestSubmission(own), activitiesSubmitted: own.filter(part => part.part !== 'slides' && part.attempts.length).length };
  }) };
}
