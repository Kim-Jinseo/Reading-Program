# Class lessons — approved implementation

The user has approved implementation. Admins alone publish materials; verified teachers select a season, year and learning level when creating or correcting a class. Every published matching lesson is available immediately. Existing class assignments continue to work.

## Contract
- Collections identify season/year/level. Lessons have stable IDs and ordered lesson numbers. Published content is immutable; corrections use a replacement lesson without reusing scores.
- Changing a class collection changes current work, not historical submissions. Re-selecting the same lesson restores its real progress. Warn and confirm before changing.
- Each lesson has compressed slide previews, 3–4 vocabulary questions, one short speaking activity, a scaffolded writing prompt, and 2–3 concrete comprehension questions. Opening slides alone does not mean mastery.
- Admin upload accepts PDF exports or slide images, compressed locally in the browser. No paid conversion service is provisioned. Convert the supplied PPT locally into a ready sample; leave the original unchanged and omit teacher-only/repeated reward slides.
- Student scores are computed on the server. Speaking uses the existing speech service with the server-owned sentence; writing is submitted for teacher review, not assigned a fabricated automatic grade. Each activity allows up to three saved attempts; slide review is a separate acknowledgment.
- Reports separate activity scores, submitted writing, speech feedback, completion, and meaningful study days (China time). Class-only access, current database roles, bounded uploads, no answer keys before submission, and safe media access are required.

## Work and verification
1. Add domain and route tests, then implement the library, class binding, submissions and reports.
2. Adapt/render/check the sample PPT and seed it idempotently.
3. Build admin publishing, class settings, student lessons and teacher report UI; preserve existing classroom workflows.
4. Verify permission failures, answer grading, retry idempotency, course switching/history, speaking failures and upload limits. Check actual rendered screens at 320/390/820/1440 widths, run existing tests and production build.
5. Independent review, address findings, commit only feature files and push. Leave pre-existing scratch/ untouched. Disclose any verification limits.

## Verification record
- Server suites: 25 passing tests, including role/access checks, course history/restore, grading, full-upload replay, same-request replay across course changes, and commit-time revision rejection.
- Frontend suites: 17 passing tests, including editable choices, explicit submission, network replay, read-only teacher work, refreshing newly published lessons, and JPEG fallback when WebP encoding is unavailable.
- Production build passes. Built-site Chrome workflow uses synthetic data, a fake microphone and actual browser PDF rendering, with the production content-security policy. Tested 320/390/820/1440 widths in English/Chinese with no horizontal overflow or page errors.
- Sample: eight decoded and visually checked WebP slides, 444,438 image bytes; original source unchanged. Four vocabulary questions, three concrete comprehension questions, one speaking sentence and a three-or-more-sentence writing prompt.
- Independent review findings addressed: lesson refresh propagation, final-slide retry, atomic class-revision/submission transaction, and transactional idempotent replay ordering.
- Live MongoDB transactions, live speech-provider scoring and physical iPad/WeChat behavior were not exercised. The test database is explicitly a boundary adapter, not a Mongo transaction emulator.
- Dependency audit reports 38 existing application/toolchain findings (0 critical); no `pdfjs-dist` advisory was reported. No unrelated package upgrades were attempted in this lesson feature.
