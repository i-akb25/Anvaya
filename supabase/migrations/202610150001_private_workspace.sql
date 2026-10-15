-- Apply through the owner's Supabase SQL editor. No private values belong here.
create table if not exists public.anvaya_members (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.anvaya_members enable row level security;
revoke all on public.anvaya_members from anon, authenticated;
grant select on public.anvaya_members to authenticated;
create policy member_reads_self on public.anvaya_members for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.learning_workspaces (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 1 check (revision > 0),
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 2000000),
 updated_at timestamptz not null default now()
);
alter table public.learning_workspaces enable row level security;
revoke all on public.learning_workspaces from anon, authenticated;
grant select, insert, update, delete on public.learning_workspaces to authenticated;
create policy workspace_owner_select on public.learning_workspaces for select to authenticated using (owner_id = (select auth.uid()) and exists (select 1 from public.anvaya_members where user_id = (select auth.uid())));
create policy workspace_owner_insert on public.learning_workspaces for insert to authenticated with check (owner_id = (select auth.uid()) and exists (select 1 from public.anvaya_members where user_id = (select auth.uid())));
create policy workspace_owner_update on public.learning_workspaces for update to authenticated using (owner_id = (select auth.uid()) and exists (select 1 from public.anvaya_members where user_id = (select auth.uid()))) with check (owner_id = (select auth.uid()) and exists (select 1 from public.anvaya_members where user_id = (select auth.uid())));
create policy workspace_owner_delete on public.learning_workspaces for delete to authenticated using (owner_id = (select auth.uid()) and exists (select 1 from public.anvaya_members where user_id = (select auth.uid())));

create or replace function public.save_learning_workspace(expected_revision bigint, new_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); current_revision bigint; result jsonb;
begin
 if uid is null or not exists(select 1 from public.anvaya_members where user_id = uid) then raise exception 'not_authorized'; end if;
 if expected_revision < 0 or jsonb_typeof(new_payload) <> 'object' or octet_length(new_payload::text) > 2000000 then raise exception 'invalid_payload'; end if;
 -- Serialize concurrent first-inserts and updates for this authenticated owner.
 perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
 select revision into current_revision from public.learning_workspaces where owner_id = uid;
 if coalesce(current_revision,0) <> expected_revision then raise exception 'revision_conflict'; end if;
 insert into public.learning_workspaces(owner_id, revision, payload) values(uid,1,new_payload)
 on conflict(owner_id) do update set revision=public.learning_workspaces.revision+1,payload=excluded.payload,updated_at=now();
 select jsonb_build_object('revision', revision, 'updated_at', updated_at) into result from public.learning_workspaces where owner_id = uid;
 return result;
end; $$;
revoke all on function public.save_learning_workspace(bigint,jsonb) from public, anon;
grant execute on function public.save_learning_workspace(bigint,jsonb) to authenticated;
-- After creating the owner in Authentication > Users, insert their UUID into
-- anvaya_members using the SQL editor. Disable new user sign-ups in Auth settings.
