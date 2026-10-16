# Lecture directory maintenance

The immutable catalog version is `lectures-20261015-v1` in `lib/platform/lecture-catalog.json`. It contains 100 distinct destination links, grouped into 71 populated topics and four explicit curation gaps. Reusing a lecture across topics does not create another distinct resource. A course or collection counts as one destination, not as every lecture it may contain.

## Primary evidence checked on 15 October 2026

| Publisher | Evidence | Scope checked |
| --- | --- | --- |
| NIOS | https://rcbhubaneswar.nios.ac.in/social-science-213.html | Links in the regular Video column, not the separate sign-language column |
| NIOS | https://rcbhubaneswar.nios.ac.in/economics-318.html | Publisher video links, part labels and alternative versions |
| NIOS | https://rcbhubaneswar.nios.ac.in/science-and-technology-212.html | Video links associated with each chapter row |
| MIT OCW | Individual resource and lecture-gallery URLs recorded in each resource | Course/resource title, published lecture order, English transcript where available; two iframe IDs copied from the publisher's embed links |
| NPTEL | Course-specific URLs recorded in each resource | Course title and faculty listing. Player access and spoken language were not confirmed |
| Khan Academy / Drishti IAS English | Publisher-specific indexed video listings recorded in each resource | Indexed video title and topic match. Direct page rendering returned limited content. No claim of full playback review |

Metadata/source checks are not editorial approval of every spoken claim. End-to-end playback, captions, accessibility of third-party players and geographic restrictions remain unverified. Spoken language for NIOS and NPTEL is deliberately recorded as `Not confirmed`. The English/Hindi filter only includes explicitly classified resources.

## Updating a source

1. Open the original publisher's page, confirm title/topic and its direct resource destination. Do not count a search query, homepage, paid login landing page or inaccessible archive as an individual lecture.
2. Keep a stable ID, checked date, evidence URL, resource kind and verification level. Preserve part numbers; label missing earlier parts and alternatives honestly. Update an ID when replacing the underlying resource so personal completion cannot silently attach to a different lecture.
3. Add a YouTube embed ID only from a publisher-listed destination. The application constructs a fixed `youtube-nocookie.com` URL and accepts bounded integer positions. No arbitrary iframe URL is accepted.
4. Keep only topic mappings appropriate for the exam. Source collection availability does not certify current-cycle syllabus coverage. Bihar-specific GS, current affairs, banking policy, puzzle coaching and several specialist areas still have visible gaps.
5. Run `npm test`, `npm run typecheck`, `npm run build` and `npm run check:http`. Tests validate catalog references and URL forms, compatibility, exam separation, filters, position bounds, backup restore and stale-write rejection. HTTP checks verify no player is rendered before consent; they do not prove external playback.

## Personal progress and privacy

Lecture state is an optional `lectures` record inside the existing learning vault. Keys are `exam:topic:resource`. Each state has a bounded note, manual timestamp, self-reported status and update time. Older backups without this record remain valid. Existing opaque historical keys may remain in backups, but the UI only displays currently known catalog contexts. This prevents a catalog edit from invalidating an otherwise recoverable backup.

Progress is saved only on an explicit save action. Before unloading or switching an exam/resource with unsaved changes, the page warns the learner. External player position is not captured automatically. Topic completion and assessment scores remain independent. Storage corruption/quota/conflict failures are surfaced and do not authorize overwriting newer work. Backup/restore includes lecture state. No external video, thumbnail, transcript, provider script or third-party account request is loaded automatically by Anvaya. The external player connects to YouTube after a learner chooses to load it. No paid video content is rehosted.
