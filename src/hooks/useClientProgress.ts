import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeekStart, toISODate } from '../lib/scheduling';
import { addDays } from 'date-fns';

export interface WeightPoint {
  date: string;
  weight: number;
  source: 'measurement' | 'tracking';
}

export interface BodyCompositionPoint {
  date: string;
  fatMass: number;
  leanMass: number;
}

export interface VolumeByMuscleGroup {
  muscleGroup: string;
  sets: number;
}

export function useClientProgress() {
  const { user } = useAuth();
  const [weightHistory, setWeightHistory] = useState<WeightPoint[]>([]);
  const [compositionHistory, setCompositionHistory] = useState<BodyCompositionPoint[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<VolumeByMuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: measurements }, { data: tracking }] = await Promise.all([
      supabase
        .from('body_measurements')
        .select('measured_at, weight, fat_mass, lean_mass')
        .eq('client_id', user.id)
        .order('measured_at', { ascending: true }),
      supabase
        .from('weekly_tracking')
        .select('week_start_date, weight')
        .eq('client_id', user.id)
        .not('weight', 'is', null)
        .order('week_start_date', { ascending: true }),
    ]);

    const combinedWeight: WeightPoint[] = [];
    for (const m of measurements ?? []) {
      if (m.weight != null) combinedWeight.push({ date: m.measured_at, weight: m.weight, source: 'measurement' });
    }
    for (const t of tracking ?? []) {
      if (t.weight != null) combinedWeight.push({ date: t.week_start_date, weight: t.weight, source: 'tracking' });
    }
    combinedWeight.sort((a, b) => (a.date < b.date ? -1 : 1));
    setWeightHistory(combinedWeight);

    const composition: BodyCompositionPoint[] = (measurements ?? [])
      .filter((m) => m.fat_mass != null && m.lean_mass != null)
      .map((m) => ({ date: m.measured_at, fatMass: m.fat_mass as number, leanMass: m.lean_mass as number }));
    setCompositionHistory(composition);

    const weekStart = getCurrentWeekStart();
    const weekEnd = addDays(weekStart, 6);
    const weekStartIso = toISODate(weekStart);
    const weekEndIso = toISODate(weekEnd);

    const { data: sessionsThisWeek } = await supabase
      .from('sessions')
      .select('id, session_exercises(id, sets, exercise:exercises(muscle_group)), weeks!inner(phases!inner(programs!inner(client_id)))')
      .gte('scheduled_date', weekStartIso)
      .lte('scheduled_date', weekEndIso)
      .eq('completed', true)
      .eq('weeks.phases.programs.client_id', user.id);

    const volumeMap = new Map<string, number>();
    for (const session of (sessionsThisWeek ?? []) as unknown as Array<{
      session_exercises: Array<{ sets: number | null; exercise: { muscle_group: string } | null }>;
    }>) {
      for (const item of session.session_exercises ?? []) {
        const mg = item.exercise?.muscle_group;
        if (!mg) continue;
        volumeMap.set(mg, (volumeMap.get(mg) ?? 0) + (item.sets ?? 0));
      }
    }
    setWeeklyVolume(Array.from(volumeMap.entries()).map(([muscleGroup, sets]) => ({ muscleGroup, sets })));

    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { weightHistory, compositionHistory, weeklyVolume, loading, refetch };
}
