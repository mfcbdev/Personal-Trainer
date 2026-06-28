create type user_role as enum ('trainer', 'client');
create type program_status as enum ('draft', 'active', 'completed');
create type phase_type as enum ('G', 'R', 'O', 'W');
create type exercise_zone as enum ('upper_body', 'lower_body', 'core');
create type movement_type as enum ('push', 'pull', 'legs', 'core', 'cardio');
create type frequency_scale as enum ('never', 'sometimes', 'often', 'always');
create type daily_status as enum ('achieved', 'in_progress', 'missed');
create type subscription_plan as enum ('free', 'pro', 'premium');
