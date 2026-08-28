-- Tighten the exercise-media bucket policies so only trainers can write.
-- The original 024 policies only checked that the first path segment
-- matched auth.uid(), so any authenticated alumno could upload arbitrary
-- files under '<their-uid>/…' and get a permanent public URL.

create or replace function is_trainer(p_uid uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = p_uid and role = 'trainer'
  );
$$;

drop policy if exists exercise_media_upload on storage.objects;
drop policy if exists exercise_media_update on storage.objects;
drop policy if exists exercise_media_delete on storage.objects;

create policy exercise_media_upload on storage.objects
  for insert with check (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and is_trainer(auth.uid())
  );

create policy exercise_media_update on storage.objects
  for update using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and is_trainer(auth.uid())
  );

create policy exercise_media_delete on storage.objects
  for delete using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and is_trainer(auth.uid())
  );
