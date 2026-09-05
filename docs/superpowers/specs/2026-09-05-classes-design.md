# Teacher classes and assignments

The user approved implementation of website-managed classes, teacher code verification,
student invitation codes, and teacher visibility into assignment performance.

- Add a Classes entry on the home page and sidebar, for signed-in students and teachers.
- A student becomes a teacher by redeeming a server-verified code. Administrators may
  issue single-use codes valid for seven days. An optional private environment code
  supports initial setup. Teacher permissions never grant administrator permissions.
- Teachers create named classes, share random invitation codes, rotate those codes,
  and publish immutable multiple-choice assignments (1–30 questions, 2–4 unique
  options). Existing reading, vocabulary and grammar content can be copied into an
  editable assignment. Teachers can also enter their own passage/instructions.
- Students join with a class code and display name, complete assignments, review
  results, and retry up to the teacher's selected limit (1–3). Only completed attempts
  are stored; choices can change before Submit. Results are graded on the server.
- Teachers see only their own classes: students, completed/outstanding assignments,
  first/latest/best scores, submission times, and question-level answers. Existing
  practice completion counts are displayed separately from graded assignments.
- MongoDB holds classes, assignments, submissions, teacher invitations, and durable
  rate limits. Unique indexes and conditional writes prevent duplicate joins, reused
  teacher invitations, repeated submissions, and bypassing retry limits.
- New UI follows language choice, with responsive cards, stacked forms, wrapping
  text, visible selected-answer states and touch targets at least 44px.
- This feature uses local website accounts; PowerPoint upload and ClassIn connection
  are separate work. No private credentials or actual student data enter tests.

Verification covers privilege escalation, membership/ownership boundaries, key hiding,
grading, malformed input, retry/concurrent submit limits, code rotation, UI workflows,
English/Chinese labels, and the production build.
