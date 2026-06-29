import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgramBuilder } from './useProgramBuilder';

function useActiveProgramId() {
  const { user } = useAuth();
  const [programId, setProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('programs')
      .select('id')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    setProgramId(data?.id ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { programId, loading, refetch };
}

export function useActiveProgram() {
  const { programId, loading: idLoading } = useActiveProgramId();
  const builder = useProgramBuilder(programId ?? undefined);

  return {
    ...builder,
    loading: idLoading || builder.loading,
    hasActiveProgram: programId !== null,
  };
}
