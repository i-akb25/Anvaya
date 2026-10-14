# Anvaya

**Product requirements:** [PRD.md](./PRD.md) · **Master charter:** [PROJECT_MASTER.md](./PROJECT_MASTER.md).

**Project source of truth:** [PROJECT_MASTER.md](./PROJECT_MASTER.md). Product, design, exam coverage, privacy, content integrity, delivery rules, and current implementation limits are documented there.

Personal-first, public-ready exam preparation workspace.

## Current status

A **functional Next.js foundation**, not a completed coaching platform. Includes 10 exam tracks (GATE EE/EC/IN separately), preliminary subject-to-exam discovery, publisher/search launchers, a deterministic scored six-question CBT **demonstration**, and responsive layouts. Sample questions are **not PYQs**. Official syllabi, question banks, AI, authenticated storage, lecture indexing, daily feeds and offline sync are **not yet implemented**.

### Run

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

### Safety

- Never commit keys, personal PDFs, login tokens or copyrighted paid learning material.
- No user accounts or persistent personal-data store are activated in this foundation.
- External publisher links are redirects/search shortcuts; no affiliations implied.
- Before public launch, add authenticated per-user data boundaries, private storage, backups, validated question ingestion and source-specific usage rights.
- Official exam patterns must come from a dated official notification, not hardcoded assumptions.

Support: akbsupportinfo@gmail.com

## Custom CBT practice (new)

Open `/practice` to configure a timed question set, marking scheme, select answers, mark questions for review, navigate by palette, submit, inspect explanations, and export attempt history. Attempts are stored in **the current browser's localStorage**, with a maximum of 50 records. **This is not cloud synchronization** and is not safe as a sole backup. The user should export JSON. This does not implement offline service-worker caching or real PYQ ingestion. The supplied bank is six illustrative questions, and the scoring preset is not presented as an official exam pattern.

## Branding and responsive design

The existing cream, sage and clay direction is preserved. Headers share the Anvaya mark; the dashboard uses an original SVG desk illustration. No generated imagery or third-party asset calls are used. Breakpoints adapt navigation, the hero, cards and CBT palette; keyboard focus and reduced motion are supported.

- Mark: `public/anvaya-mark.svg`; wordmark: `public/brand/anvaya-wordmark.svg`
- Illustration: `public/illustrations/study-desk.svg`
- App icons: `public/brand/`; social cover: `app/opengraph-image.png`
- Manifest: `app/manifest.ts`. This adds installation metadata, not offline support.
- Regenerate raster assets with `npm run assets` (uses the installed Sharp dependency supplied with Next.js).

## History controls and verification

The practice page supports local JSON export, validated restore/merge (2 MB maximum, latest 50 attempts), and confirmed deletion. Imports are processed locally; scores are recalculated against the supported sample bank. Malformed imports leave existing history intact. Browser storage is not encrypted, authenticated storage; use a trusted device. Private PDFs, notes and credentials must not be stored in this public repository.

Run on Node 22.18 or later:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

CI uses the lockfile and runs type checking, behavioral regression tests and the production build. Browser visual verification is still required before launch, including 320, 375, 768, 1024 and 1440 px widths and keyboard-only use. Search indexing remains disabled until the platform is ready. No authenticated cloud storage, private document upload, verified PYQ bank or AI tutor is enabled by this update.

Dependency audit: PostCSS is overridden to 8.5.30 within the existing Next.js 15 stack to resolve the installed vulnerable transitive version. Recheck the override when upgrading Next.js.

The full audit (including development tools) still flags the `braces` chain through `eslint-config-next`; npm reports no compatible fix without changing the lint toolchain. The production-only audit is clean. This remaining development dependency advisory is not a claim that all dependencies are vulnerability-free.

## Recoverable practice and review

- `/practice`: saved responses, navigation and review marks; resume/discard an unfinished session; the original deadline continues across reloads. Another tab must explicitly claim recovery. Starting without storage is available for blocked storage or memory-only practice.
- `/review`: separate exam tracking contexts, per-topic accuracy and penalties, a historical mistake notebook, and a revision queue driven by the latest response. Self-review acknowledgements are not mastery claims. Statistics cover only retained illustrative attempts.
- Attempts retain a bank version and content kind. Existing v1 history migrates on the first successful write, and v1 backups can still be restored. Released bank content must remain append-only; add a new bank version instead of changing a historical answer key.
- Workspace backup format `anvaya-workspace-v2` includes completed attempts, unfinished recovery and review acknowledgements. All are written as one browser-storage record. Malformed imports are rejected before writing; raw data can be exported for recovery. Imported files are untrusted and validated. A raw recovery file is for safekeeping/manual diagnosis, not automatic import.
- Deletion removes both legacy and current practice records. Exported files contain private responses and timing. Keep them private. A memory-only result can be downloaded before leaving the page.
- GATE 2027 EE/EC/IN official-source links are recorded in `lib/exam-sources.ts` with the date and scope checked. Full official syllabi, pattern versions and authentic PYQs are still pending.

Tests cover clock expiry, draft recovery, conflicting-tab ownership, legacy migration, input/provenance checks, failed writes, complete backup/restore, exam isolation, analytics and revision state. Authentication, private server storage, offline sync, and browser visual QA remain release gates. No cloud reliability or real-exam readiness is claimed.
