# Learning-first assigned extra practice and calmer lesson results

## Approved product direction

Teachers select existing website content for reading, vocabulary, grammar,
writing, and speaking. They cannot author or replace questions, prompts,
answer keys, or grading criteria. Students learn before answering vocabulary
and grammar activities. Writing and speaking use the existing lesson feedback
services and allow three submitted attempts. Existing work remains intact.

This is an extension of class-assigned Extra practice, not a change to the
standalone practice modules, placement test, Home panel, or sidebar.

## Student experience

- Reading: display the stored passage and its own tailored questions.
- Vocabulary: show the selected word's flashcard, pronunciation button, and
  Chinese meaning before a clearly labeled Start quiz action. Preserve the
  existing single-word catalog granularity; do not invent vocabulary bundles.
  Students can return to learning before submitting.
- Grammar: display one concept's existing explanation, rule, and examples,
  then exactly three related multiple-choice questions. Prefer the existing
  three-question Learn check. For older concepts with longer question sets,
  use three distinct valid questions from that same concept, never questions
  from another concept or the combined practice bank. Sources missing usable
  learning material or three valid questions are not assignable and are
  reported by catalog validation rather than given fabricated content.
- Writing: show the existing prompt and available Chinese guidance, an
  editable writing area, and an explicit Submit action. Use the lesson limit
  of 2,000 characters and AI feedback against the stored prompt and level.
  Results include a score out of 5, feedback, corrections, and one improvement.
- Speaking: show the existing sentence and available Chinese translation,
  pronunciation audio, microphone preparation/recording states, and playback
  before Submit. Reuse the lesson recorder's 30-second limit and existing
  Deepgram-first evaluation. Results show a score out of 3 and feedback;
  unavailable transcription is not described as silence.
- Selection, flashcard use, typing, or recording alone never submits an
  attempt. Warn before discarding unsent work. Preserve the current payload
  while retrying an uncertain save, so retries cannot create duplicate work.
- After successful submission, show a completed result rather than an empty
  form. Writing/speaking offer Try again with remaining attempts. Older
  attempts stay available in a collapsed history.

## Attempts, scoring, and rewards

New writing and speaking assignments always allow three submissions, enforced
on the server. Reading/vocabulary/grammar retain the existing teacher-selected
1–3 attempt setting; this change does not silently import the separate
class-lesson one-attempt rule. Existing assignments retain their stored limit.

An unavailable, timed-out, or invalid evaluator response produces a clear
retry message, no invented score, and no consumed attempt. Idempotent replays
return the already saved result. Concurrent submissions cannot exceed limits.
Use the existing rate limits and an additional bounded AI-request budget.

Scores are labeled by subject and denominator. Assignment results remain
separate from class-lesson results and self-study progress. Existing class-
lesson +3 completion stars remain unchanged; no new assignment reward policy
is introduced in this change.

## Teacher creation and review

The assignment picker offers all five subjects and levels 1–3, previewing the
actual learning content, prompt, questions, and attempt policy before publish.
Publishing still sends only a catalog source ID, version, request ID, and
permitted attempt setting. The server builds the immutable assignment snapshot.

Teacher student profiles show writing text and feedback, speaking feedback and
on-demand saved recording playback, or quiz responses as appropriate. Teacher
review remains read-only, with a clear student name/context banner and no
student recording, retry, or submit controls.

## Data and backend boundaries

- Extend the canonical catalog with versioned activity formats and subject-
  specific learning data. Hash the full normalized definition, including
  learning content and prompt, to detect stale previews.
- Keep missing-format assignments on the existing legacy quiz path. Never
  rebuild saved assignments from the current catalog or rewrite old attempts.
- Extend validation and public serializers explicitly for quiz, writing, and
  speaking formats. Student quiz payloads omit answer IDs and grading keys;
  vocabulary learning meanings are intentionally visible.
- Wire shared writing/speech evaluator adapters into the classroom router,
  reusing the existing lesson services and server-owned target content.
  Student-supplied prompts, targets, scores, and feedback are not trusted.
- Validate text and recorded audio before calling evaluators. Reuse lesson
  audio MIME/base64/size validation. Increase request size only where recorded
  submissions require it, not for every classroom request.
- Recordings are retrieved through an authenticated assignment-audio route,
  only by the submitting student or the owning teacher of their class. Send
  private/no-store cache headers. Do not return base64 audio in class lists,
  progress summaries, assignment detail JSON, or submit responses.
- Overview queries use small projections and continue loading one student's
  detailed work on demand. Existing token-scoped cache invalidation remains.
- Saving attempts retains unique request IDs and atomic attempt limits.
  Check authorization again at the save boundary for long-running grading.

## Calmer lesson presentation

Completed lesson tabs have white backgrounds, small checkmarks, and an explicit
Completed label. The selected tab uses muted blue, independent of completion.
Use a muted blue progress bar and neutral text. Replace large green completion
and score panels with white/light-slate cards and restrained borders. Preserve
text feedback for correct/review answers; color is never the only indicator.

Keep the student-review banner distinct from the student's own lesson view,
but use a restrained neutral/blue treatment with the student name and Read-only
label. Keep existing reward amounts, saved results, and completion calculations.
No changes to Home, sidebar colors, standalone practice, or placement testing.

## Implementation boundaries

- Server catalog/domain: `server/practiceCatalog.js`,
  `server/classroomDomain.js`, and a focused assignment-format validation and
  grading module if needed to keep legacy quiz helpers stable.
- Classroom API: `server/classrooms.js`; evaluator wiring in `api/index.js`.
- Teacher creation/review: `AssignmentEditor.jsx`, `ClassReport.jsx` and focused
  subject preview/result components in `components/classes`.
- Student flow: keep legacy `AssignmentPlayer` behavior compatible; route new
  formats to focused learning and productive-answer components. Reuse
  `LessonSpeaking` and existing audio/feedback helpers rather than duplicating
  microphone lifecycle logic.
- Lesson palette: `LessonPlayer.jsx`, `LessonResult.jsx`,
  `StudentReviewBanner.jsx`, and scoped `index.css` rules.

## Verification and release

1. Backend tests cover all five catalog subjects, exact grammar question count,
   vocabulary learning payloads, source tampering/stale previews, legacy
   assignments, text/audio validation, auth boundaries, AI failure, duplicate
   retries, concurrent attempt limits, and audio exclusion from overview JSON.
2. Frontend tests cover learning-before-quiz, editable unsubmitted answers,
   writing/speaking submission and retry, mic readiness/playback, honest AI
   errors, type-specific teacher results, and legacy quiz review.
3. Run existing classroom, lesson, frontend, and curriculum regression suites
   and a production build. Review the diff before release.
4. Browser-check synthetic teacher/student flows at phone, iPad, and desktop
   widths, including keyboard focus and readable completion states.
5. Never submit synthetic work to real student accounts. Distinguish mocked
   evaluator verification from live provider verification in the handoff.

## Design review

The product direction is approved in chat. This written design captures the
cross-cutting compatibility, privacy, and grading details for user review
before the implementation plan and application changes.
