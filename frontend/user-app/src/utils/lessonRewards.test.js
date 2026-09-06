import { applyLessonRewardSnapshot } from './lessonRewards';

test('server reward snapshots add only new stars and preserve local progress and purchases', () => {
  const before = { stars: 17, trophies: 23, inventory: ['hat'], completedReading: ['one'] };
  const rewarded = applyLessonRewardSnapshot(before, 3);
  expect(rewarded).toEqual({ ...before, stars: 20, trophies: 26, lessonRewardStars: 3 });
  const spent = { ...rewarded, stars: 10 };
  expect(applyLessonRewardSnapshot(spent, 3)).toEqual(spent);
  expect(applyLessonRewardSnapshot(spent, 0)).toEqual(spent);
  expect(applyLessonRewardSnapshot(spent, 6)).toEqual({ ...spent, stars: 13, trophies: 29, lessonRewardStars: 6 });
  expect(applyLessonRewardSnapshot(before, undefined)).toEqual(before);
});
