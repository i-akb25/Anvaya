# Private account and cross-device setup

Local learning works without an account. Cloud features stay disabled by default through `ANVAYA_CLOUD_ENABLED=false`, even when credentials exist. Local learning, practice and file backups need no Supabase setup. Later, enable cloud only after completing the configuration below. Do not use a service-role or secret admin key in this application.

1. Create a Supabase project you control. In Authentication settings, disable **Allow new users to sign up**. Do this before exposing the project URL/key.
2. Through Authentication → Users, create the private owner account with a strong password and a confirmed email. Copy its UUID. Public registration is not implemented.
3. Apply `supabase/migrations/202610150001_private_workspace.sql` in the SQL editor. The migration enables RLS and creates an atomic compare-and-save RPC. Do not disable RLS to resolve an error.
4. Add the owner UUID to `public.anvaya_members` using the SQL editor. This table is not writable by application users. Keep the UUID/value out of committed SQL files.
5. Add these **server-only** variables to Vercel and local `.env.local`: `SUPABASE_URL` (project HTTPS URL), `SUPABASE_ANON_KEY` (publishable/anon project key, never service-role), `ANVAYA_OWNER_ID` (owner UUID), and `ANVAYA_APP_ORIGIN` (`https://anvaya-verse.vercel.app`, no trailing path). Use `http://localhost:3000` only for local development. Do not prefix them with `NEXT_PUBLIC_`.
6. When ready to integrate, set the server variable `ANVAYA_CLOUD_ENABLED=true`, then redeploy. Keep it false or unset until then. Open `/account`, sign in, and choose **Load cloud copy** before uploading. The first cloud revision is zero. Upload is explicit, never automatic. Cookies are HttpOnly, SameSite Lax, and Secure in production; identity is checked with Supabase `getUser()` on every private read/write.
7. On a second device, sign in, load the cloud copy, export a local backup, then explicitly restore the cloud copy. An active practice retains its original start/deadline and requires taking over the writer. Saved PDFs persist in IndexedDB on their current browser; they are not synced or included in JSON backups. Download originals separately. Writing-image previews still need reattachment.
8. Verify the live database isolation checks below before relying on it. The migration is exercised against embedded PostgreSQL with separate authenticated roles/subjects, but those tests cannot prove that a deployed Supabase project has the same policies active.

## Required live checks

- Signed-out GET/PUT `/api/sync` must return 401 after configuration. Disabled cloud or missing configuration returns 503.
- A second Supabase account must be rejected by `/api/account`. Do not add it to `anvaya_members` unless deliberately expanding membership.
- With the second account's own token, direct REST reads/writes of the owner's `learning_workspaces` row must fail or return no rows. Never use a service-role key for this check, because it bypasses RLS.
- Only the owner should be able to create/update their row. `anvaya_members` inserts/updates must fail for authenticated application users.
- Load revision N on two devices. Save from A, then save stale revision N from B. B must receive 409 and preserve its local copy.
- Create a note, plan, written answer and practice result on A; restore on B and compare. Test a refresh during a timed attempt: no extra time should appear.
- Simulate provider/network failure. Local work must remain available and no cloud failure should replace local data.
- Sign out, clear local copies on shared devices, and confirm the cloud row is still available after signing in again. Sign-out alone does not erase local copies.

## Backup and recovery

The `/account` export contains new learning notes, results, writing, recall dates and the paper/planner workspace. Older demo/draft practice history retains its separate backup under `/results/legacy` and `/review`. Raw recovery exports are intentionally not importable as validated backups.

Cloud restore is a replacement, not an automatic merge. Close other Anvaya tabs and export both copies first. Stored local revisions reject stale writes, but localStorage is not a transactional multi-tab database. Two separate browser-storage keys are restored with best-effort rollback; a browser crash between writes remains a limitation. Keep independent exports.

## Limits

Cloud payloads are capped below 2 MB; independent file imports allow up to 10 MB. Export a file backup before reducing stored data.

This setup stores workspace JSON in private Postgres rows, not private PDFs/images. Public multi-user onboarding, account deletion UI, MFA enforcement, private file storage and a live two-user isolation run remain separate release work. Supabase's configured Auth limits protect password endpoints; this app does not claim a globally distributed custom limiter. No session tokens or personal note contents are intentionally logged by the application.
