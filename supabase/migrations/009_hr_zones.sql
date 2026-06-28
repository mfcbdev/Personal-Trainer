create table hr_zones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  zone_name text not null,
  pct_min numeric(5, 2),
  pct_max numeric(5, 2),
  bpm_min integer,
  bpm_max integer,
  effect text,
  created_at timestamptz not null default now()
);

create index hr_zones_client_id_idx on hr_zones (client_id);
