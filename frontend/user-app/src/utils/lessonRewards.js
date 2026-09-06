// Apply only newly observed server rewards, not an absolute balance that
// could erase a purchase or practice progress made while saving.
export const applyLessonRewardSnapshot = (user, total) => {
  if (!user || user.isGuest || !Number.isSafeInteger(total) || total <= (user.lessonRewardStars || 0)) return user;
  const added = total - (user.lessonRewardStars || 0);
  return { ...user, stars: (user.stars || 0) + added,
    trophies: (user.trophies ?? user.stars ?? 0) + added, lessonRewardStars: total };
};
