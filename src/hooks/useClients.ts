import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type ClientProfile = Database['public']['Tables']['profiles']['Row'];

export function useClients() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('full_name', { ascending: true });
    if (!error) setClients(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { clients, loading, refetch };
}

export function useClient(clientId: string | undefined) {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', clientId).single();
    if (!error) setClient(data);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { client, loading, refetch };
}
