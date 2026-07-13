import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type WeeklyTracking = Database['public']['Tables']['weekly_tracking']['Row'];

export function useClientTrackingHistory(clientId: string | undefined) {
  const [rows, setRows] = useState<WeeklyTracking[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('weekly_tracking')
      .select('*')
      .eq('client_id', clientId)
      .order('week_start_date', { ascending: true });
    if (!error) setRows(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rows, loading, refetch };
}
