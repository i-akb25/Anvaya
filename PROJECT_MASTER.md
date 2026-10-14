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
