create table programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  trainer_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  status program_status not null default 'draft',
  start_date date not null,
  created_at timestamptz not null default now()
);

create index programs_client_id_idx on programs (client_id);
create index programs_trainer_id_idx on programs (trainer_id);

-- order is immutable: G=1, R=2, O=3, W=4. Rows are auto-inserted by
-- on_program_created (see 012_triggers.sql).
create table phases (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  type phase_type not null,
  "order" integer not null,
  created_at timestamptz not null default now(),
  unique (program_id, type)
);

create index phases_program_id_idx on phases (program_id);

create table weeks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references phases (id) on delete cascade,
  week_number integer not null,
  is_deload boolean not null default false,
  created_at timestamptz not null default now()
);

create index weeks_phase_id_idx on weeks (phase_id);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks (id) on delete cascade,
  session_number integer not null,
  name text,
  scheduled_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index sessions_week_id_idx on sessions (week_id);
create index sessions_scheduled_date_idx on sessions (scheduled_date);

create table session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete cascade,
  order_index integer not null default 0,
  sets integer,
  reps text,
  weight numeric(6, 2),
  rir_rpe text,
  rest text,
  notes text,
  created_at timestamptz not null default now()
);

create index session_exercises_session_id_idx on session_exercises (session_id);
create index session_exercises_exercise_id_idx on session_exercises (exercise_id);

-- Hevy-style per-set logging captured during an active workout session.
create table set_logs (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references session_exercises (id) on delete cascade,
  set_number integer not null,
  reps integer,
  weight numeric(6, 2),
  rpe numeric(3, 1),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index set_logs_session_exercise_id_idx on set_logs (session_exercise_id);
