# Learning-first assigned extra practice — verification

## Scope

Teachers can assign existing reading, vocabulary, grammar, writing, and speaking
content. New vocabulary assignments start with pronunciation/Chinese flashcards;
new grammar assignments start with the concept and exactly three related checks.
Writing and speaking use the existing AI services with three submitted attempts.
Teacher review is read-only and recordings load through an authenticated route.
Lesson completion styling uses white/light-slate cards and blue selection/progress.

Missing-format assignments remain legacy quizzes. Existing questions, saved
results, stored attempt limits, and lesson rewards are not rewritten. Home,
sidebar styling, standalone practice, and placement testing are unchanged.

## Automated coverage

Fresh controller runs on implementation commit `d60fe6c`:

- `node --test tests/*.test.js`: 93 passed, 0 failed.
- Full React test suite (CI, non-watch, in-band): 113 passed, 18 suites, 0 failed.
- Production React build: compiled successfully.
- `git diff --check`: no whitespace errors.

- Backend: all five subjects/levels, source versions and tampering, legacy data,
  grammar validity, AI input/result validation, failure/no-attempt behavior,
  idempotency, concurrent limits, authorization at save, and protected recordings.
- Provider boundary: malformed speech results cannot become invented zero scores;
  assignment deadlines cancel Deepgram/Gemini transport and prevent fallback retry.
- Frontend: learning gates, editable choices, immutable teacher publication,
  productive results/retries, actual recorder lifecycle with browser doubles,
  read-only teacher feedback, audio cleanup, navigation guards, and lesson colors.

## Browser walkthrough

Used a local memory-backed class and synthetic evaluators, never real accounts.

| Surface | Checks |
| --- | --- |
| Phone, 390×844 | Flashcard flip/Chinese meaning; clear audio failure; editable quiz choices; return to learning preserves answers; writing failure retains draft without consuming an attempt; successful score/feedback |
| Tablet, 820×1180 | Writing history/remaining attempts; protected speaking playback; speaking practice controls; white completed lesson tabs, blue selection/progress, neutral result |
| Desktop, 1280px | Five-subject picker; canonical writing preview/publication; activity labels; student profile writing/speaking results; teacher-only playback; read-only identity and English/Chinese labels |

Document width matched viewport width at 390, 820, and 1280 pixels.

## Narrow implementation decision

Added a registered navigation guard through the existing view setter so leaving
assigned practice through the sidebar also warns about unsent work, including an
active microphone. The guard unregisters on unmount and does not affect ordinary
navigation without a draft. If this boundary were too broad, the impact would be
an unnecessary confirmation dialog; cancel/confirm/cleanup tests cover that risk.

## Limits of verification

AI responses and provider transports were mocked for deterministic checks. Live
Deepgram/Gemini credentials, live service quality, and physical microphone capture
were not tested. The production build emits Node's existing `fs.F_OK` deprecation
notice, unrelated to application compilation. Deployment status is not inferred
from local verification.
