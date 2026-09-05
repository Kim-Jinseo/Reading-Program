# Security deployment checklist

This application now enforces security controls in the source code, but a
production deployment also needs secure provider settings. Complete this
checklist before publishing or sharing the site widely.

## Required environment settings

- Set `JWT_SECRET` to a newly generated value of at least 32 characters. Do
  not reuse the previously exposed teacher or admin password as a secret.
- Keep `MONGODB_URI`, `GEMINI_API_KEY`, `DEEPGRAM_API_KEY`, and
  `TEXT_TO_SPEECH` only in the hosting provider's encrypted environment
  settings. They must never be placed in frontend variables, committed files,
  screenshots, or browser requests.
- Leave `ALLOWED_ORIGINS` empty when the frontend uses the included
  same-origin Cloudflare proxy. If a separate site must call the API directly,
  set it to a comma-separated list of exact HTTPS origins, for example
  `https://learn.example.com`. Do not use `*`.

## Immediate account cleanup

- Review the MongoDB `users` collection and remove or demote any unexpected
  account with `role: "admin"`.
- Change the password for every old teacher/admin account. The previous
  client-side teacher code must be treated as exposed.
- Grant administrator access only by changing a verified user's role in the
  database through a trusted administrator workflow. Public signup always
  creates student accounts.

## Hosting and abuse protection

- Use a verified custom HTTPS domain for the public site and configure the
  same domain in the intended WeChat product settings.
- Turn on Cloudflare or Vercel WAF/rate-limit rules for `/api/auth/login`,
  `/api/audio/*`, `/api/writing/grade`, and `/api/placement-tests`. The
  in-app limits are a safety net; provider-level limits cover all serverless
  instances.
- Keep the frontend proxy pointed only at the approved HTTPS API origin.
- Review deployment logs for repeated `429` responses, failed administrator
  authorization, and duplicate-username index warnings.

## Dependency maintenance

- The API production dependency audit is currently clean. Keep it that way by
  running `npm audit --omit=dev` before releases.
- The static frontend still uses the older Create React App build toolchain.
  Its development/build dependency audit has upstream findings that cannot be
  safely fixed with an automatic upgrade. The deployed browser receives only
  the compiled static files, but plan a tested migration to a maintained build
  toolchain rather than using `npm audit fix --force` blindly.

## Student privacy

- Placement records contain a Chinese name and grade. Keep a documented
  retention period, provide a contact method for deletion requests, and do
  not export the records publicly.
- The public leaderboard now returns masked display names and no raw MongoDB
  identifiers. Keep it that way unless a parent/guardian opt-in process is
  added.
- Class membership exposes only that student's chosen class name, assignment
  answers/scores and practice completion counts to the owning teacher.
  Other students and teachers cannot see that class's private reports.
  Include class and assignment records in the retention/deletion process.

## Teacher verification and classes

1. Sign in with a trusted **administrator** account. Open **Classes**, then
   **Generate teacher code**. Copy it immediately and send it privately to the
   intended teacher. It is single-use, expires after seven days, and only its
   hash is stored in `teacher_invitations`.
2. The teacher signs in with their own regular account, opens **Classes →
   Are you a teacher?**, and enters that private code. This grants `teacher`,
   never `admin`. Teachers cannot issue teacher codes, edit the shared
   curriculum, or see another teacher's class.
3. The teacher creates a class and shares its separate **class invitation
   code** with students. Students sign in, enter it and their teacher-facing
   name, and join. Replacing a class code blocks future joins with the old
   code; it does not remove existing members.
4. Use **New assignment** to copy existing reading, vocabulary or grammar
   questions, or write 1–30 custom multiple-choice questions. Check the answer
   key before publishing. Choose 1–3 attempts. Published questions are fixed
   so saved scores remain comparable. No PPT upload is included in this release.
5. Students can change choices before **Submit assignment**. Only completed
   submissions are stored, scores are computed server-side, and first/latest/
   best scores remain visible separately. The teacher opens individual
   students and assignments for detailed answers; large answer histories are
   not downloaded with the class overview. Practice counts are separate,
   self-reported completion indicators, not independently assessed grades.

For initial provisioning without an existing administrator, a deployment owner
may configure the server-only `TEACHER_VERIFICATION_CODE` environment variable
to a new random secret of at least 16 characters. Never prefix it with
`REACT_APP_`, put it in client code, or reuse old exposed passwords. This
optional shared code is reusable until removed/rotated; prefer administrator-
issued one-use codes and leave the setting absent afterward. No built-in
teacher password is enabled.

The first classroom request creates indexes automatically in the existing
MongoDB database. New collections are `classes`, `class_assignments`,
`assignment_submissions`, `teacher_invitations` and `classroom_rate_limits`.
Give the existing database account normal collection/index creation permission;
no new paid service is required by the implementation. Capacity/hosting costs
still depend on actual use. Codes and private results must never be cached
publicly. Add `/api/classroom/*` to provider abuse monitoring.

## WeChat

These changes make the site safer and reduce abusive signals, but no code can
guarantee that WeChat will remove a warning or allow every share. If the domain
is already flagged, use WeChat's official safety-warning or appeal process
after the verified HTTPS domain, privacy information, and contact details are
in place.
