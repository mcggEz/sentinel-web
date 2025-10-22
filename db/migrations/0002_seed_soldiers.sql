-- 0002_seed_soldiers.sql
insert into public.soldiers (name, rank, unit, clearance, status, last_seen, confidence, avatar_url)
values
('Sgt. John Mitchell', 'Sergeant', 'Alpha Company', 'Level 3', 'Active', now() - interval '10 minutes', 94.20, null),
('Cpt. Sarah Williams', 'Captain', 'Bravo Company', 'Level 4', 'Active', now() - interval '1 hour', 87.80, null),
('Lt. Michael Chen', 'Lieutenant', 'Charlie Company', 'Level 2', 'Active', now() - interval '2 hours', 91.50, null)
on conflict do nothing;


