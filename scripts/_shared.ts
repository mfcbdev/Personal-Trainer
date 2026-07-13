import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Minimal env loader so we don't need to add dotenv as a runtime dep.
// Reads KEY=value lines from .env at the repo root; ignores comments and blanks.
function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env — rely on real env vars.
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL (or SUPABASE_URL) in .env');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('  Get it from Supabase → Project Settings → API → service_role secret');
  console.error('  Never commit it. .env is already gitignored.');
  process.exit(1);
}

export const SUPABASE_BASE_URL = SUPABASE_URL;

export const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const DATASET_PATH =
  process.env.EXERCISES_DATASET_PATH ??
  'C:\\Users\\iMati\\Downloads\\exercises-dataset-main\\exercises-dataset-main';

export const BUCKET = 'exercises-media';
export const IMAGES_PREFIX = 'images';
export const VIDEOS_PREFIX = 'videos';

// --- Field mapping (category → zone, category+target → movement_type) ---

export type Zone = 'upper_body' | 'lower_body' | 'core';
export type MovementType = 'push' | 'pull' | 'legs' | 'core' | 'cardio';

const ZONE_BY_CATEGORY: Record<string, Zone> = {
  chest: 'upper_body',
  back: 'upper_body',
  shoulders: 'upper_body',
  'upper arms': 'upper_body',
  'lower arms': 'upper_body',
  neck: 'upper_body',
  'upper legs': 'lower_body',
  'lower legs': 'lower_body',
  waist: 'core',
  cardio: 'core',
};

export function mapZone(category: string): Zone {
  return ZONE_BY_CATEGORY[category.toLowerCase()] ?? 'core';
}

export function mapMovementType(category: string, target: string): MovementType {
  const c = category.toLowerCase();
  const t = target.toLowerCase();

  if (c === 'cardio') return 'cardio';
  if (c === 'chest') return 'push';
  if (c === 'shoulders') return 'push';
  if (c === 'upper arms') return t.includes('triceps') ? 'push' : 'pull';
  if (c === 'back') return 'pull';
  if (c === 'lower arms') return 'pull';
  if (c === 'upper legs' || c === 'lower legs') return 'legs';
  if (c === 'waist' || c === 'neck') return 'core';
  return 'core';
}

export function publicMediaUrl(kind: 'images' | 'videos', filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${kind}/${filename}`;
}

// --- Concurrency helper ---

export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}
