-- Málaga-Trip 2026: Wunschliste
-- Im Supabase SQL Editor ausführen.

create table if not exists public.malaga_trip_2026_wishes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 60),
  wish       text not null check (char_length(wish) between 1 and 500),
  category   text check (category is null or char_length(category) <= 40),
  created_at timestamptz not null default now()
);

alter table public.malaga_trip_2026_wishes enable row level security;

-- anon darf lesen und einfügen
drop policy if exists "malaga_trip_2026_wishes_anon_select" on public.malaga_trip_2026_wishes;
create policy "malaga_trip_2026_wishes_anon_select"
  on public.malaga_trip_2026_wishes for select to anon using (true);

drop policy if exists "malaga_trip_2026_wishes_anon_insert" on public.malaga_trip_2026_wishes;
create policy "malaga_trip_2026_wishes_anon_insert"
  on public.malaga_trip_2026_wishes for insert to anon with check (true);

-- Bewusst KEINE update/delete-Policies: mit aktivem RLS ist beides für anon verboten.
-- Zusätzlich Rechte explizit begrenzen:
revoke all on public.malaga_trip_2026_wishes from anon;
grant select, insert on public.malaga_trip_2026_wishes to anon;
