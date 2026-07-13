-- Adds media URL columns to the existing per-trainer exercises table
-- so imports from exercises_catalog (see 017) can carry their image/gif
-- references. The original 218 seed exercises keep their existing
-- video_url (YouTube) and get NULLs here — the UI should fall back
-- gracefully.

alter table exercises
  add column if not exists image_url text,
  add column if not exists gif_url text;
