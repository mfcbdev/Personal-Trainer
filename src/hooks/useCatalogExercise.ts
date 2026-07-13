import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type CatalogExercise = Database['public']['Tables']['exercises_catalog']['Row'];

/** Fetches a single catalog row with all columns (instructions, secondary_muscles). */
export function useCatalogExercise(id: string | null) {
  const [data, setData] = useState<CatalogExercise | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: row } = await supabase.from('exercises_catalog').select('*').eq('id', id).single();
      if (!cancelled) {
        setData(row);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading };
}
