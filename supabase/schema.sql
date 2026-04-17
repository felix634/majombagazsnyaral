-- Majombagázs Nyaral - Supabase séma
-- Futtasd ezt a Supabase SQL Editorban egyszer.

create extension if not exists "pgcrypto";

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists availabilities (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  user_name text not null,
  day date not null,
  unique (plan_id, user_name, day)
);

create index if not exists availabilities_plan_idx on availabilities(plan_id);

-- Row Level Security: nyitott olvasás/írás (jelszó nélküli app)
alter table plans enable row level security;
alter table availabilities enable row level security;

drop policy if exists "plans read" on plans;
drop policy if exists "plans write" on plans;
drop policy if exists "avail read" on availabilities;
drop policy if exists "avail write" on availabilities;
drop policy if exists "avail delete" on availabilities;

create policy "plans read" on plans for select using (true);
create policy "plans write" on plans for insert with check (true);

create policy "avail read" on availabilities for select using (true);
create policy "avail write" on availabilities for insert with check (true);
create policy "avail delete" on availabilities for delete using (true);

-- Realtime engedélyezése
alter publication supabase_realtime add table plans;
alter publication supabase_realtime add table availabilities;
