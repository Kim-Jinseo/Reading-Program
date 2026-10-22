# Class approvals and oversight implementation plan

> **For agentic workers:** Use subagent-driven-development with the user's efficiency preference: disjoint file ownership, focused tests, one consolidated final review.

**Goal:** Hide extra practice without deleting data, require teacher approval for new joins, and provide administrator oversight.
**Architecture:** Keep owner/member access unchanged; join applications live separately until approved. Add explicit read-only admin reports; keep React views role-aware and practice features reversibly hidden.
**Tech stack:** Existing React/Tailwind, Hono, MongoDB, Node tests and React Testing Library.
**Spec:** `docs/superpowers/specs/2026-10-22-class-approvals-design.md`

## Global constraints

No content/results deletion, no new dependencies, no expansion of admin write/media access. Preserve existing members and five-record lesson completion/rewards. English/Chinese UI; accessible responsive states. Preserve unrelated `scratch/`. One consolidated review; no worker-created agents or commits.

## API contracts

All classroom paths below are relative to `/api/classroom`.

```js
POST /classes/join // {code, displayName}
// {success:true,status:'pending'|'approved',class:{id,name},request?:{id,status,requestedAt}}
GET /classes
// existing classes + joinRequests:[{id,classId,className,status,requestedAt}]
GET /classes/:id
// existing response + joinRequests:[{id,studentId,name,username,requestedAt}] for owner only
POST /classes/:id/join-requests/:requestId/decision // {decision:'approve'|'decline'}
// {success:true,status:'approved'|'declined'}; stale conflicting decision 409
GET /admin/teachers?after=<optional cursor>
// {success:true,teachers:[{id,name,classCount,studentCount,pendingCount}],nextCursor:null|string}
GET /admin/teachers/:teacherId/classes
// {success:true,teacher:{id,name},classes:[{id,name,studentCount,pendingCount,createdAt,collectionId}]}
GET /admin/classes/:classId/report
// {success:true,class:{id,name},teacher:{id,name},students:[{id,name,assigned,completed,studyDays28,lastSubmittedAt,activitiesSubmitted}]}
```

Teacher counts include only their owned classes; studentCount is class enrollments, explicitly labeled as such. Administrators who own classes may appear alongside teachers. Never include request IDs or student identities in aggregate teacher listing.

### Task 1: Enrollment and read-only oversight backend

Files: `server/classrooms.js`, new focused enrollment/report helpers as needed, `api/index.js`, `server/provisionClassrooms.js`, `tests/helpers/memoryDb.js`, `tests/classrooms.test.js`, new `tests/classApprovals.test.js` and `tests/teacherOversight.test.js`. Own backend files only.

- [x] Write failing route tests: request pending without membership; approved access; declined denial; duplicate/stale decisions; outsider/student/admin-nonowner denial; existing enrollment unchanged; token/role changes; quotas and concurrent approvals. Test admin responses exclude secrets/raw student work and require current DB role. Extend the database fake only for actual Mongo operations used.
- [x] Run `node --test tests/classApprovals.test.js tests/teacherOversight.test.js` and record expected failures.
- [x] Implement contracts with transaction-safe enrollment and minimal report projections/explicit response shaping. No global authorization relaxation. Add necessary indexes via existing provisioning, not request-time creation. Update pre-existing test setup helpers to explicitly approve joins.
- [x] Run affected backend tests. Send concise evidence and modified file list; coordinator runs the complete suite once.

### Task 2: Classroom enrollment UI and practice visibility

Files: `frontend/user-app/src/App.jsx`, `context/AppContext.jsx` if needed, `pages/MainDashboard.jsx`, `components/layout/Sidebar.jsx`, `pages/ClassesView.jsx`, `components/classes/TeacherClassView.jsx`, `StudentProfile.jsx`, `shared.js`, new visibility config, and their tests. Do not edit `AdminDashboardView.jsx` or new admin oversight components (coordinator owns those).

- [x] Add failing tests for no standalone/assigned practice UI, inaccessible hidden view states, preserved lesson navigation; pending join must not open class. Cover pending/declined listings, status refresh, owner approve/decline success/failure and duplicate-click lock.
- [x] Run focused tests, then implement. Keep hidden practice modules/content files intact; a shared exported `EXTRA_PRACTICE_ENABLED = false` gates entry points and renders. Remove unused tab columns when hiding practice. Lesson report, not hidden practice report, supplies roster/profile metrics. Hide profile extra-practice sections as well.
- [x] Join action displays pending confirmation and updates request list; approved legacy join can open class. Refresh list on focus/visibility or explicit Check status, without background polling. Teacher Students tab shows pending applications with display name/username, timestamp and approve/decline actions. Successful decisions refresh both roster and pending counts.
- [x] Run affected frontend tests. Keep retained assignment component tests; revise integration tests that intentionally required now-hidden navigation. Report evidence and changed files.

### Task 3: Administrator overview

Files: new `frontend/user-app/src/components/admin/TeacherOversight.jsx` and test, `pages/AdminDashboardView.jsx`. Coordinator owns these.

- [x] Test role restriction, teacher-to-class-to-report drilldown, zero-data/error/retry, pagination and stale response handling using API-boundary doubles with real UI.
- [x] Implement a Teachers overview as the default admin page, retaining content management behind a separate tab. Guard both render and fetch against non-admin. Show teacher name, class count, student enrollments, pending requests; class list and current student progress with clear back navigation.
- [x] Use no raw student artifacts or inferred quality score. Label study days and last submission accurately, and explain counts are not teacher evaluation.
- [x] Run targeted tests, then one combined frontend suite, backend suite, and production build after integration.

### Final verification and delivery

- [x] Consolidated review of permissions, integration and preservation. Fix real issues and rerun only covering tests.
- [x] Synthetic browser check: student pending/no access, teacher approval and student access, admin drilldown, no practice entry points; desktop and phone.
- Delivery: commit explicit scoped files and publish under standing authorization. Do not commit scratch or synthetic fixtures. Record the published commit and deployment verification status in the final handoff.

## Verification record

- Backend: `node --test tests/*.test.js` — 121 passed.
- Frontend: complete Jest suite — 21 suites, 158 tests passed. After the build flagged a cleanup-ref lint warning, captured the stable ref in the effect and reran the two covering class suites — 24 tests passed.
- Production: `CI=true node node_modules/react-scripts/scripts/build.js` — compiled successfully with no ESLint warnings.
- One consolidated review found a pending-decision/hidden-view busy-state race; regression reproduced it, then passed after lock cleanup was corrected. No remaining actionable findings.
- Browser: synthetic-only join remained pending with no class access; owner approved, pending count became zero and roster grew from one to two; approved student opened class lessons. Existing student's four saved lesson activities remained visible to the teacher. Administrator drilldown showed matching counts and read-only lesson summaries. Extra practice was absent from Home, sidebar, class tabs and profiles. Desktop and 390px phone layouts inspected. Temporary server stopped; viewport restored.
- No live student records or provider calls used. Additional join-request indexes are included in the existing explicit provisioning command; no production database migration was run. Existing memberships require no migration.
