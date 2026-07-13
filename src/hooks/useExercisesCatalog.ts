import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database, ExerciseZone, MovementType } from '../lib/database.types';

type CatalogRow = Database['public']['Tables']['exercises_catalog']['Row'];

// Lightweight row for the grid — omits the ~2 KB instructions/secondary_muscles per
// row so 1,324 entries load in one query without blowing up bandwidth. Full detail
// (instructions_es, secondary_muscles, ...) is fetched lazily via useCatalogExercise.
export type CatalogListRow = Pick<
  CatalogRow,
  | 'id'
  | 'name'
  | 'name_es'
  | 'category'
  | 'equipment'
  | 'target'
  | 'muscle_group'
  | 'zone'
  | 'movement_type'
  | 'image_url'
  | 'gif_url'
>;

export interface CatalogFilterState {
  search: string;
  category: string | 'all';
  equipment: string | 'all';
  zone: ExerciseZone | 'all';
  movementType: MovementType | 'all';
}

export const defaultCatalogFilters: CatalogFilterState = {
  search: '',
  category: 'all',
  equipment: 'all',
  zone: 'all',
  movementType: 'all',
};

const LIST_COLUMNS =
  'id, name, name_es, category, equipment, target, muscle_group, zone, movement_type, image_url, gif_url';

export function useExercisesCatalog() {
  const [rows, setRows] = useState<CatalogListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Supabase caps a single query at 1,000 rows by default; the dataset has 1,324.
    // Ranged fetch in two pages keeps us under the cap without a schema-level
    // config change.
    const collected: CatalogListRow[] = [];
    const pageSize = 1000;
    let page = 0;
    while (true) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error: pageError } = await supabase
        .from('exercises_catalog')
        .select(LIST_COLUMNS)
        .order('name', { ascending: true })
        .range(from, to);
      if (pageError) {
        setError(pageError.message);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as unknown as CatalogListRow[];
      collected.push(...rows);
      if (rows.length < pageSize) break;
      page += 1;
    }
    setRows(collected);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const facets = useMemo(() => {
    const categories = new Set<string>();
    const equipments = new Set<string>();
    for (const r of rows) {
      categories.add(r.category);
      equipments.add(r.equipment);
    }
    return {
      categories: [...categories].sort(),
      equipments: [...equipments].sort(),
    };
  }, [rows]);

  async function importCatalog(catalogId: string): Promise<string> {
    setImportingId(catalogId);
    try {
      const { data, error: rpcError } = await supabase.rpc('import_catalog_exercise', {
        p_catalog_id: catalogId,
      });
      if (rpcError) throw rpcError;
      return data as unknown as string;
    } finally {
      setImportingId(null);
    }
  }

  return { rows, facets, loading, error, refetch, importCatalog, importingId };
}
