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

## WeChat

These changes make the site safer and reduce abusive signals, but no code can
guarantee that WeChat will remove a warning or allow every share. If the domain
is already flagged, use WeChat's official safety-warning or appeal process
after the verified HTTPS domain, privacy information, and contact details are
in place.
