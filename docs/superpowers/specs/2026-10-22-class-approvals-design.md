# Class approvals and oversight

## Scope

Hide both standalone and teacher-assigned Extra practice from the website. Retain content, saved results, and the existing backend/storage for future reuse. Lesson activities (including vocabulary, writing, speaking, and slides/quick check) remain available. Home, navigation, student classes, teacher classes, and student profiles must not offer extra-practice entry points.

New student enrollment requires the class owner's approval. Existing members remain enrolled. Invitation-code entry creates a pending application, not membership. Students see pending/declined applications and can check their status; pending users cannot read class work or submit. Teachers see the student's submitted name plus account username to identify the applicant, and approve or decline. This is manual teacher verification, not automated identity verification. Repeated requests/actions must be safe; stale decisions must not approve a replacement application.

Administrators get a read-only Teachers overview, drill down to a teacher's classes, then view each class's student lesson progress. Show objective counts and submission activity, not an invented teacher performance score. Teachers retain their own class roster, student profiles, submitted lesson activities, feedback, recordings, completion and study days. No teacher can view another teacher's student work. Administrator reporting must not expand write/media access or expose invitation codes, credentials, essays, or recordings.

## Design

- Store join applications in `classJoinRequests`, keyed by class/student, with a fresh request ID for each reapplication. Use existing transaction infrastructure for approval and quota checks (200 students/class, 20 classes/student). The current role and token version remain authoritative.
- Class list returns approved classes and the caller's pending/declined `joinRequests`. Owner class detail includes pending applications. Owner decisions use request IDs, not just student IDs, to prevent stale approvals.
- Use explicit administrator GET endpoints. Teachers/classes are listed without student-level content; class drilldown loads only summary lesson progress. Paginate teacher listing rather than silently dropping teachers. Reuse lesson summary utilities and existing membership security boundaries.
- Keep current styling, mobile responsiveness, English/Chinese labels, completion rewards and saved work. Use a shared visibility constant for reversible practice hiding, with route guards as well as removing links.

## Decisions and limits

The user explicitly chose hiding both practice types. Standing instructions permit implementing and publishing without repeated confirmation. Work in the current checkout, preserve unrelated `scratch/`, use two focused implementation agents plus the coordinator, and one consolidated review. No new dependencies, automatic enrollment migration, teacher ranking, live student-data testing, or content deletion. Completion means permission tests, affected frontend tests, a production build and synthetic browser checks pass; report deployment separately from a successful push.
