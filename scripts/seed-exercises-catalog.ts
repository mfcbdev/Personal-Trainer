// Reads <dataset>/data/exercises.json, applies the field mapping, and
// upserts every record into exercises_catalog via the service role
// (bypasses RLS). Idempotent — safe to re-run.
//
// Usage:
//   npm run seed:catalog
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.

import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  adminClient,
  DATASET_PATH,
  mapMovementType,
  mapZone,
  publicMediaUrl,
  type MovementType,
  type Zone,
} from './_shared';

interface DatasetRecord {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: Record<string, string>;
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  media_id: string;
  image: string;    // "images/0001-2gPfomN.jpg"
  gif_url: string;  // "videos/0001-2gPfomN.gif"
  created_at: string;
}

interface CatalogRow {
  id: string;
  name: string;
  name_es: string | null;
  category: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  instructions_en: string | null;
  instructions_es: string | null;
  zone: Zone;
  movement_type: MovementType;
  image_url: string | null;
  gif_url: string | null;
}

function transform(record: DatasetRecord): CatalogRow {
  return {
    id: record.id,
    name: record.name,
    name_es: null, // no ES name in source; kept in schema for later hand-translation
    category: record.category,
    equipment: record.equipment,
    target: record.target,
    muscle_group: record.muscle_group,
    secondary_muscles: record.secondary_muscles ?? [],
    instructions_en: record.instructions?.en ?? null,
    instructions_es: record.instructions?.es ?? null,
    zone: mapZone(record.category),
    movement_type: mapMovementType(record.category, record.target),
    image_url: record.image ? publicMediaUrl('images', basename(record.image)) : null,
    gif_url: record.gif_url ? publicMediaUrl('videos', basename(record.gif_url)) : null,
  };
}

async function upsertInBatches(rows: CatalogRow[], batchSize: number) {
  let done = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await adminClient
      .from('exercises_catalog')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch starting at ${i} failed: ${error.message}`);
      throw error;
    }
    done += batch.length;
    console.log(`  ${done}/${rows.length} upserted`);
  }
}

async function main() {
  const jsonPath = join(DATASET_PATH, 'data', 'exercises.json');
  console.log(`Reading ${jsonPath}`);
  const raw = readFileSync(jsonPath, 'utf8');
  const records = JSON.parse(raw) as DatasetRecord[];
  console.log(`Parsed ${records.length} records`);

  const rows = records.map(transform);

  // Sanity: bail early if a mapping ever produced an unexpected value.
  const validZones = new Set(['upper_body', 'lower_body', 'core']);
  const validMovements = new Set(['push', 'pull', 'legs', 'core', 'cardio']);
  for (const row of rows) {
    if (!validZones.has(row.zone)) throw new Error(`Bad zone "${row.zone}" for ${row.id}`);
    if (!validMovements.has(row.movement_type)) throw new Error(`Bad movement_type "${row.movement_type}" for ${row.id}`);
  }

  await upsertInBatches(rows, 200);
  console.log('\nCatalog seed complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
