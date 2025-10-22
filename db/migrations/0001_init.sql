-- 0001_init.sql
-- Initial schema for SentinelPro (Supabase / Postgres)

-- Extensions
create extension if not exists pgcrypto;

-- Soldiers master data
create table if not exists public.soldiers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  rank text not null,
  unit text,
  clearance text,
  status text,
  last_seen timestamptz,
  confidence numeric(5,2),
  avatar_url text
);

create index if not exists idx_soldiers_created_at on public.soldiers (created_at desc);

-- Threat events
create table if not exists public.threats (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  level text not null check (level in ('LOW','MEDIUM','HIGH','CRITICAL')),
  description text,
  source text,
  resolved_at timestamptz
);

create index if not exists idx_threats_created_at on public.threats (created_at desc);
create index if not exists idx_threats_level on public.threats (level);

-- System logs shown in UI
create table if not exists public.system_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  level text not null default 'INFO',
  tag text,
  message text not null,
  context jsonb not null default '{}'::jsonb
);

create index if not exists idx_system_logs_created_at on public.system_logs (created_at desc);
create index if not exists idx_system_logs_context on public.system_logs using gin (context);

-- Face recognition matches
create table if not exists public.face_matches (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  soldier_id uuid references public.soldiers(id) on delete set null,
  confidence numeric(5,2) not null,
  image_url text,
  matched boolean not null default true
);

create index if not exists idx_face_matches_created_at on public.face_matches (created_at desc);
create index if not exists idx_face_matches_soldier on public.face_matches (soldier_id);

-- RLS
alter table public.soldiers enable row level security;
alter table public.threats enable row level security;
alter table public.system_logs enable row level security;
alter table public.face_matches enable row level security;

-- Allow read access to everyone (clients use anon key). Writes should be done via service role.
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='soldiers' and policyname='Read Soldiers'
  ) then
    create policy "Read Soldiers" on public.soldiers for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='threats' and policyname='Read Threats'
  ) then
    create policy "Read Threats" on public.threats for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='system_logs' and policyname='Read System Logs'
  ) then
    create policy "Read System Logs" on public.system_logs for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='face_matches' and policyname='Read Face Matches'
  ) then
    create policy "Read Face Matches" on public.face_matches for select using (true);
  end if;
end $$;

-- Optional: allow authenticated users to insert (service_role bypasses RLS anyway)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='threats' and policyname='Insert Threats (authenticated)'
  ) then
    create policy "Insert Threats (authenticated)" on public.threats for insert
      with check (auth.role() = 'authenticated');
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='system_logs' and policyname='Insert System Logs (authenticated)'
  ) then
    create policy "Insert System Logs (authenticated)" on public.system_logs for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Updated_at trigger for soldiers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_soldiers_updated_at on public.soldiers;
create trigger trg_soldiers_updated_at
before update on public.soldiers
for each row execute function public.set_updated_at();


