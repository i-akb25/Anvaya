# All-exam learning release · 18 October 2026

Open `/classrooms` for all ten exam paths. SSC keeps `/ssc-cgl` and `/ssc-cgl/study`; its `/classrooms/ssc` aliases redirect there. The other nine paths use `/classrooms/[exam]` and `/classrooms/[exam]/study`.

## Available inventory

Counts below include shared foundation lessons relevant to each exam. They must not be summed as unique content or interpreted as full syllabus coverage. The unique active bank is 118 lessons and 745 original questions; the dedicated SSC collection remains 79 lessons and 562 MCQs.

| Exam context | Available lessons | Original questions |
| --- | ---: | ---: |
| UPSC Civil Services | 22 | 95 |
| BPSC Combined Competitive | 22 | 95 |
| SSC CGL, including shared foundations | 97 | 635 |
| SBI PO | 17 | 73 |
| IBPS PO | 17 | 73 |
| GATE Electrical Engineering | 30 | 139 |
| GATE Electronics and Communication | 28 | 127 |
| GATE Instrumentation Engineering | 29 | 133 |
| UPSC ESE Electrical | 29 | 137 |
| CAT | 16 | 67 |

The initial all-exam batch added seven original worked lessons add 42 questions: nominal/real output, table data interpretation, necessary/sufficient conditions, sinusoidal AC real power, Boolean gates, strain-gauge calibration and ideal transformers. They include concepts, worked steps, recall prompts, pitfalls and connected practice. Formats include MCQ, exact-set MSQ, NAT and TITA. Original numerical datasets and policy examples are fictional. Concept references are publisher pages from OpenStax, All About Circuits and NI, checked on 18 October. These are author-checked lessons, not independently approved chapters or copied textbook exercises. No new video playback claim is made.

## Bounded navigation

Classrooms separate overview, lessons, practice and sources into explicit sections. SSC also has a separate latest-result section. Lesson grids, the global course library and lecture library show six items per page and replace the page instead of appending more content. Changing filters resets pagination. Page controls return keyboard focus and scroll position to the displayed page. The ten-row classroom directory has an exam-group filter.

Study desks separate the next session, subject evidence and mistake notebook. The notebook shows one question per page, including its diagnosis editor, with previous/next controls and an explicit bulk-select action for up to 20 eligible matching questions. The original SSC notes and settings remain in their original field; they are not migrated or overwritten.

## Study and retry contracts

Other exam settings and question notes use optional `examStudy[examId]` in the validated learning vault. A shared question's note, completion and latest answer remain isolated by exam context. The planner honours the saved 20–180-minute budget and subject scope, using recorded lesson reading estimates, due recall, unresolved questions and incomplete units. It does not mark anything complete or infer readiness. Subject evidence uses distinct latest responses from the 30 retained objective results; unanswered counts remain separate.

Question notes support reason, correction, reversible manual resolution and private key doubts. A doubt is neither an externally submitted report nor an approved key correction. Flags exclude questions from retries until cleared. Optional private search includes question notes without placing private note text in URLs. Existing backups without the new field remain valid; new exports include it. Stale revisions reject writes.

Non-SSC focused retries contain only 1–20 explicitly selected unresolved questions, one minute per question, free navigation, +1 correct, −0.25 for wrong MCQs and zero for wrong MSQ/numeric or blank responses. This is a custom study scheme, not an exam-specific marking contract. SSC focused retries preserve their existing +2/−0.50 custom scheme. Active objective, personal or DEST sessions block a second launch. A one-time same-tab token must match exam, attempt ID and current writer; expired or changed tokens cannot silently claim another attempt. Sectional practice uses the same launch mechanism.

Bank v6 adds the new questions; v1–v5 remain available unchanged for frozen saved attempts. Full SSC original paper templates remain pinned to v5/template v2, preserving the existing counts, quotas, timing and question membership. Never update a released key in place.

## Verification and limits

125 automated tests pass, including new numerical recomputations and exhaustive Boolean checks, cross-exam isolation, all-nine-path exact retries, bank v5 recovery, SSC pinning, backup validation and ownership conflicts. Production HTTP checks cover all new classroom and study routes, invalid-exam 404s, bounded initial course/lecture pages and existing authentication deny paths. Production build and dependency audit are required before merge.

Full syllabi, complete-depth teaching, calibrated full mocks for the other exams, permitted authenticated official PYQs/final keys, independent expert review and comprehensive device/accessibility QA remain incomplete. Existing paper references retain their individual recorded cycles, retrieval status and unresolved issues; this release does not certify them as newly reviewed live rules. Supabase and tutor remain OFF by default.

The subsequent [engineering depth and GATE release](GATE_ORIGINAL_REHEARSAL.md) adds 10 lessons/60 questions, full-count original EE/EC/IN rehearsals and a bounded scientific calculator. It brings current validation to 125 tests and bank v7 while preserving v1–v6. The inventory table above reflects that latest release.
