-- profiles.last_seen_at powers the "última conexión" column on the coach's
-- client list (Notion 7.1). We update it best-effort from AuthContext on
-- every profile fetch, so any session load / route change refreshes it.
-- Safe to re-run.

alter table profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists profiles_last_seen_at_idx on profiles (last_seen_at desc nulls last);
