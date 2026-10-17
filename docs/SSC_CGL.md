# SSC CGL personal study release · 17 October 2026

Open `/ssc-cgl`. This release makes the common SSC learning/practice workflow usable locally; it does not certify a complete or independently reviewed SSC curriculum.

## Available now

- 44 original condensed lessons: 9 maths, 8 reasoning, 8 English, 7 general awareness, 4 computer, 4 Statistics and 4 Finance/Economics. Every lesson has concepts, an original worked example, recall prompts, an error warning, personal notes and connected topic practice.
- 200 distinct new original MCQs with explanations: 36 maths, 32 reasoning, 48 English, 28 awareness, 24 computer, 16 Statistics and 16 Finance/Economics. These have author checks only, not independent editorial review, official keys or PYQ provenance.
- Lesson completion enters the existing per-exam recall queue; notes are available through the notebook and opt-in private search. Existing arithmetic/probability foundations remain linked.
- Complete-count original rehearsals for Tier-I and the objective session of Tier-II Paper-I. Full paper generation never pads a short bank or repeats a question within the attempt. Another paper may require explicit reuse of questions seen in earlier attempts. These are foundation/essentials rehearsals, not calibrated exam difficulty.
- Separate DEST at `/ssc-cgl/dest`, using an original 1,968-character ASCII passage. Its timer starts only when the learner starts this separate session; no break duration is invented. It saves each accepted change, retains the original deadline, requires takeover after a reload, rejects stale-tab writes, and retains ten reports in the workspace backup. Paste/drop prevention is a practice aid, not anti-cheat.

## Rules and provenance

The primary rule reference is the [2026 SSC CGL notice](https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf), §§13.8–13.11, checked 17 October 2026. The later Central Region notice dated 24 September concerns centre/date/shift reassignment, not a replacement paper scheme. Tentative dates in the original notice are not encoded as a current calendar.

| Rehearsal | Counts and standard subject timers | Scoring |
| --- | --- | --- |
| Tier-I | 25 each in reasoning/awareness/quant/English; 15 minutes each | +2 / −0.50; blanks zero |
| Tier-II common objective | Maths 30/30 min; reasoning 30/30; English 45/40; awareness 25/20; computer 20/15 | +3 / −1; blanks zero |

Compensatory practice timings are separate: Tier-I 20 minutes per subject; Tier-II 40/40/55/25/20 minutes; DEST 20 minutes instead of 15. These options do not establish accommodation eligibility.

The Tier-II report separates the 390-mark merit portion from the 60-mark qualifying computer component. DEST is also qualifying, but no pass/fail verdict or official error percentage is invented. The character-level Levenshtein report counts case, spaces, punctuation, missing remainder and line breaks. Five-character WPM includes errors and is only a practice metric.

The rehearsal uses the notice's subject-table order with fixed subject timers. Live subject-order/navigation behaviour has not been independently certified. Frozen SSC metadata is checked against counts, question sections, marking, bank version and timings when restoring an attempt; altering its configuration invalidates the snapshot. The original v1, v2 and v3 banks remain available for old attempts; new attempts use v4.

## Still incomplete

- Complete subject depth, especially ancient/medieval history, maps/culture, visual reasoning, current affairs and advanced special-paper teaching. A lesson's tags indicate scope, not mastery of every official subtopic.
- Independent review of every answer, explanation and lesson; authentic, permitted previous papers with final keys; calibrated difficulty and curated SSC-specific videos.
- Statistics and Finance/Economics full-length papers. Their separate 100-question schemes are shown with post applicability, but each branch currently has only 16 original questions. The UI offers lessons/drills and does not launch a padded full paper.
- Regional DEST evaluation instructions and live examination navigation certification.
- Comprehensive physical-device and accessibility review. Responsive CSS is implemented, but local browser UI access was unavailable from the remote browser.

No Supabase, account or AI-provider enablement is required. Cloud sync and tutor remain OFF by default. Notes/results/DEST are in the existing JSON backup; private PDF file bytes still require their own copy.

## Validation

92 automated tests pass, including separately computed numerical keys, constraint enumeration, full paper counts, exact timer boundaries, frozen-marking tampering, unseen-bank exhaustion, merit/qualifying separation, DEST edit distance/deadlines, storage conflict handling and lesson-to-recall/search integration. Production build and HTTP/authentication deny-path checks pass in configured-fake-provider and local-only modes. Production dependency audit reports zero vulnerabilities. These checks do not replace subject-expert review.
