SentinelPro Database Migrations (Supabase/Postgres)

This folder contains raw SQL migrations you can run in Supabase (Postgres).

Files
- 0001_init.sql – core schema (soldiers, threats, system_logs, face_matches), RLS policies, indexes
- 0002_seed_soldiers.sql – demo soldiers used by the UI

How to apply

You can apply these using either the Supabase SQL Editor (paste the file contents) or the Supabase CLI.

Option A: Supabase SQL Editor
1. Open Supabase project → SQL Editor
2. Paste contents of 0001_init.sql, run it
3. Paste contents of 0002_seed_soldiers.sql, run it

Option B: Supabase CLI (recommended)
Prereq: Install the CLI and login.
```
npm i -g supabase
supabase login
```
Run migrations locally against your project:
```
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --file db/migrations/0001_init.sql
supabase db push --file db/migrations/0002_seed_soldiers.sql
```

Note: The app uses SUPABASE_URL, SUPABASE_ANON_KEY, and server tasks can use SUPABASE_SERVICE_ROLE (keep secret!)

Tables
- soldiers: master data for facial recognition matches
- threats: captured threats with levels LOW/MEDIUM/HIGH/CRITICAL
- system_logs: log messages shown in the UI
- face_matches: recognition matches with confidence and optional soldier link

RLS allows public read access for UI; writes should be performed with the service role or authenticated policies.


