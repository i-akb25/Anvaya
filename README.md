# Anvaya

**Project source of truth:** [PROJECT_MASTER.md](./PROJECT_MASTER.md). Product, design, privacy, content integrity and release rules are documented there.

Anvaya is a local-first personal exam-preparation workspace. All ten exam paths connect available lessons, practice and private revision workflows; complete syllabus depth, independent editorial approval and authentic imported PYQs are not claimed. Accounts and tutor remain OFF by default.

## Current learner routes

| Route | Experience |
| --- | --- |
| `/classrooms`, `/classrooms/[exam]` | All exam paths with overview, paginated lessons, practice and source references |
| `/classrooms/[exam]/study` | Per-exam daily sessions, subject evidence and question mistake notebook |
| `/ssc-cgl/study` | Existing SSC study data and question diagnosis, with bounded section navigation |
| `/ssc-cgl` | SSC topic lessons, progress, four paper profiles and source status |
| `/ssc-cgl/dest` | Separately timed, saved original DEST practice and reports |
| `/ssc-cgl/sources` | Primary references, lecture checks and explicit review/key limitations |
| `/courses`, `/courses/[slug]` | Worked lessons, recall prompts, private notes and connected drills |
| `/lectures`, `/lectures/[id]` | Publisher-linked topics, consented players and saved watch notes |
| `/assessments`, `/results` | Frozen timed attempts, paged navigation/review, answers and explanations |
| `/today`, `/notebook`, `/search`, `/recall` | Plans, saved notes, opt-in private search and scheduled recall |
| `/library`, `/my-practice` | Private PDF storage and user-supplied question packs |
| `/account` | Validated local backups; optional cloud integration is disabled |

## Content and exam rules

See [all-exam release details](docs/ALL_EXAM_LEARNING.md) for exact per-exam counts and current limitations. Course and lecture libraries show six items per page; study notebooks show one question at a time.

The active platform contains **108 original AI-authored lessons and 685 questions**. Of these, **79 lessons and 562 MCQs** belong to the dedicated SSC path. New SSC content has author checks only. Source links do not imply independent review or an official answer key. Historical draft content remains separate from this active bank.

SSC original rehearsals support Tier-I (100 questions), Tier-II common objective (150), Statistics (100) and Finance/Economics (100 with 40 Accounts + 60 Economics/Governance). Timings and penalties follow the linked 2026 notice, with separate compensatory practice profiles; eligibility and live interface behaviour are not certified. Common-paper sections close on their timers; special papers have whole-paper navigation. DEST starts as a separate session. See [SSC details](docs/SSC_CGL.md).

The common bank supports two disjoint full attempts of either common-paper template when starting from an unseen bank. This does not create independently calibrated mock sets. Exhausted pools stop rather than repeat within a paper or silently reuse earlier questions. Reuse requires an explicit choice. No imported authentic PYQ bank, official percentile or exam-readiness prediction is published.

Released question banks are append-only. Versions v1–v5 validate previous saved snapshots; custom attempts use v6. Full SSC paper templates stay pinned to v5. Never edit a released key in place. Other exam tracks retain their own sources, cycles and incomplete coverage status.

## Local data and privacy

Study notes, attempts and DEST use `anvaya-learning-v1`; plans and paper notes use `anvaya-workspace-v1`. Existing legacy storage stays separate. Local data is not encrypted or server-isolated: use a trusted device and export backups. Do not commit private notes, paid material, credentials or personal documents.

Backups validate before replacement and preserve original timed-session deadlines. Revision checks reject stale-tab writes. The latest 30 objective results and ten DEST reports are retained; seen IDs persist separately. Private PDF bytes in IndexedDB need a separate file backup and are not contained in JSON backups. Failed writes surface an error and preserve previously stored records.

107 publisher links are listed across the platform. New SSC-supporting NIOS mathematics links were checked on publisher pages; full playback and spoken-language review are not claimed. External players require an explicit learner action. No downloaded classes or publisher affiliation are implied.

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

Live owner-account/provider verification, cross-device sync/file backups, complete canonical syllabus depth, authenticated permitted PYQs, independent expert content approval and comprehensive accessibility/device QA remain incomplete. These local prototype features do not satisfy those gates. Search indexing remains disabled.

The PostCSS override stays within the existing Next.js 15 stack. The previously observed development-only `braces`/ESLint advisory is still documented; a clean production-dependency audit is not a clean full-toolchain audit.

Support: akbsupportinfo@gmail.com

## Accuracy gate across all exams

All ten tracks are recorded in `lib/exam-coverage.ts` with authority, cycle, source URL, retrieval status and explicitly incomplete rule review. A failed retrieval is not labelled verified. Stages are reviewed separately; the three GATE papers remain distinct. No generic CAT/SSC paper is substituted for another exam.

The older generated-draft engine remains disabled in production. The current `/courses` and `/assessments` platform is separately available with explicit source/authorship labels and original practice, not official content approval.

## Historical implementation notes

The dated sections below describe earlier releases; current counts and routes are given above and in `docs/SSC_CGL.md`.

### Course-first classroom update

The workspace now has ten exam paths, subject sections, a responsive header/footer, an ink/paper/copper theme and a light/dark toggle. `/papers` links original GATE papers/keys and official UPSC/GATE archives. `/study/private` opens a user-selected local PDF alongside recall notes and a study timer. The PDF is not uploaded or retained after reload. `/planner` manages study sessions and exports/imports workspace backups with explicit replacement confirmation. Earlier practice backups remain separate.

This is a local workspace preview, not a complete learning service: reviewed hosted courses, comprehensive lecture coverage and question banks, official mock configurations and authenticated cross-device storage are not ready. Local notes can be lost if browser storage is cleared, so export backups. Browser visual QA was unavailable in this environment; responsive layout and accessibility still need device testing before release.

### Learning system and private sync

- `/courses`: 13 source-linked original foundation units, worked examples, recall prompts and per-exam notes.
- `/syllabus`: independent cycle/stage paper references and syllabus outlines for all ten tracks, with unresolved fields visible.
- `/assessments`: 45 original non-PYQ questions across MCQ/MSQ/NAT/TITA, custom scoring, interruption recovery, explicit tab takeover and result explanations. No silent padding or official percentile claims.
- `/writing`: original descriptive/essay/conventional/interview prompts, word count, custom timer, local handwritten-image preview and an explicitly non-DEST typing drill.
- `/results`: new results, mistake concepts and recall queue. Earlier practice data remains under `/results/legacy` and `/review`.
- `/account`: independent validated backups and optional owner-only cloud sync. Cloud is disabled until configured. See [private setup](docs/PRIVATE_SETUP.md).

Content is a foundation pilot, not complete preparation for ten exams. Sources were checked and original numerical keys tested; independent human editorial review is not claimed. Old unreviewed drafts remain disabled in production. Read [content review and remaining gaps](docs/CONTENT_REVIEW.md) before enabling any official mock.

Public registration, private PDF cloud storage and full curricula remain incomplete. Never commit personal exports, reference uploads, credentials or a service-role key. Live RLS isolation, cross-device round trips and browser/device QA are mandatory deployment checks that local unit tests do not replace.

Validation commands: `npm test` (including embedded PostgreSQL RLS/conflict tests), `npm run typecheck`, `npm run build`, `npm run check:http` and `npm audit --omit=dev`. HTTP checks use deliberately fake provider configuration to verify deny paths; live owner sign-in and deployed RLS still require the setup checks.

Personal-use default: `ANVAYA_CLOUD_ENABLED=false`. Supabase code stays available for later integration, but credentials alone never enable login or cloud sync. Local study and backup exports work without cloud configuration.

For current personal use: open Learn, save a note, choose Practice, submit and review under Results. Planner and the local PDF desk require no sign-in. Older `/practice`, `/practice/custom` and `/topics` URLs now reach the current study tools; the development-only draft preview remains gated.

### Foundation expansion and active recall

Five additional source-checked units cover rights/Directive Principles, ecosystem energy, simple interest, capacitor energy and RC transients. Each has three original questions. These are small foundation topics, not complete exam curricula. No independent human editorial review is claimed.

`/recall` turns completed exam/unit contexts into memory prompts: explain before revealing the reference and your saved note, then rate Again/Hard/Good to schedule a review in 1/3/7 local calendar days. Scratch answers are not saved or graded. Ratings and due dates are included in backups. Turn off Due only to revise early.

The v1 question-bank release remains available to validate old saved results and unfinished attempts. New attempts use v2. Seen IDs persist per exam beyond the latest 30 detailed results; older IDs already discarded before this update cannot be reconstructed. Existing backups remain accepted. Supabase stays disabled by default.

### Topic-wise lectures · 15 October 2026

The lecture directory at `/lectures` contains 100 distinct publisher links: 85 individual lecture links, four publisher collections and 11 NPTEL course pages. It offers 71 populated topic selections across ten exam paths, and four explicitly unfilled topic areas. These counts do not certify complete subject or exam coverage. Every current foundation lesson links to a matching lecture topic; syllabus outline sections link to curated selections without changing their review status.

NIOS subject tables, MIT OCW resource/collection pages and NPTEL course metadata were opened. Khan Academy and Drishti IAS English titles were checked against publisher-indexed search listings; their page rendering was limited. Metadata checks are disclosed separately from playback and full editorial review. NIOS/NPTEL spoken language remains unconfirmed. Some historical school lessons are partial selections, and economics examples are not current policy. No full video playback review is claimed.

Lecture pages include an ordered resource outline, exam-specific notes, a manually entered resume position, self-reported watch status, and save/next navigation. These optional fields use existing revision-conflict protection and local backups, accepting older backups. Watching a lecture does not mark a lesson complete or infer mastery. Known YouTube videos load only after an explicit click into a privacy-enhanced player; publisher links remain available if playback fails. No provider keys, account, scraping service or Supabase enablement are required.

### Connected personal study · 16 October 2026

Added `/today`, `/search`, `/notebook` and `/my-practice`. The daily desk surfaces saved plans, pending reviews, unfinished attempts and lecture resumes. Search combines public learning metadata with opt-in browser-local private notes/plans/writing/packs; private query text is not put in URLs. The notebook shares exam/topic note keys with foundation lessons and supports manual review scheduling for all listed topics.

The personal question desk supports authored/imported MCQ, exact-set MSQ and numeric-range packs, local review acknowledgment, bounded imports, custom timed practice, deterministic scoring, frozen snapshots, original-deadline recovery and retained personal results. These supplied keys remain unverified and never enable official mock/PYQ claims. Packs/results stay in the local vault and its explicit backups; cloud remains OFF by default. Planner writes now reject stale task snapshots while preserving concurrent paper edits. See `docs/PERSONAL_STUDY.md` for limits and remaining gates.

## Learning release update · 16 October 2026

22 source-linked foundation lessons and81 distinct original questions are now connected to study/recall, preserving immutable earlier question banks. New routes: `/mocks` (custom sectional practice), `/library` (persistent private PDFs), `/current-affairs` (dated selections, publisher RSS metadata and private review journal), `/content-review` (local pack preflight), `/coverage` (ten-track inventory) and `/tutor` (optional, owner-authenticated Gemini integration with SQL-backed quotas). Supabase and AI remain OFF by default.

This is not complete ten-exam content: full syllabus transcription, independent editorial review, authentic permitted PYQs and official full mocks remain gated. Live provider setup and physical-device/accessibility verification remain pending. See [learning release details](docs/LEARNING_RELEASE.md).


## SSC CGL study release · 17 October 2026

`/ssc-cgl` now connects 44 new condensed lessons and 200 original MCQs to notes, recall, search and topic drills. Tier-I (100 questions) and Tier-II common objective (150 questions) original rehearsals use distinct 2026 timing/marking profiles, preserve frozen recovery and show the merit/qualifying split. `/ssc-cgl/dest` provides a separately timed persistent typing session and bounded reports. The active platform bank now has 66 lessons / 281 questions, preserving earlier bank versions.

This is not complete SSC editorial coverage: advanced depth, permitted authentic PYQs/final keys, curated SSC videos and independent review remain pending. Statistics/Finance each have 16 questions; their full 100-question papers remain unavailable. Accounts and tutor remain OFF. See [SSC release and remaining gates](docs/SSC_CGL.md).

### SSC daily study and mistakes

Open `/ssc-cgl/study` for a budgeted next session, subject progress evidence and a question-level correction notebook. Save mistake reasons, notes, manual resolutions or private key doubts; retry 1–20 selected unresolved questions with one minute each and +2/−0.50 custom scoring. Doubt-flagged questions are excluded until cleared. Settings and notes stay local and are included in validated JSON backups. Result feedback links directly to the relevant notebook question. See [SSC release details](docs/SSC_CGL.md) for storage, review and provenance limits.
