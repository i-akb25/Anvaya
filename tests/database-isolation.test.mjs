import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
test("actual SQL policies isolate tenants, deny member edits and atomically reject stale revisions", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${owner}'),('${other}'); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610150001_private_workspace.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      `insert into public.anvaya_members values ('${owner}'); set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`,
    );
    let result = await db.query(
      `select public.save_learning_workspace(0,'{"schema":1,"privateNote":"owner only"}'::jsonb) as saved`,
    );
    assert.equal(result.rows[0].saved.revision, 1);
    await assert.rejects(
      () => db.query(`select public.save_learning_workspace(0,'{}')`),
      /revision_conflict/,
    );
    result = await db.query(
      `select public.save_learning_workspace(1,'{"schema":1,"privateNote":"newer"}'::jsonb) as saved`,
    );
    assert.equal(result.rows[0].saved.revision, 2);
    await assert.rejects(
      () =>
        db.query(
          `insert into public.anvaya_members(user_id) values ('${other}')`,
        ),
      /permission denied/,
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${other}',false)`,
    );
    assert.equal(
      (await db.query("select * from public.learning_workspaces")).rows.length,
      0,
    );
    await assert.rejects(
      () =>
        db.query(
          `insert into public.learning_workspaces(owner_id,payload) values ('${owner}','{}')`,
        ),
      /row-level security|duplicate key/,
    );
    await assert.rejects(
      () =>
        db.query(
          `insert into public.learning_workspaces(owner_id,payload) values ('${other}','{}')`,
        ),
      /row-level security/,
    );
    await assert.rejects(
      () => db.query(`select public.save_learning_workspace(0,'{}')`),
      /not_authorized/,
    );
    assert.equal(
      (
        await db.query(
          `update public.learning_workspaces set payload='{}' where owner_id='${owner}' returning *`,
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          `delete from public.learning_workspaces where owner_id='${owner}' returning *`,
        )
      ).rows.length,
      0,
    );
    await db.exec("reset role");
    await db.exec(
      `insert into public.anvaya_members values ('${other}'); set role authenticated; select set_config('request.jwt.claim.sub','${other}',false)`,
    );
    result = await db.query(
      `select public.save_learning_workspace(0,'{"schema":1,"privateNote":"other user"}'::jsonb) as saved`,
    );
    assert.equal(result.rows[0].saved.revision, 1);
    const rows = (
      await db.query("select owner_id,payload from public.learning_workspaces")
    ).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].owner_id, other);
    assert.equal(rows[0].payload.privateNote, "other user");
    await db.exec(
      `reset role; set role anon; select set_config('request.jwt.claim.sub','',false)`,
    );
    await assert.rejects(
      () => db.query("select * from public.learning_workspaces"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query(`select public.save_learning_workspace(0,'{}')`),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
