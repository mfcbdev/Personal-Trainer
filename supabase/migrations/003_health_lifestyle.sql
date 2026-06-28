create table health_evaluation (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  cardiac_condition boolean not null default false,
  cardiac_detail text,
  pathology boolean not null default false,
  pathology_detail text,
  bone_joint_condition boolean not null default false,
  bone_joint_detail text,
  medication boolean not null default false,
  medication_detail text,
  additional_notes text,
  created_at timestamptz not null default now()
);

create index health_evaluation_client_id_idx on health_evaluation (client_id);

create table lifestyle_evaluation (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  smoking frequency_scale not null default 'never',
  alcohol frequency_scale not null default 'never',
  nutrition frequency_scale not null default 'sometimes',
  physical_activity frequency_scale not null default 'sometimes',
  other_activities boolean not null default false,
  other_activities_detail text,
  created_at timestamptz not null default now()
);

create index lifestyle_evaluation_client_id_idx on lifestyle_evaluation (client_id);
