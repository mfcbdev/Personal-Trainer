// Uploads every JPG in <dataset>/images and every GIF in <dataset>/videos
// into the `exercises-media` Supabase Storage bucket. Idempotent — skips
// files that are already present. Concurrency: 10.
//
// Usage:
//   npm run seed:media
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (see scripts/README.md).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { adminClient, BUCKET, DATASET_PATH, IMAGES_PREFIX, VIDEOS_PREFIX, runWithConcurrency } from './_shared';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png']);
const VIDEO_EXT = new Set(['.gif']);

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

async function ensureBucket() {
  const { data: buckets, error } = await adminClient.storage.listBuckets();
  if (error) throw error;
  if (buckets.some((b) => b.name === BUCKET)) return;

  const { error: createError } = await adminClient.storage.createBucket(BUCKET, { public: true });
  if (createError) throw createError;
  console.log(`Created bucket "${BUCKET}" (public).`);
}

async function listExisting(prefix: string): Promise<Set<string>> {
  const existing = new Set<string>();
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const { data, error } = await adminClient.storage.from(BUCKET).list(prefix, { limit, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const entry of data) existing.add(entry.name);
    if (data.length < limit) break;
    offset += limit;
  }
  return existing;
}

async function uploadFolder(localDir: string, remotePrefix: string, allowedExt: Set<string>) {
  const stats = statSync(localDir);
  if (!stats.isDirectory()) {
    console.error(`Not a directory: ${localDir}`);
    process.exit(1);
  }

  const files = readdirSync(localDir).filter((f) => allowedExt.has(extname(f).toLowerCase()));
  console.log(`\n${remotePrefix}/: ${files.length} local files`);

  const existing = await listExisting(remotePrefix);
  const todo = files.filter((f) => !existing.has(f));
  console.log(`  ${existing.size} already uploaded, ${todo.length} to upload`);

  let done = 0;
  let failed = 0;
  await runWithConcurrency(todo, 10, async (filename) => {
    const buffer = readFileSync(join(localDir, filename));
    const contentType = MIME_BY_EXT[extname(filename).toLowerCase()] ?? 'application/octet-stream';
    const { error } = await adminClient.storage
      .from(BUCKET)
      .upload(`${remotePrefix}/${filename}`, buffer, { contentType, upsert: false });
    if (error) {
      failed++;
      console.error(`  ✗ ${filename}: ${error.message}`);
    } else {
      done++;
      if (done % 50 === 0 || done === todo.length) {
        console.log(`  ${done}/${todo.length} uploaded`);
      }
    }
  });

  console.log(`${remotePrefix}/: done. uploaded=${done} skipped=${existing.size} failed=${failed}`);
  return { done, failed };
}

async function main() {
  await ensureBucket();
  const images = await uploadFolder(join(DATASET_PATH, 'images'), IMAGES_PREFIX, IMAGE_EXT);
  const videos = await uploadFolder(join(DATASET_PATH, 'videos'), VIDEOS_PREFIX, VIDEO_EXT);

  const totalFailed = images.failed + videos.failed;
  if (totalFailed > 0) {
    console.error(`\n${totalFailed} uploads failed. Re-run to retry.`);
    process.exit(1);
  }
  console.log('\nAll media uploaded.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
