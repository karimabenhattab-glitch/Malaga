-- =====================================================================
-- Málaga-Trip 2026: Wunschliste
-- Im Supabase SQL Editor ausführen (sicher für bestehende Projekte).
--
-- Sicherheit für bestehende Projekte:
--  * Es wird NUR die neue Tabelle public.malaga_trip_2026_wishes angelegt.
--  * Alle Policies tragen das Präfix "malaga_trip_2026_" und gelten nur
--    für diese Tabelle. Andere Tabellen, Policies, Rollen, Funktionen
--    und Rechte werden NICHT verändert.
--  * Das Skript ist wiederholbar (idempotent).
--  * Voraussetzung: Postgres 13+ (gen_random_uuid() ist eingebaut,
--    bei Supabase immer der Fall).
-- =====================================================================

begin;

create table if not exists public.malaga_trip_2026_wishes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 60),
  wish       text not null check (char_length(wish) between 1 and 500),
  category   text check (category is null or char_length(category) <= 40),
  created_at timestamptz not null default now()
);

alter table public.malaga_trip_2026_wishes enable row level security;

-- anon darf lesen
drop policy if exists "malaga_trip_2026_wishes_anon_select" on public.malaga_trip_2026_wishes;
create policy "malaga_trip_2026_wishes_anon_select"
  on public.malaga_trip_2026_wishes for select to anon using (true);

-- anon darf einfügen
drop policy if exists "malaga_trip_2026_wishes_anon_insert" on public.malaga_trip_2026_wishes;
create policy "malaga_trip_2026_wishes_anon_insert"
  on public.malaga_trip_2026_wishes for insert to anon with check (true);

-- Bewusst KEINE update/delete-Policies: mit aktivem RLS ist beides für anon verboten.
-- Rechte zusätzlich nur auf dieser Tabelle begrenzen:
revoke all on public.malaga_trip_2026_wishes from anon;
grant select, insert on public.malaga_trip_2026_wishes to anon;

commit;

-- ---------------------------------------------------------------------
-- Kontrolle (optional, separat ausführen):
--   select tablename, rowsecurity from pg_tables
--    where tablename = 'malaga_trip_2026_wishes';        -- rowsecurity = true
--   select policyname, cmd, roles from pg_policies
--    where tablename = 'malaga_trip_2026_wishes';        -- 2 Zeilen: SELECT, INSERT
--
-- Wieder entfernen (nach der Reise, optional; löscht NUR diese Tabelle):
--   drop table if exists public.malaga_trip_2026_wishes;
-- ---------------------------------------------------------------------
