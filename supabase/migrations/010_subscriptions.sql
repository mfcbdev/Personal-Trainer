create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles (id) on delete cascade,
  plan subscription_plan not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (trainer_id)
);

create index subscriptions_trainer_id_idx on subscriptions (trainer_id);
