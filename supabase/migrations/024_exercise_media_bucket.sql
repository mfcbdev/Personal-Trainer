-- Public bucket for trainer-uploaded exercise videos. Kept public so the
-- <video> element can stream without signed-URL rotation. Path shape:
-- <trainer_id>/<exercise_id>.<ext>
insert into storage.buckets (id, name, public)
values ('exercise-media', 'exercise-media', true)
on conflict (id) do nothing;

-- Only the owning trainer writes to their own folder. Anyone can read
-- since the bucket is public (SELECT policy still needed to allow it).
create policy exercise_media_upload on storage.objects
  for insert with check (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exercise_media_update on storage.objects
  for update using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exercise_media_delete on storage.objects
  for delete using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exercise_media_select on storage.objects
  for select using (bucket_id = 'exercise-media');
