import { ClassroomError } from './classroomDomain.js';

export async function saveProgressWithLessonRewards(users, id, updates, baseline = 0) {
  if (!Number.isSafeInteger(baseline) || baseline < 0)
    throw new ClassroomError('Invalid reward snapshot.');
  // Existing practice/shop saves send absolute balances. Preserve lesson
  // rewards committed since that browser snapshot without changing spending.
  for (let attempt = 0; attempt < 5; attempt++) {
    const account = await users.findOne({ _id: id });
    if (!account) throw new ClassroomError('Please sign in again.', 401, 'session_expired');
    const total = account.lessonRewardStars || 0;
    if (baseline > total) throw new ClassroomError('Invalid reward snapshot.');
    const merged = { ...updates };
    for (const field of ['stars', 'trophies']) {
      if (merged[field] !== undefined) merged[field] += total - baseline;
    }
    const saved = await users.updateOne({ _id: id,
      lessonRewardStars: account.lessonRewardStars === undefined ? { $exists: false } : total,
    }, { $set: merged });
    if (saved.matchedCount) return;
  }
  throw new ClassroomError('Please retry saving your progress.', 503, 'unavailable');
}
