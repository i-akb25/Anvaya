# Anvaya

**Project source of truth:** [PROJECT_MASTER.md](./PROJECT_MASTER.md). Product, design, privacy, content integrity and release rules are documented there.

An exam preparation prototype with learning paths, worked examples and paper-specific practice. It is **not a complete or production-ready learning platform**.

## Development prototype (not a learner release)

| Route | Experience |
| --- | --- |
| `/` | Study desk and exam-filtered next lesson |
| `/exams` | Ten exam tracks, learning links and official portals |
| `/topics` | Search foundation topics and aliases by exam context |
| `/learn` | Foundation learning paths |
| `/learn/[slug]` | Concepts, worked example, common trap, checkpoint, revision prompts, notes |
| `/practice` | CAT/SSC rehearsal, five-question drills, section timers/locks, recovery |
| `/results` | Section reports, responses, explanations, study backup/restore |
| `/practice/custom`, `/review` | Earlier demo engine/history preserved separately |

The new study layout uses cream, sage and earth colours, restrained elevation and a reading-led content hierarchy. Responsive breakpoints and keyboard states are implemented; real browser/device visual QA is still pending. No claim of WCAG compliance is made without testing.

## Content and exam rules

There are **13 AI-generated lesson drafts** and **146 distinct AI-generated foundation questions**: 24 VARC, 22 DILR, 25 QA, 25 reasoning, 25 general awareness and 25 English. They are explicitly **not editorially reviewed, not authentic PYQs and not calibrated to real exam difficulty**. Automated numerical-key checks do not replace subject-expert review.

- **CAT rehearsal:** requested 68-question blueprint, 24/22/22, VARC → DILR → QA, 40 minutes each, 204 available marks. Completed/upcoming sections cannot be opened. MCQ +3/−1; numeric +3/0. The historical official 2024 navigation guide is linked as a reference. CAT 2026 current-cycle retrieval was blocked; no claim of independently verified 2026 question count is made.
- **SSC CGL Tier-I rehearsal:** 100 MCQs, 25 per subject, 60 minutes with 15-minute subject timers, +2/−0.5. Source: official 2026 notice §13.8, checked 14 October 2026. The rehearsal follows the table’s subject order without claiming the live interface’s order. Tier-II, DEST and accommodation timings are not implemented.
- Each blueprint has one full paper’s worth of content. Shuffling does not create a new mock. Previously attempted questions are excluded by default; exhausted pools stop with an explanation. Repeats require an explicit revision choice.
- Full mocks for other tracks, complete reviewed syllabi and an authentic PYQ collection are not available. Linked GATE EE/EC/IN references remain separate dated source records, not imported syllabi.

Released bank and paper versions are append-only. Preserve old versions when publishing changed questions or keys so historical attempts remain reproducible.

## Local data and privacy

No account, provider token, private server upload or cloud sync is enabled. Notes and attempts use browser storage, which is not encrypted or user-isolated server storage. Use a trusted device. Never commit private notes, paid PDFs, credentials or personal documents.

- New study key: `anvaya-study-v1`.
- Study backups include notes, exam-context reading progress, seen-question IDs, unfinished test state and the latest 30 results. Restore explicitly replaces the new study workspace after validation; export first if needed.
- Legacy demo keys (`anvaya-workspace-v2`, `anvaya-practice-v1`) remain separate and readable through legacy routes.
- Recovery retains the original section deadlines. Resuming elsewhere claims the local draft; stale-tab writes are rejected. Repeated submissions do not create additional results.
- Failed writes retain the previous stored record. Memory-only practice is available, with a downloadable result. Raw recovery export is provided for damaged data; it is not an automatic import format.
- Backups contain private notes and responses. Store them privately. External lecture links are publisher searches/redirects, not downloaded classes or partnerships.

## Run and verify

Node 22.18 or later:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

```bash
npm run typecheck
npm test
npm run build
```

Regression coverage includes bank integrity/provenance, fixed section transitions, stale-section answer rejection, numeric/MCQ penalties, quantitative keys, unseen-pool exhaustion, recovery, idempotent submission, conflicting tabs, legacy migration, backup validation, failed writes and exam-specific reading progress. These checks do not constitute expert content moderation or browser usability verification.

CI uses `npm ci` and the lockfile. Existing asset generation is available with `npm run assets`: the Anvaya SVG mark/wordmark, app icons, study-desk illustration and social cover are retained.

## Outstanding release gates

Private owner authentication, server-side authorization/RLS, cross-device notes/files, independent server backups, complete canonical syllabus mappings, reviewed source-backed patterns/PYQs, expert content verification, browser accessibility/device QA and operational release testing remain incomplete. These local prototype features do not satisfy those gates. Search indexing remains disabled.

The PostCSS override stays within the existing Next.js 15 stack. The previously observed development-only `braces`/ESLint advisory is still documented; a clean production-dependency audit is not a clean full-toolchain audit.

Support: akbsupportinfo@gmail.com

## Accuracy gate across all exams

All ten tracks are recorded in `lib/exam-coverage.ts` with authority, cycle, source URL, retrieval status and explicitly incomplete rule review. A failed retrieval is not labelled verified. Stages are reviewed separately; the three GATE papers remain distinct. No generic CAT/SSC paper is substituted for another exam.

The generated lesson/question prototypes are now **disabled in production**, even if the preview flag is set. To inspect drafts locally only, use `NEXT_PUBLIC_ANVAYA_DRAFT_PREVIEW=true` with `npm run dev`. They are not approved learning content. Production routes show the source-review status instead, with tests unavailable. This is an incomplete source-review interface, not the promised learning platform. Source-backed content, question moderation and private-workspace gates must be completed before learner publication.

### Course-first classroom update

The workspace now has ten exam paths, subject sections, a responsive header/footer, an ink/paper/copper theme and a light/dark toggle. `/papers` links original GATE papers/keys and official UPSC/GATE archives. `/study/private` opens a user-selected local PDF alongside recall notes and a study timer. The PDF is not uploaded or retained after reload. `/planner` manages study sessions and exports/imports workspace backups with explicit replacement confirmation. Earlier practice backups remain separate.

This is a local workspace preview, not a complete learning service: reviewed hosted lessons, lectures, comprehensive question banks, official mock configurations and authenticated cross-device storage are not ready. Local notes can be lost if browser storage is cleared, so export backups. Browser visual QA was unavailable in this environment; responsive layout and accessibility still need device testing before release.

### Learning system and private sync

- `/courses`: eight source-linked original foundation units, worked examples, recall prompts and per-exam notes.
- `/syllabus`: independent cycle/stage paper references and syllabus outlines for all ten tracks, with unresolved fields visible.
- `/assessments`: 30 original non-PYQ questions across MCQ/MSQ/NAT/TITA, custom scoring, interruption recovery, explicit tab takeover and result explanations. No silent padding or official percentile claims.
- `/writing`: original descriptive/essay/conventional/interview prompts, word count, custom timer, local handwritten-image preview and an explicitly non-DEST typing drill.
- `/results`: new results, mistake concepts and recall queue. Earlier practice data remains under `/results/legacy` and `/review`.
- `/account`: independent validated backups and optional owner-only cloud sync. Cloud is disabled until configured. See [private setup](docs/PRIVATE_SETUP.md).

Content is a foundation pilot, not complete preparation for ten exams. Sources were checked and original numerical keys tested; independent human editorial review is not claimed. Old unreviewed drafts remain disabled in production. Read [content review and remaining gaps](docs/CONTENT_REVIEW.md) before enabling any official mock.

Public registration, private PDF cloud storage and full curricula remain incomplete. Never commit personal exports, reference uploads, credentials or a service-role key. Live RLS isolation, cross-device round trips and browser/device QA are mandatory deployment checks that local unit tests do not replace.

Validation commands: `npm test` (including embedded PostgreSQL RLS/conflict tests), `npm run typecheck`, `npm run build`, `npm run check:http` and `npm audit --omit=dev`. HTTP checks use deliberately fake provider configuration to verify deny paths; live owner sign-in and deployed RLS still require the setup checks.
