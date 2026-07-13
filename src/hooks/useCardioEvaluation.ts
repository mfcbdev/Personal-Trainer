import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type CardioEval = Database['public']['Tables']['cardiovascular_evaluation']['Row'];

export function useCardioEvaluation(clientId: string | undefined) {
  const [evaluation, setEvaluation] = useState<CardioEval | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data } = await supabase
      .from('cardiovascular_evaluation')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setEvaluation(data ?? null);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { evaluation, loading, refetch };
}
