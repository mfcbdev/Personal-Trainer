create table exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  muscle_group text not null,
  zone exercise_zone not null,
  movement_type movement_type not null,
  video_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index exercises_trainer_id_idx on exercises (trainer_id);
create index exercises_muscle_group_idx on exercises (muscle_group);
