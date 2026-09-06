import { ADDITIONAL_READINGS_BY_GRADE } from './additionalReadings.js';
import { applyVeryHardReadingUpdates } from './veryHardReadingUpdates.js';
import { reviewVocabulary } from './reviewedVocabulary.js';

// Shared by the student website and the server-owned extra-practice catalog.
export const buildReviewedCurriculum = curriculum => Object.fromEntries(
  Object.entries(curriculum).map(([gradeKey, gradeData]) => [gradeKey, {
    ...gradeData,
    vocab: reviewVocabulary(gradeKey, gradeData.vocab),
    reading: [
      ...applyVeryHardReadingUpdates(gradeKey, gradeData.reading || []),
      ...(ADDITIONAL_READINGS_BY_GRADE[gradeKey] || []),
    ],
  }]),
);
