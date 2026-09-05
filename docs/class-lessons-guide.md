# Using class lessons

## Try the supplied example

1. Sign in as an administrator or verified teacher and open **Classes**.
2. Create a class and select **2026 Summer · Level 2 (Grades 3–4)**, or open an existing class and choose **Change course**.
3. Share the class invitation code. Enrolled students see **Lesson 1 — Our classroom** immediately.
4. Students review eight slides, answer four vocabulary questions, record one short sentence, write several sentences, and answer three concrete comprehension questions.
5. Teachers open **Lesson progress and consistency**, select a student, then a lesson to view saved attempts, writing, speech feedback and recordings.

Summer 2026 is a sample course label, not a date asserted by the PPT. The original 27-slide, 17,981,127-byte PowerPoint is unchanged. The eight student preview images total 444,438 bytes (about 0.44 MB); base64 storage adds overhead. Teacher-only instructions and repeated reward screens were omitted, while the original artwork and attribution remain. See `scripts/prepare-sample-lesson.md` for reproducible conversion details.

## Upload future lessons — administrator only

1. In PowerPoint, remove teacher-only notes from the visible slides and **export to PDF**, or export slide images. The website currently accepts PDF/JPEG/PNG/WebP, not native PPTX. No paid PowerPoint conversion service has been added.
2. Open **Classes → Manage lesson library**. Create or select the season, year and learning level.
3. Add the lesson number, English/Chinese title, vocabulary review, speaking sentence, scaffolded writing prompt, and simple comprehension questions. Use short familiar words and exactly one correct answer per question. Choose the correct answer using the radio circle.
4. Select the PDF or slide images. The browser converts pages to smaller WebP/JPEG previews before uploading. The source PDF/PPT is not uploaded.
5. **Save draft and upload previews**. Check every image, translation, question and answer. Drafts can be reopened and edited after an interrupted upload.
6. Choose **Publish — available immediately**. Every class assigned to this course can use the new lesson straight away; students can refresh their class to see it.

Limits: one source file up to 60 MB; at most 40 slides per lesson; each compressed image at most 600 KB. Use one PDF for reliable page order, or select images in their intended order. Slide previews are static: PowerPoint animations, audio and video are not retained. Students can zoom and scroll the preview without widening the page.

Published questions are fixed to protect existing scores. Revised content should use a new lesson. Teachers cannot edit or upload the shared course content.

## Correct a class course

Open the class → **Change course** → choose the correct term/level → confirm. Current lessons update automatically. Earlier submitted work stays in **Earlier course work**; teachers can also inspect it from the student's lesson report. Returning to the same course restores that lesson's saved progress. Scores are never transferred to a different lesson.

The saved answer and class-revision check use one MongoDB transaction, so a concurrent course correction cannot silently accept a new answer for the wrong course. An already-saved request remains safely replayable after the course changes.

## What progress means

- Slide review is an acknowledgment after viewing the pages, not a quiz score.
- Vocabulary and comprehension are scored on the server with shuffled choices.
- Speaking uses the existing Deepgram-first audio service and its current fallback. Students see microphone readiness and may listen before submitting. The stored lesson supplies the sentence; the browser cannot supply a grade. Automated speech feedback is not a teacher assessment.
- Writing is saved for the teacher to read. It is not given a fabricated automatic score.
- Each scored/written activity allows three saved attempts. Choices and text are editable before submission; failed network saves retry the same request without consuming another attempt.
- A complete lesson means all five activities were submitted, not necessarily answered correctly.
- Study days count days with submitted vocabulary/speaking/writing/comprehension work during the most recent 28 calendar days in China time. Logins and opening slides do not count.

## Storage and deployment

New MongoDB collections: `lesson_collections`, `course_lessons`, `lesson_slide_assets`, and `lesson_activity_submissions`. Only the current class owner and enrolled student can access the student's work/recordings; administrators alone manage the shared library. Role checks use the current database account, not a claimed browser role.

The sample is seeded idempotently on the first authenticated lesson request after the backend deployment. Production requires the existing MongoDB connection and a replica-set/Atlas deployment supporting transactions. There are no new API keys or conversion-service subscriptions. Compressed slides and saved recordings still consume your existing database storage; monitor usage as the library grows. Large future libraries can move media to object storage without changing lesson IDs or progress.

The PDF implementation follows the [PDF.js browser examples](https://mozilla.github.io/pdf.js/examples/) and runs a self-hosted worker; the transaction boundary follows the [MongoDB Node driver documentation](https://www.mongodb.com/docs/drivers/node/v6.7/crud/transactions/).

## Verification notes

Use `node --test tests/classrooms.test.js tests/lessons.test.js` for the server contract checks. Frontend tests run through the existing React test command. `tests/classrooms.browser.mjs` exercises the built website with synthetic accounts/database data and a fake microphone, including browser-side PDF conversion and the site's content-security policy. It must never be pointed at production accounts. Live Mongo persistence, live speech-provider scoring, and physical iPad/WeChat behavior need a deployment smoke test; local simulation is not a claim that those services/devices were exercised.
