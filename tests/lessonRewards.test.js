import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryDb } from './helpers/memoryDb.js';
import { saveProgressWithLessonRewards } from '../server/lessonRewards.js';

test('an older progress sync preserves lesson stars earned since its snapshot', async () => {
  const { users } = memoryDb();
  await users.insertOne({ _id: 'student', stars: 20, trophies: 26, lessonRewardStars: 3 });
  await saveProgressWithLessonRewards(users, 'student', { stars: 18, trophies: 24 }, 0);
  assert.deepEqual(await users.findOne({ _id: 'student' }), { _id: 'student', stars: 21, trophies: 27, lessonRewardStars: 3 });
  // Current snapshots already include the reward. A shop purchase can spend it.
  await saveProgressWithLessonRewards(users, 'student', { stars: 16 }, 3);
  assert.equal((await users.findOne({ _id: 'student' })).stars, 16);
  await assert.rejects(saveProgressWithLessonRewards(users, 'student', { stars: 0 }, 999));
  assert.equal((await users.findOne({ _id: 'student' })).stars, 16);
});

test('a lesson reward racing a progress sync is included without overwriting it', async () => {
  const { users } = memoryDb();
  await users.insertOne({ _id: 'student', stars: 17, trophies: 23 });
  const update = users.updateOne.bind(users);
  let first = true;
  users.updateOne = async (...args) => {
    if (first) { first = false; await update({ _id: 'student' }, { $inc: { stars: 3, trophies: 3, lessonRewardStars: 3 } }); }
    return update(...args);
  };
  await saveProgressWithLessonRewards(users, 'student', { stars: 18, trophies: 24 }, 0);
  assert.deepEqual(await users.findOne({ _id: 'student' }), { _id: 'student', stars: 21, trophies: 27, lessonRewardStars: 3 });
});
