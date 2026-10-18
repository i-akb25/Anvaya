# Anvaya | Product Requirements Document (PRD)
**Version:** 1.0 · **Date:** 14 October 2026 · **Status:** Approved project direction, implementation not complete  
**Project:** [i-akb25/Anvaya](https://github.com/i-akb25/Anvaya)  
**Support:** akbsupportinfo@gmail.com  
**Authority:** [PROJECT_MASTER.md](./PROJECT_MASTER.md) governs product principles. If an implementation proposal conflicts with the charter, resolve the conflict explicitly before release.

## 1. Executive summary
Anvaya is a private-first, mobile-first, multi-exam preparation workspace that unifies official syllabus mapping, topic-based study, external lectures, user notes, authentic previous-year questions (PYQs), customizable computer-based-test-style (CBT) practice, deterministic evaluation, analytics, revision, daily current affairs and optional source-grounded AI tutoring. Initially serve one owner across devices; later expand into a secure multi-user product without redesigning its data isolation model.

**Core promise:** Every topic becomes a connected learning unit spanning exam requirements, trustworthy content, practice, feedback and revision.

**Learning loop:** Discover → Learn → Practice → Evaluate → Revise → Improve.

## 2. Problem and target users
### Primary persona
An individual preparing simultaneously for civil services, recruitment, engineering and aptitude examinations, using mobile/tablet/desktop after losing access to a primary laptop. Materials, study logs and scores currently reside in scattered websites, files and browsers.

### Future persona
An independent aspirant with a different subset of exams, language needs, priorities and study rhythm. Their data must never mix with another user's data.

### Problems to solve
- Repetition and confusion when the same subject appears in multiple exam syllabi.
- Difficulty locating usable notes, videos, playlists and PYQs for a particular topic.
- Fragmented mock-test history and little actionable feedback.
- Outdated or inaccurate exam patterns and unverified questions.
- Lack of portable, recoverable preparation data across devices.

## 3. Outcomes, success metrics and non-goals
### Success criteria (first private release)
- Owner can sign in on phone and another device, find a mapped exam topic, save/edit a note and retrieve the same note securely.
- A verified question set can be launched with a versioned scoring scheme, resumed after interruption and evaluated reproducibly.
- Authentic question provenance and official pattern version are visible; unverified examples cannot be mislabeled.
- Data can be exported, restored and independently backed up.
- Owner can locate official notices and source-linked third-party videos without manual navigation through multiple sites.

### Measurement (targets, not existing results)
- 100% automated pass of authorized-user and cross-user isolation tests before public account creation.
- 100% reproducible objective scoring on the versioned regression fixture set.
- 0 known high/critical security findings at production gate.
- Responsive usability verified at 320, 375, 768, 1024, 1440 CSS px and keyboard-only navigation.
- No silent loss of completed tests during tested network interruption/retry and restore scenarios.
- Track weekly active study days, completed topic sessions, question attempts, export/restore success and content verification coverage without leaking notes or question responses to telemetry.

### Out of scope
- Rehosting paid classes, proprietary question banks, pirated books or copyrighted newspaper PDFs.
- Inventing official dates, rank predictions, exact patterns or answer keys.
- Full video download/offline access without authorization.
- Social feed, gamified engagement loops, ads or public leaderboard in private-first release.
- Claims of fully automated mains grading equivalent to an official evaluator.

## 4. Exam and syllabus coverage
| Track | Required separation |
| --- | --- |
| UPSC CSE | Prelims GS/CSAT, Mains papers, versioned cycles |
| BPSC CCE | Prelims/Mains, Bihar-specific GS, notices and cycles |
| SSC CGL | Tier, section, shift and applicable cycle |
| SBI PO | Prelims/Mains and their distinct scoring rules |
| IBPS PO | Prelims/Mains and their distinct scoring rules |
| CAT | VARC/DILR/QA, appropriate paper/cycle |
| UPSC ESE Electrical | Stage and paper-specific subjects |
| GATE EE | Its own official syllabus, GA, engineering maths and technical sections |
| GATE EC | Its own official syllabus, GA, engineering maths and technical sections |
| GATE IN | Its own official syllabus, GA, engineering maths and technical sections |

Exam configuration **must** use official source URL, publisher, exam year/cycle, paper/stage, effective date, checked-at date, language, duration, marks and special instructions, with distinct immutable versions. When verification is missing, display “unverified / custom practice” instead of “official simulation.” Syllabus links are not a substitute for a parsed, reviewed complete syllabus.

## 5. Product information architecture
Main navigation:
1. **Today:** upcoming deadlines, assigned study, resume, current affairs, recent performance.
2. **Exams:** exam tracks, official patterns, complete syllabi, stage/cycle notices.
3. **Topics:** universal search; one canonical topic with exam-specific depth and mappings.
4. **Learn:** notes, short notes, formulas, diagrams, legal video links/embeds, playlists, documents.
5. **Practice:** PYQ papers, mocks, topic/section tests, custom test builder, CBT.
6. **Review:** reports, mistakes, spaced-repetition queue, revision cards.
7. **Library:** permitted source links, uploaded private materials, annotations, exports.
8. **Settings:** private account, language, backups, notifications and privacy controls.
Admin area only for owner/authorized editors; separate from public user routes.

### Topic landing page acceptance example
Search “Fundamental Rights” → show topic outline, relevant UPSC/BPSC/SSC mappings, verified detailed notes, quick notes, authorized lectures/playlists, authentic PYQs, practice builder, notes, progress and AI questions. Each result indicates source and verification status. Search should support aliases and Indian terminology.

## 6. Functional requirements
Priority: **P0** mandatory for first reliable private release; **P1** core product; **P2** enhancement.

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR-01 | P0 | Private authentication | Disabled self-registration; secure login/logout; expired sessions deny access |
| FR-02 | P0 | Tenant separation | All personal records/files have owner; server-side checks and negative tests prevent cross-user reads/writes |
| FR-03 | P0 | Official exam registry | Versioned official source records; prominently show missing/unverified fields |
| FR-04 | P0 | Canonical topic graph | Same topic may map to many exams, maintaining different depth and progress per exam |
| FR-05 | P0 | Search and filters | Query by exam, subject, topic and aliases; source type, relevance and verified status |
| FR-06 | P0 | Persistent notes and uploads | Private documents with validated file size/type, secure access, sync and export |
| FR-07 | P0 | Immutable question provenance | Track author/source, paper, stage, year, shift, type, language, answer-key status and revision |
| FR-08 | P0 | Deterministic test engine | Versioned scoring; objective answer comparison without AI; verified negative marking logic |
| FR-09 | P0 | Recoverable tests | Save responses, marked-for-review, question index and original deadline; recover without granting extra time |
| FR-10 | P0 | Detailed result report | Correct/incorrect/skipped, scores, marks lost, time, explanation, question/topic breakdown |
| FR-11 | P0 | Export and backup | Validated export, secure independent backup, tested restoration and conflict handling |
| FR-12 | P0 | Responsive accessibility | All core tasks usable on mobile, tablet and desktop; keyboard and reduced-motion support |
| FR-13 | P1 | Custom tests | Select exam, topics, difficulty, count, timer, question formats and marking with clear “custom” label |
| FR-14 | P1 | Official-pattern simulations | Match verified exam-cycle configuration; seal version per attempt |
| FR-15 | P1 | Authentic PYQ practice | Filter year/paper/topic; show original source and answer-key corrections |
| FR-16 | P1 | Lecture discovery | External links/authorized embeds; deduplication, broken-link handling, playlist ordering |
| FR-17 | P1 | News and daily current affairs | Date/source, exam-wise relevance, summaries, source links and corrected/updated status |
| FR-18 | P1 | Adaptive revision | Weak-topic reminders, flashcards, mistake notebook and spaced repetition |
| FR-19 | P1 | Study planning | Daily/weekly goals based on available time, exam priorities and progress |
| FR-20 | P1 | Owner admin tools | Authenticated source moderation, ingestion review, question/version editor and maintenance logs |
| FR-21 | P1 | Offline authorized packs | Notes/selected questions cached by explicit user choice; queued sync and resolution of conflicts |
| FR-22 | P2 | AI tutor | Server-only provider keys, source citations, prompt-injection defense, budget/rate caps, opt-in context |
| FR-23 | P2 | Descriptive practice | Answer submission, rubrics, human-overridable AI feedback marked non-official |
| FR-24 | P2 | Notifications | User-controlled official notice, deadline and revision alerts with evidence and timestamps |
| FR-25 | P2 | Public onboarding | Registration, storage limits, multi-user quotas, account deletion and policy workflows |

## 7. CBT requirements in detail
### Test modes
- Real-cycle simulation; official PYQ paper; full syllabus mock; subject, topic and mixed-topic; custom practice.
- Question types: single correct MCQ, multiple select, numerical answer, paragraph/data interpretation and descriptive where supported. Scoring rubric differs per type.
- Exam configuration records maximum questions, sections, marks, penalty rules, language, time, navigation constraints and allowed calculators where applicable.

### Test state lifecycle
Draft → In progress → Suspended/interrupted → Submitted/Expired → Evaluated → Reviewed. Attempts are tied to a frozen question-bank and pattern version. Resuming retains the original deadline. Duplicate submissions are idempotent. Multiple tabs cannot overwrite a newer attempt silently.

### Report
Total marks, attempted/unattempted, correct/incorrect, accuracy, time/question, topic summary, missed questions, correction/explanation, knowledge-vs-speed analysis and historical progress. Never publish percentile, AIR or prediction without defensible cohort and methodology.

## 8. Content acquisition and provenance
- Official issuing authority is the source of truth for exam notifications and syllabus/patterns.
- Use permitted third-party links or embeds from YouTube, Physics Wallah, MADE EASY and others; no implication of partnership.
- NCERT, authorized open educational resources and personal notes are classified by license and allowed use; private access does not authorize redistribution.
- News: curated citations/links, allowed snippets, independent concise summaries, daily topic mapping. Do not reproduce entire protected articles.
- Ingestion pipeline: discover → capture metadata → deduplicate → review license → map topic/exam → verify → publish → periodic recrawl/recheck → revoke or archive.
- Each record has source URL, provider, retrieved-at, last-verified-at, content kind, license status, verification status, source version and content hash where appropriate.
- Paid/restricted resource URLs may be displayed as external redirects, not downloaded or proxied.

## 9. AI tutor behavior
- Retrieval from allowlisted authoritative sources and user-selected documents with explicit user permission.
- Answers explain their basis, link citations and say when verified evidence is missing.
- Test objective scoring remains deterministic; generated questions are labelled “AI-generated” until reviewed.
- No transfer of private notes/resumes/documents to providers without a clear user-triggered request and disclosure.
- Privacy-safe request logging, per-user quotas, server-side secrets, abuse prevention and graceful no-AI fallback.
- Cost controls: request ceiling, token limits, caching of non-sensitive shared responses, and explicit opt-in for paid model usage.

## 10. Data architecture
Recommended entities:
`users`, `user_preferences`, `exams`, `exam_cycles`, `exam_stages`, `exam_pattern_versions`, `syllabus_versions`, `subjects`, `topics`, `topic_aliases`, `exam_topic_links`, `resources`, `resource_sources`, `questions`, `question_versions`, `answer_keys`, `test_templates`, `test_versions`, `attempts`, `attempt_answers`, `notes`, `user_materials`, `study_sessions`, `topic_progress`, `revision_queue`, `deadlines`, `ingestion_jobs`, `review_events`, `audit_events`.

Reference/public materials separated from private per-user records and private object-storage paths. Database-level RLS plus server checks, not just filtered browser queries. Never put API or storage admin keys into client bundles.

## 11. UX/design specification
**Identity:** Anvaya, connected preparation without noise. Existing original wordmark, SVG icon and study-desk illustration are baseline assets, not stock or AI-generated art.  
**Visual:** muted sage/earth, cream/off-white, restrained soft-clay elevation, generous whitespace, clear typographic hierarchy, minimal decorative motion. No neon, glassmorphism, cyberpunk, center-card walls, heavy effects or attention-hijacking streaks.  
**Accessibility:** WCAG 2.2 AA target, visible focus, semantically structured pages, screen-reader announcements for CBT states, labeled form controls, keyboard navigation and reduced motion.  
**Responsive:** 320–1440+ CSS px, Android, iOS, tablet, Windows, macOS. Exam timer, question palette and save status persist visibly without obscuring answers. English-first, Hindi-ready with source-dependent exam language labels.

## 12. Non-functional requirements
- **Security:** server-side authZ, secure session cookies, RLS, CSRF protection as applicable, rate limits, validation, safe uploads, admin auditing, no public blobs, OWASP review.
- **Reliability:** autosave, idempotency, network interruption recovery, conflict handling, explicit offline status, restoration drills and bounded retries.
- **Privacy:** no ads or third-party tracking of private content; no unnecessary PII; user-controlled deletion/export; redact sensitive logs.
- **Performance:** optimize mobile load, avoid unnecessary JS, paginate large question lists, cache public material without leaking private material.
- **Operability:** health checks, alerts, data migrations, feature flags, provider timeout handling, maintenance and rollback documentation.
- **Cost:** use economical services with measured storage/AI/feed budgets; no assumption that free plans offer indefinite uptime/storage.

## 13. Release sequence and dependencies
### R0: Stabilize existing repository
Typecheck, tests, build, inspect CI, repair high-priority bugs. Browser visual audit and accessibility baseline. Classify current demo accurately.

### R1: Reliable private workspace (minimum usable product)
Secure owner authentication and cloud storage; official registry, canonical topic mappings; notes and personal files; basic search; dependable backup/export; authenticated cross-device retrieval.

### R2: Authentic exam practice
Question/version ingestion, reviewed answer keys and PYQ metadata, pattern-version records, full CBT lifecycle and scoring tests, completed-attempt sync/report, trustworthy custom test builder.

### R3: Learning ecosystem
Topic pages, curated lectures/playlists, summaries, source quality/availability checks, original study resources and offline authorized packs.

### R4: Daily study intelligence
Current affairs ingest and moderation, exam-topic linkage, official notifications, study/revision plans and adaptive analytics.

### R5: Optional AI assistance
Cited doubts, answer review, controlled spend/privacy guardrails, red-team testing and no-AI fallback.

### R6: Public-readiness gate
User self-service auth/onboarding, tenant load/security tests, data-rights workflows, licensing review, operations playbook and observed backups/restore.

Milestones are dependency gates, not promises of autonomous/background execution. Implement and push during active connected development sessions; publish only after verification.

## 14. Release acceptance test matrix
1. **Isolation:** Two test users each create data; cross-account URL/API/object access denied.
2. **Persistence:** Create note on mobile-sized viewport, sign out, access securely on second device.
3. **Test integrity:** Force refresh, tab conflict, network failure and expiry; no erased answers, duplicate results or reset timer.
4. **Scoring:** Reference fixtures cover single, multiple, numeric, negative-marked and unattempted answers for configured patterns.
5. **Provenance:** Unverified question cannot masquerade as PYQ; old attempt retains historical answer key and pattern.
6. **Rights:** Illegal/unlicensed content cannot enter public library via the ingest workflow.
7. **Backups:** Export and restore on clean account/environment with integrity checks and documented recovery process.
8. **Accessibility:** Keyboard operation, timer announcement, responsive layouts, contrast and reduced motion.
9. **Security:** Secret scan, dependency audit, request validation, permissions matrix and admin route protection.
10. **Operational:** Build, tests, deployment, rollback, source refresh and provider-outage behavior observed.

**Go/No-Go:** Any failing P0 privacy, integrity, scoring, recovery or authentication test blocks public deployment.

## 15. Risks and mitigations
| Risk | Mitigation |
| --- | --- |
| Incorrect/outdated official exam pattern | Dated source, review gate, versioned immutable patterns |
| Fabricated PYQs or answer keys | Mandatory provenance and editorial verification |
| Publisher licensing/API limitations | Redirect to publisher; permitted embeds; no prohibited copying |
| Personal data loss | Independent backups, restore drills, explicit offline/local warnings |
| Leaked data in public GitHub or client | Secrets scanning, private object storage, server authZ and RLS |
| API/AI cost overrun | Server budget limits, quotas and fallback |
| Multiple-exam complexity | Normalized topic graph with stage-specific content and progress |
| Weak mobile usability | Touch/keyboard QA and small viewport regression tests |
| Source becoming unavailable | Broken-link detection, source refresh, replacements with clear provenance |

## 16. Current implementation baseline (14 Oct 2026)
From the repository charter and README, already pushed: basic responsive app and branding, preliminary ten-track directory (including distinct GATE EE/EC/IN), subject discovery, source redirect/search links, illustrative six-question CBT, recoverable practice sessions, local browser history/exports, /review analytics and review acknowledgements, and some linked GATE 2027 source references. These are not a complete official syllabus or authentic exam content.

**Still absent or unverified:** secured cloud auth and storage, complete validated syllabus catalog, real sourced PYQ bank, exam-pattern-backed mocks, automatic daily current affairs, AI tutor, full admin workflow, offline synchronization, public readiness and independent verified production deployment. Existing README and charter may describe different snapshots; implementation status must be rechecked against the latest source and CI before each release.

## 17. Decisions and change management
- Brand is **Anvaya**. Domain selection remains open; do not treat suggestions as confirmed availability.
- User is not required to micromanage phases. Technical choices are delegated within security, cost and charter limits; only irreversible external actions, paid commitments or permission changes require owner approval where needed.
- Keep this PRD and PROJECT_MASTER.md aligned. Update the PRD version and change log when product requirements change.
- The repository remains public code; the app is private-first; no Codex/AI attribution as contributor.
- Contact: **akbsupportinfo@gmail.com**.

### Change log
| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-14 | Initial consolidated PRD from Anvaya master charter and repository documentation |

## Design revision · 14 October 2026

The latest user direction replaces the previous sage/cream/clay visual lock. Use an original ink, paper and copper identity with light and dark themes, a global responsive header, mobile navigation and a full footer. AKB Studio informs visual restraint; PW and Drishti inform course-first learning navigation. Do not copy their paid materials, identities or marketing claims.

The current classroom exposes ten distinct exam paths, subject planning categories, an official-paper link library, a local PDF reading/recall desk and a local study planner. Subject categories are not a verified complete syllabus. A publisher archive link is not an imported question bank. Files chosen in the PDF desk remain local and must be reattached after reload. Plans and notebooks have an explicit backup/replace workflow, separate from the earlier practice backup.

Reviewed hosted courses, video instruction, complete verified PYQ banks, exam-cycle test rules and secure cross-device accounts remain release requirements. Keep unreviewed generated lessons/questions out of production. Do not claim this workspace preview completes R1 or makes the learner product ready for public registration.

## Learning-system implementation · 15 October 2026

The supplied exam-pattern reference is now represented as independent versioned paper definitions and a stage/cycle syllabus outline for all ten tracks. Missing figures, timings, instructions, permissions and keys stay unresolved. SSC Finance & Economics Paper III is retained separately because the primary 2026 notification includes it.

The initial usable foundation catalog contains eight original, source-checked study units and 30 original calculation/source-checked practice questions. AI authorship and the lack of independent human editorial review are disclosed. This limited review level permits foundation study only; it is not official-pattern verification or PYQ provenance. Existing unreviewed draft banks remain disabled in production. Comprehensive verified curriculum and authentic imported question coverage are still release gates.

New flows include MCQ/MSQ/NAT/TITA custom practice, immutable question snapshots, section-aware engine rules, original-deadline recovery, explicit tab takeover, reports, exam-specific note contexts and recall revision. Descriptive/essay/conventional/interview exercises use non-official rubrics; typing uses a disclosed custom metric rather than claiming SSC DEST equivalence.

Private account and explicit cross-device sync are implemented using Supabase Auth and owner-isolated PostgreSQL RLS with revision-conflict checks. They remain disabled until the owner configures the project, applies the SQL migration and provisions the owner. Database deployment and actual two-user RLS tests have not been performed in the build environment. Local files are not cloud uploads. See `docs/PRIVATE_SETUP.md` and `docs/CONTENT_REVIEW.md` for exact setup, verification and limits.

## Personal-use default · 15 October 2026
Retain cloud integration but keep it disabled unless `ANVAYA_CLOUD_ENABLED=true` and all provider configuration is supplied. Current personal study uses browser storage and explicit file backups. Production practice/topics entry points open the current local learning flow; unreviewed draft content remains development-only.

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


## SSC CGL delivery checkpoint · 17 October 2026

The SSC common personal-study workflow is implemented at `/ssc-cgl`: condensed lessons, notes, recall, topic drills, original complete-count Tier-I/Tier-II common rehearsals and separate saved DEST. Special-paper lessons are separate by applicable post. Read `docs/SSC_CGL.md` for exact inventory, timing profiles, validation and explicitly incomplete content/review gates. Do not interpret this checkpoint as approval of full syllabus coverage or official mocks.


## SSC CGL completion checkpoint · 18 October 2026

The SSC path now has 79 original lessons / 562 explained MCQs, with separate full-count original Statistics and Finance/Economics rehearsals, 40/60 Finance quotas, two disjoint common-paper attempts from an unseen bank, accessible vector drills, publisher lecture mappings, source/review status, same-tab launch handoff and paged answer review. The active platform totals 101 lessons / 643 questions. Banks v1–v4 remain immutable; new attempts use v5. DEST resume/report links are connected to the daily/results desks. Accounts and tutor remain OFF.

This checkpoint completes those software/content additions; it does not approve exhaustive subject depth, authentic PYQ/final-key ingestion, independent editorial review, calibrated difficulty or live/regional examination equivalence. See `docs/SSC_CGL.md` and `/ssc-cgl/sources` for the exact remaining gates.

### SSC personal study loop · 18 October 2026

Added `/ssc-cgl/study`: local daily budget/scope planning, subject evidence from distinct latest saved responses, question-level correction notes/reasons, reversible manual resolution and private key-doubt flags. Result feedback links directly into the notebook; filters and pagination support longer histories. Focused retries reuse only 1–20 selected unresolved questions, exclude flagged doubts, retain timed-session ownership and never alter old scores. Optional validated vault storage preserves old backups and includes new notes/settings in explicit exports. Full editorial/PYQ/live-exam gates remain open; cloud/tutor stay disabled by default.

### All-exam learning and bounded navigation · 18 October 2026

Added nine exam classrooms and per-exam study/diagnosis workflows alongside the existing SSC path. Seven worked lessons and 42 original questions expand the unique active inventory to 108/685. New bank v6 preserves all older snapshots; full SSC templates remain pinned to v5. Classrooms use explicit sections, course/lecture/lesson grids show six items per page, and notebooks show one question at a time. Other paths gain contextual notes, plans, evidence and exact selected retries without implying official scoring or full mock coverage. See [release contracts and remaining limits](docs/ALL_EXAM_LEARNING.md). Cloud and tutor remain disabled by default.

### Engineering depth and frozen GATE original papers · 18 October2026

Added10 worked lessons/60 questions, bringing unique active inventory to118/745. GATE EE/EC/IN gain65-question100-mark original rehearsals with15/13/72 components,180/240-minute practice profiles and frozenv7 contracts. The new bounded local scientific calculator is available standalone and during those papers. Bankv1–v6 and SSCv5 templates remain unchanged. See [release contracts, checks and remaining coverage limits](docs/GATE_ORIGINAL_REHEARSAL.md). No official key, difficulty calibration, independent review or complete curriculum claim is introduced.
