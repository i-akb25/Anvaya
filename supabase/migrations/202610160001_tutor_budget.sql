-- Optional: only needed when owner-authenticated tutoring is explicitly enabled.
-- Stores counters only. No prompts, answers, notes or provider keys.
create table if not exists public.anvaya_tutor_budget (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 budget_day date not null,
 calls integer not null check(calls between 1 and 20),
 last_call timestamptz not null
);
alter table public.anvaya_tutor_budget enable row level security;
revoke all on public.anvaya_tutor_budget from public, anon, authenticated;
create or replace function public.reserve_anvaya_tutor_call()
returns integer language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); used integer; last_at timestamptz; day_at date; today_utc date := (now() at time zone 'UTC')::date;
begin
 if uid is null or not exists(select 1 from public.anvaya_members where user_id=uid) then raise exception 'not_authorized'; end if;
 perform pg_advisory_xact_lock(hashtextextended('tutor:'||uid::text,0));
 select calls,last_call,budget_day into used,last_at,day_at from public.anvaya_tutor_budget where owner_id=uid;
 if last_at is not null and now()-last_at < interval '6 seconds' then raise exception 'rate_limited'; end if;
 if day_at=today_utc and used>=20 then raise exception 'daily_limit'; end if;
 used := case when day_at=today_utc then used+1 else 1 end;
 insert into public.anvaya_tutor_budget values(uid,today_utc,used,now())
 on conflict(owner_id) do update set budget_day=excluded.budget_day,calls=excluded.calls,last_call=excluded.last_call;
 return 20-used;
end; $$;
revoke all on function public.reserve_anvaya_tutor_call() from public,anon;
grant execute on function public.reserve_anvaya_tutor_call() to authenticated;
