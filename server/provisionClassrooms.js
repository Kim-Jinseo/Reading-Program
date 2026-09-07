// Run explicitly during database provisioning, never in student request handlers.
export async function provisionClassrooms(db, { seed = true } = {}) {
  await Promise.all([
    db.classes.createIndex({ invitationCode: 1 }, { unique: true }),
    db.classes.createIndex({ ownerId: 1 }),
    db.classes.createIndex({ memberIds: 1 }),
    db.assignments.createIndex({ classId: 1, createdAt: -1 }),
    db.submissions.createIndex({ classId: 1, studentId: 1 }),
    db.teacherInvites.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.classroomLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.lessonCollections.createIndex({ season: 1, year: 1, level: 1 }, { unique: true }),
    db.lessons.createIndex({ collectionId: 1, number: 1 }, { unique: true }),
    db.lessonParts.createIndex({ classId: 1, studentId: 1, lessonId: 1 }),
    db.lessonAssets.createIndex({ lessonId: 1 }),
  ]);
  if (!seed) return;
  const { sampleCollection, sampleLesson, sampleAssets } = await import('./sampleLesson.js');
  await db.lessonCollections.updateOne({ _id: sampleCollection._id }, { $setOnInsert: sampleCollection }, { upsert: true });
  for (const asset of sampleAssets) {
    await db.lessonAssets.updateOne({ _id: asset._id }, { $setOnInsert: { ...asset, lessonId: sampleLesson._id } }, { upsert: true });
  }
  // Publish only after every asset exists. Existing published content is immutable.
  await db.lessons.updateOne({ _id: sampleLesson._id }, { $setOnInsert: {
    ...sampleLesson, published: true, createdAt: new Date(), publishedAt: new Date(),
  } }, { upsert: true });
}
