create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  trainer_id uuid references profiles (id) on delete cascade,
  role user_role not null,
  full_name text,
  email text,
  phone text,
  nationality text,
  sex text,
  birth_date date,
  objectives text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index profiles_trainer_id_idx on profiles (trainer_id);

-- on_auth_user_created trigger (see 012_triggers.sql) inserts a row here,
-- reading role / trainer_id / full_name from auth.users.raw_user_meta_data.
