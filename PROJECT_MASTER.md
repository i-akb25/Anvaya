# ANVAYA · Master Project Charter
Last updated: 2026-10-14
Status: Binding product direction; not a claim that all features exist.

## Mission and ownership
Anvaya is the user's single, reliable exam-preparation workspace, built for personal use first and engineered for eventual multi-user publication. Repository: https://github.com/i-akb25/Anvaya . Main support contact: akbsupportinfo@gmail.com. Existing public GitHub code is not a public license to expose personal notes or study history.

The owner expects implementation decisions, prioritization, and routine quality checks to be made autonomously in each active development session, without repeated phase-by-phase approvals. Do not claim unattended/background development. Push and verify changes through connected GitHub where possible. Never add Codex or an AI account as a contributor, co-author, or attribution footer. Do not misrepresent commit authorship.

## Exam coverage
- UPSC Civil Services CSE (including prelims/mains as independently versioned stages).
- BPSC Combined Competitive Examination (including Bihar-specific GS and prelims/mains).
- SSC CGL.
- SBI PO and IBPS PO / banking.
- CAT.
- UPSC Engineering Services ESE (Electrical).
- GATE Electrical Engineering **EE**, Electronics and Communication **EC**, and Instrumentation Engineering **IN** as *three separate papers* with their own syllabi, subjects, patterns, PYQs and tests.
Shared topic nodes can map to any combination of exams, but coverage/depth and progress remain exam-specific.

## Product experience
A coherent loop: Discover → Learn → Practice → Evaluate → Revise → Improve.
1. Exam hub with real year/stage-specific official syllabus, pattern, notices, dates and source timestamps.
2. Topic graph and universal search across notes, short notes, video links/playlists, PYQs, tests, reference material, current affairs and prior mistakes.
3. Topic-based study pages, detailed explanations, quick revision, flashcards, formula sheets and verified citation/source references.
4. Lecture directory: YouTube and third-party publishers (e.g. Physics Wallah and MADE EASY); links or permitted embeds and live stream discovery when authorized. Redirects are fine. No false affiliation, unauthorized downloading, copying of paid material or bypassing paywalls.
5. Proper CBT engine: real-pattern practice per paper version, mock tests, PYQ papers, subject/section/topic tests, custom test builder, timed sections, question palette, review marks, autosave and recoverable attempts. Deterministic scoring with question-type-specific rules (single choice, multiple select, numerical answer, descriptive where applicable). Practice interface must not imply the real examination itself is computer-based.
6. Evidence-led analytics: score, accuracy, speed, marks lost, topics, weakness trends, mistake notebook and revision queue. Separate demo, estimated and official-pattern attempts.
7. Daily exam-targeted current affairs and news source links, PIB and appropriate regional/Bihar coverage. Dated retrieval, source provenance and original concise summaries. Do not mirror copyrighted newspapers or paywalled articles.
8. AI tutor as an optional, securely server-mediated provider integration: doubts, question explanations, learning from authorized sources, descriptive-answer feedback and practice suggestions. Cite evidence, flag uncertainty, protect user data, cap costs and rate-limit; AI must not compute official/objective test scores.
9. Planner, deadlines and study logs; document library, annotations, exports, offline authorized materials and backup/restore.
10. Minimal owner-only admin panel when genuinely needed for ingestion, validation, content edits, feeds, errors, security and maintenance, inaccessible to ordinary users.

## Design
- Calm, human-designed, polished and readable; subtle claymorphism is acceptable, not an obligation.
- Warm off-white, quiet earth/green accents; no neon, cyberpunk, AI-generated-looking layouts, unnecessary animations, glassmorphism or distracting 3D.
- Genuine Anvaya icon/wordmark assets; maintain a coherent visual system, accessible contrast, clear typography, visible focus and reduced-motion support.
- Excellent responsive behavior on Android/iOS mobile, tablets, Windows/Linux desktops and macOS; usable even when user's laptop is inaccessible.
- Prefer fast interactions and reliable content over visual spectacle. English-first with Hindi-ready internationalization and exam-specific language rules.

## Data/security/reliability invariants
- Personal-first, with registrations disabled until secure multi-user readiness. Each private record is owned by a user; separate public reference content from private content from schema day one.
- Server-side authorization for **every** sensitive operation, RLS where supported, encrypted transport, short-lived authorized file access, strict input validation, upload type/size limits, secure cookies, least privilege, rate limits and audit of administrative changes.
- Never place provider tokens in client bundles or commit secrets, purchased PDFs or personal notes. Environment variables only server-side as appropriate. Public repository != public study data.
- Persist authenticated data cross-device with independent backups, tested restores and portable exports before describing the system as reliable. Browser localStorage may be a temporary demo only and must be labeled as such.
- Offline mode only for authorized cached materials; never promise offline third-party video files. Sync conflict handling and data-loss testing required.
- External feeds/APIs must follow their license, robots/terms, caching limits and attribution rules.
- Optional features degrade gracefully when providers are down; no silent failures or silent fabrication of data.
- No public launch until tests pass for cross-user isolation, scoring, auth, security, accessibility, backup/restore and production build.

## Integrity of educational material
- Never call a sample an authentic PYQ. Store question origin, exam, paper, year, shift, language, source and answer-key provenance; mark unverified content explicitly.
- Official syllabi and exam patterns must reference the original issuing authority, target cycle, retrieval/verification time, and an immutable version used by each test.
- Do not infer exact marks/duration/questions/dates based on outdated patterns. Date changes should appear as notices, never made-up countdowns.
- AI explanations and mock predictions should never be presented as official solutions.

## Architecture direction
Next.js + TypeScript responsive app/PWA, separate data services for exam registry, source ingestion, assessment, analytics and AI. PostgreSQL for structured user/reference data, private object storage for personal uploads, controlled offline cache for authorized content. Provider choices and free-tier constraints must be verified before implementation; avoid vendor lock-in where practical. Schema includes users, exams, exam_cycles, exam_stages, pattern_versions, syllabus_versions, subjects, topics, exam_topic_links, resources, questions, answer_keys, tests, attempts, attempt_answers, progress, revision_items, notes, material_files, deadlines and ingest_reviews.

## Delivery standards
Work to completion **within each active session**, push changes and check build/tests when tools allow. Make reasonable design/security choices without burdening the owner with everyday decisions, but do not invent credentials, infrastructure, legal licenses or test results. Distinguish implemented / verified / pending. Prefer cohesive tested vertical slices over an impressive nonfunctional interface. No status claims until checks are observed.

## Current reality at charter creation
- GitHub repo exists and basic responsive Next.js study home, exam listing, preliminary subject discovery, source search links and original Anvaya SVG mark are pushed.
- A six-question **illustrative** CBT demonstration and a separate custom practice route have been pushed, with client-side timer, answer navigation, mark-for-review, localStorage attempt history, export and deterministic scoring.
- A CI workflow is configured. A successful run, production deploy, authenticated cloud persistence, official question bank, complete syllabi, verified pattern engine, admin panel, offline sync, lecture ingest, daily current affairs and AI tutor have **not** been established by this charter.
- Immediate next release gate: verify CI/build and scoring, then secure authentication/storage + authoritative exam/pattern registry + versioned question bank before promoting any 'official' mock.

## Continuity rule
This document is the durable repository reference for future Anvaya work. Keep it synchronized when scope is explicitly revised and do not silently weaken the security, authenticity, device-support or visual rules.

## Implemented follow-up · 2026-10-14
- The shared branding/asset pack and responsive practice improvements from PR #1 are merged.
- `/practice` now supports versioned illustrative attempts, exam-context labels, answer/review/navigation autosave, explicit resume/discard, original-deadline recovery, and a memory-only fallback. A session resumed after expiry is submitted, not given a new timer. Conflicting-tab writes are rejected once a different tab claims the saved session.
- `/review` provides per-context topic observations, attempt summaries, a historical mistake notebook and a self-reviewed revision queue. GATE EE/EC/IN contexts remain separate. Small samples and illustrative content are labelled; analytics do not estimate examination performance.
- Backups include unfinished sessions and review acknowledgements; v1 exports remain importable. Corrupt data is surfaced, raw recovery export is available, and a failed workspace write preserves the previous stored record.
- The official GATE 2027 portal and syllabus directory were checked on 2026-10-14. EE/EC/IN have separately linked syllabus PDFs with dated source records. This is a link registry, not an imported, versioned official syllabus/pattern engine. The undated BPSC postponement claim was removed.
- These additions remain a temporary browser-local demonstration, with no authentication or multi-user storage. The existing secure-persistence, official-material, accessibility and launch gates remain in force. No provider account, private document storage, AI tutor, admin panel or offline sync is implied by this update.

## Corrected learning direction · 2026-10-14
The experience must teach concepts and implement paper-specific assessment behaviour. Exam-specific practice requires its own timing, question selection and marking configuration.

- The new study desk and learning paths replace the former homepage directory. Thirteen original foundation lessons include conceptual teaching, worked steps, a common trap, an interactive checkpoint, revision prompts, optional lecture searches and browser-private notes.
- The released original bank contains 146 distinct foundation questions: 24 VARC, 22 DILR, 25 QA, 25 reasoning, 25 general awareness and 25 English. Reading passages and logical sets have shared context. Numeric QA has a separate MCQ representation for SSC; the correct answer and penalty use the paper’s actual representation.
- CAT rehearsal:68 questions,24/22/22,120 minutes, fixed VARC→DILR→QA,40 minutes per section, no access to previous/upcoming sections, automatic transitions, MCQ +3/−1 and numeric entry +3/0. This is the requested rehearsal blueprint. The historical official 2024 navigation guide is linked as a reference, not represented as independently verified CAT 2026 notification data. Future counts must not be claimed as guaranteed. The content is foundation-level original practice, not PYQs or a difficulty-calibrated CAT mock.
- SSC CGL 2026 Tier-I rehearsal:100 MCQs, 25 per subject,60 minutes,15-minute subject timers,+2/−0.5, sourced to the official notice §13.8 checked 2026-10-14. The rehearsal follows the table’s subject order without claiming this is the live interface’s fixed order. Tier-II, DEST and accommodation timings are not implemented.
- Unseen-question selection is the default. Exhaustion produces an explicit message; repeats require a deliberate revision choice. Only one original full paper’s worth of content per blueprint is available in this release; shuffling is not called a new mock paper.
- `/practice/custom` and `/review` preserve legacy demo data. The new study store, results and portable backups cover lessons, notes, unseen tracking and new sectional attempts. No old store is deleted or silently reinterpreted.
- UI visual QA remains pending where supported browser tooling is unavailable. Authentication, encrypted/private server storage, complete syllabi, expert question moderation, calibrated difficulty, full-length papers for other tracks and launch/security gates remain outstanding. No claim of a complete platform is warranted.

Content integrity: The learning/question material above is AI-generated draft content with unreviewed answer keys, explicitly labelled in metadata and learner screens. Automated numerical checks do not replace editorial review. These UI/prototype additions do not satisfy R1 authentication, server isolation, cross-device storage, canonical mappings or search, and do not pass a production release gate.

## Accuracy and full scope clarification · 2026-10-15
All locked examinations remain in scope, with separate cycle/stage rules and GATE papers. Unreviewed generated material is not accepted as usable learning merely because it has a disclaimer. The prototype lessons, generated banks and generic legacy practice are disabled in production; they are available only in an explicit local development preview. `lib/exam-coverage.ts` records the source-review state for all tracks. Unavailable material and failed source retrievals are stated explicitly. The full learning platform is still incomplete; adding a source-review screen does not satisfy it.

### Latest design and product direction · 14 October 2026
- Replace the earlier sage/clay design lock with ink/paper/copper, light/dark themes, global navigation, responsive mobile menu and full footer.
- Course-first learning navigation inspired by PW/Drishti; restrained visual cues from AKB Studio. Original assets and interface only.
- Deliver useful local study tools and authentic publisher links without fabricating course availability, question counts, keys, teachers or results.
- Official paper library, private PDF/recall desk and session planner are workspace-preview features. Secure accounts and reviewed hosted learning remain incomplete release gates.

### Learning-system implementation · 15 October 2026
- The supplied exam master reference is a research baseline, not a certified dataset. Preserve unresolved rules; include SSC's post-specific Finance & Economics paper from the primary notice.
- Eight source-checked original foundation units / 30 original practice questions are explicitly AI-authored, non-PYQ and not independently human-reviewed. The old unreviewed draft gate remains intact. Source checking does not authorize official mock claims.
- Private Supabase account/sync implementation is owner-only and fails closed without configuration. Apply RLS migration, disable public signup and perform live two-user isolation/conflict checks before relying on cloud storage.
- All ten complete curricula and full verified mock sets remain incomplete; never report the project complete because its framework builds.

### Personal-use decision · 15 October 2026
Keep the Supabase integration for later, disabled by default. Require explicit `ANVAYA_CLOUD_ENABLED=true` plus complete server configuration before any cloud authentication or sync. Prioritize local study and user-controlled file backups for current personal use.

### Foundation content and active recall · 15 October 2026
Five new primary-source-checked units extend the catalog to 13 units and 45 original non-PYQ questions. Rights/Directive Principles and ecosystem energy introduce small GS foundations; simple interest and capacitor/RC lessons extend aptitude and engineering practice. Independent human editorial review and full curriculum coverage remain pending.

Completed exam/unit contexts now support active recall at `/recall`: explain before reveal, compare concepts/worked steps and personal notes, then self-rate with disclosed fixed intervals of 1/3/7 local calendar days. Scratch explanations are unsaved and ungraded; ratings and schedules are backed up. No mastery or exam-readiness claim is inferred. Versioned v1 snapshots remain valid alongside the expanded v2 bank. Per-exam seen IDs persist beyond the latest 30 detailed results; previously discarded history cannot be recovered. Cloud remains disabled by default.

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
