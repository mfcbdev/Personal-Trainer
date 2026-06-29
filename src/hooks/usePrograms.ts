import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

export type Program = Database['public']['Tables']['programs']['Row'];

export function useClientPrograms(clientId: string | undefined) {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (!error) setPrograms(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createProgram(name: string, startDate: string) {
    if (!clientId || !user) throw new Error('Faltan datos');
    const { data, error } = await supabase
      .from('programs')
      .insert({ client_id: clientId, trainer_id: user.id, name, start_date: startDate })
      .select()
      .single();
    if (error) throw error;
    await refetch();
    return data;
  }

  return { programs, loading, refetch, createProgram };
}
