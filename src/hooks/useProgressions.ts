import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Progression = Database['public']['Tables']['progressions']['Row'];

export function useProgressions(programId: string | undefined, phaseId: string | undefined) {
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!phaseId) return;
    setLoading(true);
    const { data, error } = await supabase.from('progressions').select('*').eq('phase_id', phaseId);
    if (!error) setProgressions(data ?? []);
    setLoading(false);
  }, [phaseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function upsertCell(
    muscleGroup: string,
    weekNumber: number,
    fields: { target_sets?: number | null; target_reps?: string | null; target_intensity?: string | null },
  ) {
    if (!programId || !phaseId) return;
    const existing = progressions.find((p) => p.muscle_group === muscleGroup && p.week_number === weekNumber);

    const { data, error } = await supabase
      .from('progressions')
      .upsert(
        {
          id: existing?.id,
          program_id: programId,
          phase_id: phaseId,
          muscle_group: muscleGroup,
          week_number: weekNumber,
          target_sets: fields.target_sets ?? existing?.target_sets ?? null,
          target_reps: fields.target_reps ?? existing?.target_reps ?? null,
          target_intensity: fields.target_intensity ?? existing?.target_intensity ?? null,
        },
        { onConflict: 'phase_id,muscle_group,week_number' },
      )
      .select()
      .single();
    if (error) throw error;

    setProgressions((prev) => {
      const others = prev.filter((p) => !(p.muscle_group === muscleGroup && p.week_number === weekNumber));
      return [...others, data];
    });
  }

  return { progressions, loading, refetch, upsertCell };
}
