create table weekly_tracking (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  week_start_date date not null,
  sessions_completed integer,
  fatigue integer check (fatigue between 1 and 10),
  recovery integer check (recovery between 1 and 10),
  weight numeric(5, 2),
  nutrition_adherence integer check (nutrition_adherence between 1 and 10),
  satiety integer check (satiety between 1 and 10),
  hydration integer check (hydration between 1 and 10),
  plan_following integer check (plan_following between 1 and 10),
  sleep_hours numeric(4, 1),
  sleep_quality integer check (sleep_quality between 1 and 10),
  stress integer check (stress between 1 and 10),
  motivation integer check (motivation between 1 and 10),
  proudest_moment text,
  created_at timestamptz not null default now(),
  unique (client_id, week_start_date)
);

create index weekly_tracking_client_id_idx on weekly_tracking (client_id);

create table daily_log (
  id uuid primary key default gen_random_uuid(),
  weekly_tracking_id uuid not null references weekly_tracking (id) on delete cascade,
  day_date date not null,
  status daily_status not null default 'in_progress',
  observation text,
  created_at timestamptz not null default now(),
  unique (weekly_tracking_id, day_date)
);

create index daily_log_weekly_tracking_id_idx on daily_log (weekly_tracking_id);
