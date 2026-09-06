# Using class lessons

## Try the supplied example

1. Sign in as an administrator or verified teacher and open **Classes**.
2. Create a class and select **2026 Summer · Level 2 (Grades 3–4)**, or open an existing class and choose **Class settings**.
3. Open **Invite students** to copy the class invitation code. Enrolled students see **Lesson 1 — Our classroom** immediately.
4. Students review eight slides, answer four vocabulary questions, record one short sentence, write several sentences, and answer three concrete comprehension questions.
5. Teachers open **Students → View profile → Lesson work**, then select a lesson to view saved attempts, writing, speech feedback and recordings. **Back to student profile** returns to that student's work list.

## Teacher class layout

- **Lessons** holds course materials and previews. **Class settings** opens the course selector; **Invite students** reveals the invitation controls only when needed.
- **Students** lists each enrolled student once, with completed lessons and their latest saved submission date. Opening a profile shows lesson completion and study days separately from assigned-practice completion and scores.
- Within a student profile, **Lesson work** includes current and earlier-course work. **Extra practice** contains assigned exercises, scores, and answers. Detailed work loads only when that section or lesson is opened; answer details remain behind **Load answers**.
- The class-level **Extra practice** tab contains existing assignments and **Assign extra practice**. Teachers can choose website content, not create custom questions. Student class pages remain unchanged.
- Empty progress shows no submissions rather than suggesting a recent login was study activity. Failed report requests show an error and retry, not invented zero scores. Profile and report access still requires the owning teacher.

Summer 2026 is a sample course label, not a date asserted by the PPT. The original 27-slide, 17,981,127-byte PowerPoint is unchanged. The eight student preview images total 444,438 bytes (about 0.44 MB); base64 storage adds overhead. Teacher-only instructions and repeated reward screens were omitted, while the original artwork and attribution remain. See `scripts/prepare-sample-lesson.md` for reproducible conversion details.

## Upload future lessons — administrator only

1. In PowerPoint, remove teacher-only notes from the visible slides and **export to PDF**, or export slide images. The website currently accepts PDF/JPEG/PNG/WebP, not native PPTX. No paid PowerPoint conversion service has been added.
2. Open **Classes → Manage lesson library**. Create or select the season, year and learning level.
3. Add the lesson number, English/Chinese title, vocabulary review, speaking sentence, scaffolded writing prompt, and simple comprehension questions. For vocabulary, enter each English word and short Chinese answer choices, then select its correct meaning with the radio circle. That meaning is also used on its learning flashcard; the word-meaning quiz prompt is generated automatically. Check that every question has exactly one valid answer, with no synonymous distractors. Duplicate choices (including punctuation/spacing variants) are rejected.
4. Select the PDF or slide images. The browser converts pages to smaller WebP/JPEG previews before uploading. The source PDF/PPT is not uploaded.
5. **Save draft and upload previews**. Check every image, translation, question and answer. Drafts can be reopened and edited after an interrupted upload.
6. Choose **Publish — available immediately**. Every class assigned to this course can use the new lesson straight away; students can refresh their class to see it.

Limits: one source file up to 60 MB; at most 40 slides per lesson; each compressed image at most 600 KB. Use one PDF for reliable page order, or select images in their intended order. Slide previews are static: PowerPoint animations, audio and video are not retained. Students can zoom and scroll the preview without widening the page.

Published questions are fixed to protect existing scores. Revised content should use a new lesson. Teachers cannot edit or upload the shared course content.

## Correct a class course

Open the class → **Class settings** → choose the correct term/level → confirm. Current lessons update automatically. Earlier submitted work stays in **Earlier course work**; teachers can also inspect it from the student's **Lesson work** tab. Returning to the same course restores that lesson's saved progress. Scores are never transferred to a different lesson.

The saved answer and class-revision check use one MongoDB transaction, so a concurrent course correction cannot silently accept a new answer for the wrong course. An already-saved request remains safely replayable after the course changes.

## What progress means

- Slide review is an acknowledgment after viewing the pages, not a quiz score.
- Vocabulary and comprehension are scored on the server with shuffled choices.
- Vocabulary opens with learn-first flip cards showing an English word and its Chinese meaning, with pronunciation through the existing audio service. Card review never uses an attempt or earns stars. Students can revisit the cards before submitting or review them alongside their saved result afterwards.
- Vocabulary and Quick check show one numbered question at a time with lettered choices. Previous/Next preserve editable selections; only **Submit this activity** saves all answers. Selection colors do not depend on hovering, so they work on touchscreens.
- Existing explicit word-meaning questions (including the sample classroom lesson) supply flashcards without rewriting saved questions or results. Older free-form vocabulary questions that do not identify an English word retain their quiz; no word or translation is guessed. New uploads use the explicit word field.
- Speaking has a large sentence card with the stored Chinese help text, a speaker button, and a round microphone. “Speak now” appears after the recorder starts, not just after microphone permission. Students can replay their own recording before submitting. Playback failures/timeouts release the controls and offer retry; leaving the activity stops media and releases resources.
- Speaking uses the existing Deepgram-first audio service and its current fallback. The stored lesson supplies the sentence; the browser cannot supply a grade. Missing fallback transcripts are labeled unavailable, not interpreted as silence. Automated speech feedback is not a teacher assessment.
- New writing submissions receive an AI score out of 5 with short feedback, corrections, and one improvement suggestion in English/Simplified Chinese. The server uses the stored prompt and lesson level (1: grades 1–2, 2: grades 3–4, 3: grades 5–6). Students see the selected interface language. AI feedback is guidance; the teacher can still review the work. Older teacher-review-only writing remains unchanged.
- Lesson writing uses the existing `GEMINI_API_KEY` with a 20-second request deadline. Speaking playback uses the existing `TEXT_TO_SPEECH` key; transcription uses `DEEPGRAM_API_KEY` and the existing Gemini fallback. Keys remain server-only. Missing/failed/malformed writing grading returns an explicit error, without saving an attempt or awarding stars. No heuristic or invented grade is substituted. Writing and speaking each allow at most 6 evaluation requests per student per 15-minute window, in addition to the per-task attempt cap.
- Vocabulary and Quick check allow one submitted attempt; speaking and writing allow three. Choices and text are editable before submission; failed network saves retry the same request without consuming another attempt.
- Each newly completed task (slides, vocabulary, speaking, writing, Quick check) earns **3 stars**, regardless of its score: up to **15 stars per class lesson**. Students see **Completed · +3 stars** on the saved result. Retries, refreshes, and reopening a course do not earn duplicate rewards.
- Stars and the first task submission are committed together. Previously completed tasks remain unchanged and receive no retroactive rewards, including on a writing/speaking retry. Failed submissions and teacher previews earn no stars.
- A complete lesson means all five activities were submitted, not necessarily answered correctly.
- Study days count days with submitted vocabulary/speaking/writing/comprehension work during the most recent 28 calendar days in China time. Logins and opening slides do not count.

## Storage and deployment

New MongoDB collections: `lesson_collections`, `course_lessons`, `lesson_slide_assets`, and `lesson_activity_submissions`. Only the current class owner and enrolled student can access the student's work/recordings; administrators alone manage the shared library. Role checks use the current database account, not a claimed browser role.

The sample is seeded idempotently on the first authenticated lesson request after the backend deployment. Production requires the existing MongoDB connection and a replica-set/Atlas deployment supporting transactions. There are no new API keys or conversion-service subscriptions. Compressed slides and saved recordings still consume your existing database storage; monitor usage as the library grows. Large future libraries can move media to object storage without changing lesson IDs or progress.

The PDF implementation follows the [PDF.js browser examples](https://mozilla.github.io/pdf.js/examples/) and runs a self-hosted worker; the transaction boundary follows the [MongoDB Node driver documentation](https://www.mongodb.com/docs/drivers/node/v6.7/crud/transactions/).

## Verification notes

Class and lesson reads reuse a small, account-session-specific memory cache for up to 30 seconds. Nothing is written to browser storage. Submissions and other changes invalidate both caches; explicit refresh fetches current data. Returning from an activity shows the existing class page immediately while refreshing progress. Teacher reports load independently, so they do not block lesson navigation. Switching accounts clears the reusable data and class screen state; server permission and submission checks are unchanged.

Use `node --test tests/classrooms.test.js tests/lessons.test.js` for the server contract checks. Frontend tests run through the existing React test command. `tests/classrooms.browser.mjs` exercises the built website with synthetic accounts/database data and a fake microphone, including browser-side PDF conversion and the site's content-security policy. It must never be pointed at production accounts. Live Mongo persistence, live speech-provider scoring, and physical iPad/WeChat behavior need a deployment smoke test; local simulation is not a claim that those services/devices were exercised.
