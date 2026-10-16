# Learning release, 16 October 2026

This release advances the eight requested areas. It does not certify a complete ten-exam curriculum or public multi-user readiness. `/coverage` exposes actual counts and missing editorial gates.

| Area | Working implementation | Required external or editorial work |
| --- | --- | --- |
| Syllabus | Separate exam/cycle/stage registry; selected primary-PDF subtopic highlights for GATE EE/IN and SSC; connected lesson links | Full transcription and depth mapping across ten tracks, EC PDF retrieval, current notices and accommodations review |
| Lessons | 22 AI-authored, source-linked foundation units with original worked examples, recall and practice | Full subject sequences, advanced content, Hindi coverage and independent human review |
| Questions | 81 distinct original questions, checked keys; immutable v1/v2/v3 banks; local ingestion preflight | Licensed/authentic PYQs, final-key corrections, named independent review and complete paper coverage |
| Mocks | Custom section builder, separate timing and marking, fixed-section locks, frozen attempts and original deadline | Official simulations stay locked until the exact approved pattern and bank version, rights, keys and full coverage match |
| Specialised content | Bihar basin source criticism, constraint reasoning, induction, dated current-affairs selections, private briefing review/correction/withdrawal | Broad Bihar, advanced technical and complete reasoning coverage; exhaustive daily editorial review |
| Files | IndexedDB private PDFs reopen after reload, bounded signatures/size/count, SHA-256 fingerprints, download originals | Browser data can be evicted. PDF bytes are separate from JSON backups and cloud sync. Independent file copies remain necessary |
| Quality | Regression tests, actual SQL role checks, import validation, HTTP deny paths, responsive form/table/navigation styles | Comprehensive physical phone/tablet and assistive-technology QA; live two-device provider verification |
| Accounts/tutor | Existing owner-only account/sync remains off by default; optional cited Gemini integration, consent and database quota | Owner must configure the external project, migrations, credentials and model, then test real provider behavior |

## Using the new tools

- `/library`: save up to20 PDFs, at most20 MB each and60 MB combined. Files stay in this browser. Download originals independently; `/account` JSON backups omit PDF bytes. Files attached at `/study/[id]` use a stable paper key and reopen there after reload. Clearing the learning vault does not delete saved PDFs; remove them individually from the file library.
- `/mocks`: configure up to6 custom sections, at most50 questions per section,200 total and6 hours total. Each section has a declared topic, count, timer and marks/deduction. Wrong MSQ/numeric and blank responses score zero. Repeated use of prior questions requires explicit consent; duplication inside an attempt is always prohibited. Reference tables never silently overwrite custom settings or turn a custom attempt into an official one.
- `/assessments`: take over a saved sectional attempt, answer only within the current section, then inspect the reproducible result. Fixed mode locks past/future sections and displays the current section countdown. Free mode permits paper-wide navigation.
- `/current-affairs`: keep a private source-linked journal. Draft/reviewed/corrected/withdrawn states describe your local review. Corrections increment the entry version and need a reason. Withdrawn summaries are hidden from revision/search. Journal entries are included in study backups; nothing is published by saving them.
- The same page can request up to20 publisher RSS headlines from RBI/PIB. Only public metadata is fetched and cached for up to15 minutes. Headlines are not reviewed stories or automatically generated lessons. No notes/searches go to those publishers. Publisher timeouts are visible and do not replace curated selections with invented updates. Feed URLs and redirect destinations are restricted to their configured publisher hosts; XML entity declarations, oversized bodies, unsafe links and malformed items are rejected. Availability varies by publisher.
- `/content-review`: locally validate bounded question-pack metadata, answer shape, source/key fields, review claims, declared rights and registered pattern identity. A passing schema check is not verification and cannot publish or unlock official simulations. Use `npm run content:check -- <path>` for repository ingestion work after reading the existing review-pack script.
- `/coverage`: inspect current inventory and service configuration. Configuration is not proof of a successful external operation.

## Optional tutor setup

Cloud remains OFF unless deliberately configured. Local study requires none of these steps.

1. Complete the existing owner-only Supabase setup from `docs/PRIVATE_SETUP.md` (or the repository's current private-account setup instructions). Disable public registration; create the owner and approved membership. Never put secrets or UUIDs into public docs.
2. Apply both tracked SQL migrations, including `202610160001_tutor_budget.sql`.
3. Set `ANVAYA_TUTOR_ENABLED=true`, server-only `GEMINI_API_KEY` and an explicitly selected available `ANVAYA_GEMINI_MODEL`. Keep the same canonical `ANVAYA_APP_ORIGIN`; do not expose these keys as NEXT_PUBLIC values.
4. Verify owner/non-owner access, same-origin denial, real provider completion and failure, quota persistence and two-device sync before relying on them. No live migration or credential setup is performed by this code release.

The tutor sends only a selected Anvaya lesson, the current question and optional text explicitly typed into its transfer field. It does not read the notebook, PDFs, drafts or past chats. The consent checkbox is required for every request body; the page has no auto-send. Responses are plain text and labelled AI-generated/unreviewed. `[S1]` identifies supplied context, not independent validation. Missing/unknown citations, blocked responses, truncation and provider errors produce an explicit failure; they do not become copied source fragments presented as an answer.

The database reserves at most20 calls per member per UTC day with at least6 seconds between calls. The owner role cannot directly reset quota rows; the SQL function serializes reservations and rejects non-members. Failed provider calls still consume reservations. There are no automatic retries. Provider keys stay server-side; prompts/responses are not logged or persisted by Anvaya. Provider retention/billing terms still apply. Token and count caps limit usage, not currency spend or free-tier eligibility.

## Content checks and limits

New primary references were opened for trading arithmetic, work/motion, compounding, descriptive statistics, combinations, relative velocity, induction, Bihar basins and formal reasoning. Numerical examples and the new objective keys are covered by independent arithmetic/enumeration fixtures. These are original AI-authored foundations, not copied publisher exercises or human-reviewed PYQs. The Bihar page's dated baseline and directional inconsistency are flagged rather than repeated as current facts.

Source highlights are concise selections. All syllabus rows retain `complete:false`. No current record is promoted to `official-pattern-verified`. The new readiness gate also requires an exact approved immutable question-bank version, an effective pattern date, resolved navigation/marking and full objective counts. It cannot be satisfied by a count alone.

Physical-device/accessibility audits, full curriculum authorship/review, rights verification, authentic question transcription and external credentials cannot be manufactured by passing a build. They remain visible release gates.
