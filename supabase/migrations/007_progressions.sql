create table progressions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  phase_id uuid not null references phases (id) on delete cascade,
  muscle_group text not null,
  week_number integer not null,
  target_sets integer,
  target_reps text,
  target_intensity text,
  created_at timestamptz not null default now()
);

create index progressions_program_id_idx on progressions (program_id);
create index progressions_phase_id_idx on progressions (phase_id);
