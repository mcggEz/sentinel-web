-- 0003_rls_writable_demo.sql
-- Demo write policies for soldiers table to allow anon inserts/updates/deletes
-- WARNING: In production, tighten these policies.

alter table public.soldiers enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='soldiers' and policyname='Insert Soldiers (anon)'
  ) then
    create policy "Insert Soldiers (anon)" on public.soldiers for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='soldiers' and policyname='Update Soldiers (anon)'
  ) then
    create policy "Update Soldiers (anon)" on public.soldiers for update using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='soldiers' and policyname='Delete Soldiers (anon)'
  ) then
    create policy "Delete Soldiers (anon)" on public.soldiers for delete using (true);
  end if;
end $$;


