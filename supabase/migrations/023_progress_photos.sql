-- Registro fotográfico: the alumno's three-pose progress photos (frente,
-- perfil, espalda). Files live in a private Supabase Storage bucket keyed
-- by client_id; the DB row is the authoritative record with metadata.

create type photo_pose as enum ('frente', 'perfil', 'espalda');

create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  pose photo_pose not null,
  storage_path text not null,
  taken_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index progress_photos_client_id_idx on progress_photos (client_id);
create index progress_photos_taken_at_idx on progress_photos (taken_at desc);

alter table progress_photos enable row level security;

create policy progress_photos_all on progress_photos
  for all using (client_id = auth.uid() or is_trainer_for_client(client_id))
  with check (client_id = auth.uid() or is_trainer_for_client(client_id));

-- Private bucket — files are read via signed URLs. Path shape:
-- <client_id>/<photo_id>.<ext>
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage policies: the first path segment must be the caller's uid, OR
-- they must be the trainer for that client_id.
create policy progress_photos_upload on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_trainer_for_client(((storage.foldername(name))[1])::uuid)
    )
  );

create policy progress_photos_select on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_trainer_for_client(((storage.foldername(name))[1])::uuid)
    )
  );

create policy progress_photos_delete on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_trainer_for_client(((storage.foldername(name))[1])::uuid)
    )
  );
