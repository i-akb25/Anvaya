# Anvaya

Personal-first, public-ready exam preparation workspace.

## Current status

A **functional Next.js foundation**, not a completed coaching platform. Includes 10 exam tracks (GATE EE/EC/IN separately), preliminary subject-to-exam discovery, publisher/search launchers, a deterministic scored six-question CBT **demonstration**, and responsive layouts. Sample questions are **not PYQs**. Official syllabi, question banks, AI, authenticated storage, lecture indexing, daily feeds and offline sync are **not yet implemented**.

### Run

```bash
npm install
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
