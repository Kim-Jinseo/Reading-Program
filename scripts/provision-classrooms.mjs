import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { provisionClassrooms } from '../server/provisionClassrooms.js';

if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI for the intended database before provisioning.');
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const database = client.db('stepping_stones_v2');
  const names = { classes: 'classes', assignments: 'class_assignments', submissions: 'assignment_submissions',
    teacherInvites: 'teacher_invitations', classroomLimits: 'classroom_rate_limits', lessonCollections: 'lesson_collections',
    lessons: 'course_lessons', lessonParts: 'lesson_activity_submissions', lessonAssets: 'lesson_slide_assets' };
  await provisionClassrooms(Object.fromEntries(Object.entries(names).map(([key, name]) => [key, database.collection(name)])));
  console.log('Classroom indexes and sample lesson are ready. Existing content and results were preserved.');
} finally {
  await client.close();
}
