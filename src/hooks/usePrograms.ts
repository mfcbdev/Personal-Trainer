import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database, ProgramTemplateType } from '../lib/database.types';

export type Program = Database['public']['Tables']['programs']['Row'];

export interface ProgramCreateInput {
  name: string;
  startDate: string;
  templateType: ProgramTemplateType | null;
}

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

  async function createProgram(input: ProgramCreateInput) {
    if (!clientId || !user) throw new Error('Faltan datos');
    const { data, error } = await supabase
      .from('programs')
      .insert({
        client_id: clientId,
        trainer_id: user.id,
        name: input.name,
        start_date: input.startDate,
        template_type: input.templateType,
      })
      .select()
      .single();
    if (error) throw error;
    await refetch();
    return data;
  }

  return { programs, loading, refetch, createProgram };
}
