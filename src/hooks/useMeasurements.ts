import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type BodyMeasurement = Database['public']['Tables']['body_measurements']['Row'];
export type BodyMeasurementInsert = Database['public']['Tables']['body_measurements']['Insert'];

export function useMeasurements(clientId: string | undefined) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('client_id', clientId)
      .order('measured_at', { ascending: true });
    if (!error) setMeasurements(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createMeasurement(input: Omit<BodyMeasurementInsert, 'client_id'>) {
    if (!clientId) throw new Error('No hay cliente seleccionado');
    const { error } = await supabase.from('body_measurements').insert({ ...input, client_id: clientId });
    if (error) throw error;
    await refetch();
  }

  async function deleteMeasurement(id: string) {
    const { error } = await supabase.from('body_measurements').delete().eq('id', id);
    if (error) throw error;
    await refetch();
  }

  return { measurements, loading, refetch, createMeasurement, deleteMeasurement };
}
