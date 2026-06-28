create table cardiovascular_evaluation (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  resting_hr integer,
  age integer,
  max_hr integer,
  created_at timestamptz not null default now()
);

create index cardiovascular_evaluation_client_id_idx on cardiovascular_evaluation (client_id);

create table body_measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  measured_at date not null default current_date,
  weight numeric(5, 2),
  height numeric(5, 2),
  bicipital numeric(5, 2),
  tricipital numeric(5, 2),
  subscapular numeric(5, 2),
  suprailiac numeric(5, 2),
  body_fat_pct numeric(5, 2),
  fat_mass numeric(5, 2),
  lean_mass numeric(5, 2),
  bmi numeric(5, 2),
  created_at timestamptz not null default now()
);

create index body_measurements_client_id_idx on body_measurements (client_id);
