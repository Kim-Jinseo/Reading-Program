# Learning-first Extra Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Assign existing content in all five subjects with learning-first activities and safe AI feedback, and calm the lesson completion palette.

**Architecture:** Immutable server-owned assignment snapshots gain explicit formats while missing formats remain legacy quizzes. Subject-specific validation/grading and reusable UI components keep the existing lesson and assignment workflows compatible.

**Tech Stack:** React, Tailwind, Hono, MongoDB, Node test runner, React Testing Library; reuse existing Deepgram-first speech and Gemini writing integrations without adding dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-learning-first-extra-practice-design.md` (user approved).

## Global Constraints

- Teachers select existing website content for reading, vocabulary, grammar, writing, and speaking.
- New writing and speaking assignments always allow three submissions, enforced on the server.
- Missing-format assignments remain legacy quizzes; never rewrite old questions, limits, or results.
- Grammar has exactly three related questions after its explanation and examples. Vocabulary starts with a pronunciation/Chinese-meaning flashcard.
- Writing: 2,000 characters, score out of 5. Speaking: 30-second recorder, existing validated audio limit, score out of 3.
- AI errors consume no attempts and never invent scores. Replayed requests do not duplicate attempts.
- No audio base64 in overview or detail JSON; authenticated on-demand audio retrieval only.
- No changes to Home, sidebar, standalone practice, placement testing, or reward policy.
- All edits use apply_patch. Preserve unrelated scratch/. No deployment until tests, review, and production build pass.

## Shared API contract

New snapshots and teacher previews carry `format: 'quiz' | 'writing' | 'speaking'`.
Quiz snapshots retain `questions` and optionally `learning`:

```js
learning: { words: [{ word: 'desk', meaningZh: '书桌' }] }
learning: { description: { en: '...', zh: '...' }, rule: { en: '...', zh: '...' } }
writing: { prompt: '...', promptZh: '...' }
speaking: { sentence: '...', hintZh: '...' }
```

Writing/speaking snapshots have `questions: []` and `maxAttempts: 3`.
Teacher catalog lists include `format`, `questionCount` (zero for productive activities).
POST `/assignments/:id/submit` accepts `{requestId, answers}` for quiz,
`{requestId, text}` for writing, `{requestId, audioBase64, audioMime}` for speaking.
Saved productive attempts use the same feedback fields as lessons: writingFeedback,
feedback, transcript, speechDetected, automaticallyAssessed, score, total, hasAudio.
GET `/assignments/:id/audio/:requestId` serves own recording; optional
`?studentId=...` requires class-owner authorization. All audio responses private/no-store.
Teacher detail and student detail return normalized assignment fields without raw audio.

### Task 1: Canonical formats, protected grading, and compatibility

**Files:** server/practiceCatalog.js, server/classroomDomain.js, server/classrooms.js,
api/index.js; create server/assignmentActivities.js for focused subject validation/grading;
tests/assignmentActivities.test.js and tests/classrooms.test.js. Reuse lessonDomain.js
decodeAudio and lessonWriting.js feedback validators; extract shared evaluator adapters
in api/index.js rather than duplicating provider calls.

**Consumes:** Existing reviewed curriculum (`grammar.rule/desc/questions`,
`writing.en/zh`, `speaking.en/zh`, `vocab.word/def`).
**Produces:** Shared API contract above; no frontend changes in this task.

- [ ] Add failing catalog/format tests using real curriculum fixtures, including:
  ```js
  const source = catalog.preview('1:grammar:201');
  assert.equal(source.questions.length, 3);
  assert.ok(source.learning.rule.en);
  assert.equal(catalog.preview('1:speaking:231').format, 'speaking');
  ```
  Test Chinese vocab learning meanings, all five subjects/levels, source tampering,
  stale versions, legacy preservation, and missing grammar learning material.
- [ ] Run `node --test tests/assignmentActivities.test.js` and confirm meaningful RED.
- [ ] Implement canonical source snapshots with format-specific validation. Keep
  validateAssignment usable by legacy lessons; wrap/extend it rather than weakening
  quiz validation. Select first three distinct valid questions of the same concept;
  sources with insufficient valid content are excluded with diagnosable validation.
- [ ] Add failing router tests for AI success/failure, text/audio validation, exact
  three attempts, duplicate requests, concurrent limits, auth recheck after grading,
  audio privacy and projection exclusions. Use injected evaluator doubles only at
  external service boundaries; exercise real router/domain and memoryDb.
- [ ] Implement shared evaluator injection, bounded AI requests, safe serializers,
  route-specific upload bounds, and protected audio retrieval. Validate input before
  evaluator call; check remaining attempts before AI; enforce membership and attempt
  limit again atomically at save. Replays return saved data without reevaluation.
- [ ] Run `node --test tests/*.test.js`; self-review; commit task changes only.
- [ ] Report exact tests/TDD evidence and any API deviations to controller, then
  undergo task review before Task 2.

### Task 2: Learning-first screens, feedback review, and calm colors

**Files:** AssignmentEditor.jsx, AssignmentPlayer.jsx, ClassReport.jsx, shared.js under
frontend/user-app/src/components/classes; add focused AssignmentLearning.jsx,
ProductiveAssignment.jsx and AssignmentFeedback.jsx as needed. Reuse LessonVocabulary
and LessonSpeaking. Palette files: LessonPlayer.jsx, LessonResult.jsx,
StudentReviewBanner.jsx, index.css. Tests alongside corresponding components.

**Consumes:** Task 1 shared API contract.
**Produces:** End-to-end teacher preview/publication and student/reviewer experience.

- [ ] Add failing tests for vocabulary opening on flashcards, grammar explanation
  before exactly three questions, and editable choices before submission. Example:
  ```jsx
  expect(screen.getByText('Learn the words first')).toBeInTheDocument();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /Start.*quiz/i}));
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  ```
- [ ] Run targeted frontend tests with CI=true and `react-scripts/scripts/test.js
  --watchAll=false --watchman=false --runInBand --cacheDirectory=node_modules/.cache/jest`.
- [ ] Extend picker to all five subjects and type-specific previews. Productive
  attempts fixed at three and no misleading zero-question label. Keep legacy picker
  tests and immutable publication behavior. Learning stages return to quiz without
  destroying selected answers; new grammar quiz cannot skip initial learning screen.
- [ ] Add failing writing/speaking tests for submit-on-explicit-action, completed
  result/remaining attempts, network retry payload identity, recoverable AI failure
  keeping text/recording, attempt-limit recovery, and read-only teacher feedback.
- [ ] Implement productive player with LessonSpeaking recorder reuse, writing editor,
  explicit submit, guarded navigation, and shared feedback/result presentation.
  Use error codes to clear pending state on known-unsaved AI/validation failures;
  keep frozen payload and requestId for unknown network outcomes. Student and teacher
  audio download uses authenticated mediaUrl; revoke object URLs on unmount.
- [ ] Extend ClassReport without assuming every attempt has responses. Show submitted
  prompt/sentence, writing, feedback and on-demand recording; never student controls.
  Keep latest/first/best subject score denominators clear and old MCQ review intact.
- [ ] Apply scoped palette change: white completed tabs with small checkmarks and
  Completed text; muted blue selected tabs/progress; neutral score/completion cards.
  Preserve read-only student identity, completion-star rules and all progress logic.
- [ ] Run all frontend tests and production build; self-review; commit task only.

## Final verification

- [ ] Independent task reviews and final integration review; fix important findings.
- [ ] Full backend tests, full frontend tests, production build, git diff --check.
- [ ] Synthetic teacher publication/student learning and submission/review browser
  checks at 390×844, 820×1180, desktop. No real student data mutations.
- [ ] Document mocked versus live AI verification. Preserve current operational
  workflow for final commit/push only after all checks pass.
