# scripts/

One-off Node/TS scripts run via `tsx`. Nothing here ships to the browser.

## exercises-catalog seed

Integrates the [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
(1,324 records) into a global `exercises_catalog` table plus media in a public Supabase Storage
bucket. Trainers can then import any catalog exercise into their per-trainer `exercises` library
via the `import_catalog_exercise` RPC. **The existing 218-exercise per-trainer seed is untouched.**

### Prerequisites

1. Download and extract the dataset locally. Default expected path (Windows):
   `C:\Users\<you>\Downloads\exercises-dataset-main\exercises-dataset-main`.
   Override with `EXERCISES_DATASET_PATH` in `.env` if it lives elsewhere.
2. Add your Supabase **service_role** key to `.env` as `SUPABASE_SERVICE_ROLE_KEY`. Get it from
   Supabase → Project Settings → API → *service_role secret*. **Never commit it.** `.env` is
   already in `.gitignore`.
3. Run migrations **017** and **018** in the Supabase SQL Editor.

### Run

```bash
npm run seed:media     # ~1,324 images + ~1,324 GIFs → exercises-media bucket (~138 MB)
npm run seed:catalog   # 1,324 rows → exercises_catalog (batched upserts, ~7 batches of 200)
```

Both scripts are idempotent — re-running skips already-uploaded files and upserts by primary key.

### What the mapping does

- `zone` is derived from `category`:
  chest/back/shoulders/upper arms/lower arms/neck → `upper_body`;
  upper legs/lower legs → `lower_body`;
  waist/cardio → `core`.
- `movement_type` is derived from `category` + `target`:
  chest/shoulders → `push`; upper arms → `push` if triceps else `pull`; back/lower arms → `pull`;
  upper legs/lower legs → `legs`; waist/neck → `core`; cardio → `cardio`.
- `image_url` / `gif_url` point at the public Storage bucket, e.g.
  `https://<project>.supabase.co/storage/v1/object/public/exercises-media/images/0001-2gPfomN.jpg`.

### Notes / deviations from the original integration prompt

- The RPC takes only `p_catalog_id` — trainer_id is derived from `auth.uid()` inside the function
  and rejected unless the caller's profile has `role = 'trainer'`. Passing an arbitrary trainer_id
  would have let anyone pollute another trainer's library.
- `name_es` is provisioned in the schema but stays `NULL` at import time. The dataset has Spanish
  *instructions* but no Spanish name. Trainers can hand-translate later; the RPC picks
  `coalesce(name_es, name)` on import.
- Storage bucket is created public so `<img>` tags can hit it without auth.
- ~138 MB fits the free-tier 1 GB storage quota, but each project uses egress budget too — check
  Supabase's usage dashboard before running against production.
