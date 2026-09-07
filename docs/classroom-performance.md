# Classes performance and provisioning

## Deployment

Classroom indexes and the sample lesson are no longer created while students wait
for a request. Existing databases that served Classes before this change already
have these indexes and sample content; this release does not delete or rewrite them.

Before using a **new database**, or after changing an index definition, provision
it from the repository root with `npm run setup:classrooms`. Supply `MONGODB_URI`
through the deployment's secret environment, targeting the intended database.
The script uses `stepping_stones_v2`, the same name as the API. Never commit the URI.
It is safe to rerun: sample content uses insert-only updates; existing lessons,
student results and star balances are preserved. Unique-index conflicts must be
resolved before using that database. Do not run this command on every API request.

## What changed

- Normal class/lesson request counters now use one atomic shared MongoDB command
  (with a duplicate-key retry for concurrent first requests). Limits are unchanged.
- Slide authorization no longer loads saved work for current lessons. Archived
  lessons still require the enrolled student's saved work. Media stays private.
- Lesson details exclude recording bytes; recordings load on playback. Older saved
  recordings retain their playback controls.
- Class lesson summaries select only summary fields and load independent reads
  together after authorization.
- Class details and the lesson list start together. A cancellable loading shell
  appears immediately; it never assumes teacher permission before the response.
- Slides remain mounted while switching lesson activities. Leaving the lesson or
  changing account/context still releases images. One-slide-ahead preloading stays
  bounded. Loading or preloading a slide does not itself earn completion stars.
- Concurrent refreshes share a request. Class-scoped mutations invalidate that
  class's data, not unrelated classes/course choices. Unknown mutations still
  invalidate conservatively. Private caches remain in memory with a 30-second TTL.

## Verify production latency

Authenticated class and lesson responses include `Server-Timing: app;dur=...` in
milliseconds, without personal data. Compare this with total request duration in
the browser's Network tools. High server time points toward database/provider
work; a large difference points toward network transfer or platform startup.

Measure first entry, repeat entry, lesson open, next/previous slide, activity-tab
return, submission and back-to-class. Compare cold and warm requests. Confirm no
new slide request on an activity-tab return and fresh progress after submission.
Test student and teacher accounts separately, including mobile and tablet widths.

Controlled comparison against commit `90ad205` (50 ms simulated delay per database
command, in-memory data, not a live-site benchmark):

| Request | Commands before / after | Elapsed before / after |
| --- | --- | --- |
| First class list | 11 / 3 | 356 / 181 ms |
| First lesson request | 19 / 3 | 926 / 186 ms |
| Class details | 6 / 5 | 375 / 312 ms |
| Lesson list | 7 / 6 | 435 / 247 ms |
| Slide | 7 / 5 | 435 / 311 ms |

The first-request comparisons exclude opening a new database connection. Index
commands run concurrently; command counts are not the number of serial waits.

Verify the deployed Vercel Function region against the MongoDB Atlas cluster
region before changing hosting settings. Prefer co-location, then measure from
students' actual networks. Region and live-provider latency were not verified
locally; synthetic database-delay checks are not production speed guarantees.
