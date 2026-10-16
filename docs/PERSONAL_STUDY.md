# Personal study workflow

Anvaya currently runs as a browser-local personal workspace with explicit file backups. Cloud integration remains disabled by default. A working local tool does not certify complete educational content, verified mocks or public multi-user readiness.

## Daily use

- Open `/today` for pending planner sessions, scheduled topic reviews, unfinished bundled/personal practice and lectures marked as watching. Dates use the browser's local calendar day. Counts describe saved work, not exam readiness.
- Use `/search` to find lessons, lecture topics, stage/cycle syllabus outlines and official paper links. Turn on **Include my private content** to search notes, lecture notes, plans, writing drafts and personal question packs. Search queries and matching private text are processed in the browser; neither is placed in navigation URLs or sent to a search service.
- Use `/notebook` for an exam-specific note on any listed lecture topic. Existing foundation lesson notes use the same keys, so edits remain connected. Save explicitly, optionally scheduling review in one or seven calendar days. Arbitrary topic notes remain personal content, not published lessons. Completing a note does not mark its syllabus complete.
- Use `/my-practice` to author single-correct, multiple-correct and numeric-range questions, with explanations and optional source URLs. Export a pack as JSON or import a previously exported one. Imported files are locally parsed with bounded types/counts and a review step. Do not use material without permission.

## Personal practice rules

Supplied questions, answer keys and explanations are unverified. Personal packs are labelled separately from bundled source-checked foundation practice; neither is an official mock. A source URL or a claim inside imported JSON is not evidence of PYQ provenance or editorial approval. User acknowledgment confirms the intended personal-use workflow, not the correctness of the keys.

Limits: ten packs, 100 questions per pack, 500 questions total; imported file at most 2 MB. Each practice attempt selects up to 50 distinct questions from one pack. Repeated use of a pack is deliberate revision. Timers support 1–180 whole minutes. Users specify positive marks and wrong-MCQ penalty. Wrong MSQ/numeric and blank answers score zero; MSQ requires the exact set and numeric ranges are inclusive. This is a disclosed custom scheme, not an inferred exam rule.

Each attempt freezes the chosen questions and supplied key. Removing a source pack does not remove saved results. The latest 20 personal results are retained. Responses are saved after valid changes and unfinished attempts retain their absolute original deadline after refresh and backup restore. Stale learning-vault revisions reject conflicting writes. Reload the saved practice before editing after a conflict. Active concept or personal practice blocks backup replacement. Both flows block starting another practice session of the other kind.

## Recovery and privacy

Question packs, active attempts and personal results are included in the existing `/account` study backup. Older backups without the optional personal field remain valid. Files containing questions, notes and responses should be kept private. No personal content is written to Git, rehosted or uploaded merely by importing it. If cloud sync is later enabled, its existing explicit transfer workflow applies to the entire learning payload; its upload size limit still applies.

Planner task writes now compare the saved task list before merging, preserve newer paper notes and reject stale task edits. The notebook and question desk use learning-vault revision checks. Corrupt storage and quota failures are surfaced rather than silently resetting work. Private PDFs still require reattachment after reload; browser storage is not a substitute for independent backups.

## Remaining product gates

Complete reviewed curricula, authentic permitted PYQ ingestion, full official-pattern mock sets, complete subtopic mapping, current-affairs ingestion/moderation, persistent private-file storage, live provider auth/sync verification and comprehensive device/accessibility QA remain incomplete. AI tutoring requires a separately configured provider and guardrails. Current local functionality must not be marketed as completion of these gates.
