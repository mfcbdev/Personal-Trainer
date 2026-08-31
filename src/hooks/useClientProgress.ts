import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeekStart, parseLocalDate, toISODate } from '../lib/scheduling';
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

/** One row per week — first entry is oldest, last is the current week. */
export interface WeeklyVolumeComparison {
  label: string; // e.g. "S1" .. "S4"
  weekStartIso: string;
  byMuscle: Record<string, number>;
}

export interface BaseExerciseProgress {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  firstMaxWeight: number;
  currentMaxWeight: number;
  bestReps: number;
  sessionCount: number;
  deltaPct: number | null;
}

type SessionsThisWeekRow = {
  session_exercises: Array<{ sets: number | null; exercise: { muscle_group: string } | null }>;
};

type WeeklyComparisonRow = {
  scheduled_date: string;
  session_exercises: Array<{ sets: number | null; exercise: { muscle_group: string } | null }>;
};

type BaseExerciseLogRow = {
  weight: number | null;
  reps: number | null;
  session_exercises: {
    exercise_id: string;
    sessions: { completed_at: string | null };
    exercises: { name: string; muscle_group: string };
  };
};

export function useClientProgress() {
  const { user } = useAuth();
  const [weightHistory, setWeightHistory] = useState<WeightPoint[]>([]);
  const [compositionHistory, setCompositionHistory] = useState<BodyCompositionPoint[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<VolumeByMuscleGroup[]>([]);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyVolumeComparison[]>([]);
  const [baseExercises, setBaseExercises] = useState<BaseExerciseProgress[]>([]);
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
      .select(
        'id, session_exercises(id, sets, exercise:exercises(muscle_group)), weeks!inner(phases!inner(programs!inner(client_id)))',
      )
      .gte('scheduled_date', weekStartIso)
      .lte('scheduled_date', weekEndIso)
      .eq('completed', true)
      .eq('weeks.phases.programs.client_id', user.id);

    const volumeMap = new Map<string, number>();
    for (const session of (sessionsThisWeek ?? []) as unknown as SessionsThisWeekRow[]) {
      for (const item of session.session_exercises ?? []) {
        const mg = item.exercise?.muscle_group;
        if (!mg) continue;
        volumeMap.set(mg, (volumeMap.get(mg) ?? 0) + (item.sets ?? 0));
      }
    }
    setWeeklyVolume(Array.from(volumeMap.entries()).map(([muscleGroup, sets]) => ({ muscleGroup, sets })));

    // --- Weekly comparison: last 4 calendar weeks, sets per muscle group.
    const fourWeeksBackStart = addDays(weekStart, -21);
    const { data: comparisonSessions } = await supabase
      .from('sessions')
      .select(
        'scheduled_date, session_exercises(id, sets, exercise:exercises(muscle_group)), weeks!inner(phases!inner(programs!inner(client_id)))',
      )
      .gte('scheduled_date', toISODate(fourWeeksBackStart))
      .lte('scheduled_date', weekEndIso)
      .eq('completed', true)
      .eq('weeks.phases.programs.client_id', user.id);

    // Precompute each bucket's [startIso, endIso) once — avoid per-row Date
    // math inside the find(). Use parseLocalDate so the upper bound doesn't
    // slip a day in west-of-UTC (which drops last-day sessions from the chart).
    const bucketRanges: { label: string; weekStartIso: string; endIso: string }[] = [0, 1, 2, 3].map(
      (offset) => {
        const start = addDays(fourWeeksBackStart, offset * 7);
        const startIso = toISODate(start);
        const endIso = toISODate(addDays(parseLocalDate(startIso), 7));
        return { label: `S${offset + 1}`, weekStartIso: startIso, endIso };
      },
    );
    const weekBuckets: WeeklyVolumeComparison[] = bucketRanges.map((r) => ({
      label: r.label,
      weekStartIso: r.weekStartIso,
      byMuscle: {},
    }));

    for (const session of (comparisonSessions ?? []) as unknown as WeeklyComparisonRow[]) {
      if (!session.scheduled_date) continue;
      const bucketIndex = bucketRanges.findIndex(
        (b) => session.scheduled_date >= b.weekStartIso && session.scheduled_date < b.endIso,
      );
      if (bucketIndex < 0) continue;
      const bucket = weekBuckets[bucketIndex];
      for (const item of session.session_exercises ?? []) {
        const mg = item.exercise?.muscle_group;
        if (!mg) continue;
        bucket.byMuscle[mg] = (bucket.byMuscle[mg] ?? 0) + (item.sets ?? 0);
      }
    }
    setWeeklyComparison(weekBuckets);

    // --- Base-exercise progression from set_logs. Restrict to sessions the
    // alumno has finished — a set-log flipped `completed` during an in-flight
    // workout otherwise skews firstMaxWeight and deltaPct with warm-ups.
    const { data: logs } = await supabase
      .from('set_logs')
      .select(
        'weight, reps, ' +
          'session_exercises!inner(exercise_id, sessions!inner(completed, completed_at, weeks!inner(phases!inner(programs!inner(client_id)))), exercises:exercises!inner(name, muscle_group))',
      )
      .eq('completed', true)
      .not('weight', 'is', null)
      .eq('session_exercises.sessions.completed', true)
      .eq('session_exercises.sessions.weeks.phases.programs.client_id', user.id);

    type Aggregate = {
      exerciseId: string;
      name: string;
      muscleGroup: string;
      firstDate: string;
      firstWeight: number;
      currentDate: string;
      currentMaxWeight: number;
      bestReps: number;
      sessionKeys: Set<string>;
    };
    const byExercise = new Map<string, Aggregate>();

    for (const row of (logs ?? []) as unknown as BaseExerciseLogRow[]) {
      const weight = row.weight;
      if (weight == null) continue;
      const se = row.session_exercises;
      const exId = se.exercise_id;
      const completedAt = se.sessions.completed_at ?? '';
      const existing = byExercise.get(exId);

      if (!existing) {
        byExercise.set(exId, {
          exerciseId: exId,
          name: se.exercises.name,
          muscleGroup: se.exercises.muscle_group,
          firstDate: completedAt,
          firstWeight: weight,
          currentDate: completedAt,
          currentMaxWeight: weight,
          bestReps: row.reps ?? 0,
          sessionKeys: new Set([completedAt]),
        });
      } else {
        if (completedAt && (!existing.firstDate || completedAt < existing.firstDate)) {
          existing.firstDate = completedAt;
          existing.firstWeight = weight;
        }
        if (completedAt && completedAt > existing.currentDate) {
          existing.currentDate = completedAt;
          existing.currentMaxWeight = weight;
        } else if (completedAt === existing.currentDate && weight > existing.currentMaxWeight) {
          existing.currentMaxWeight = weight;
        }
        if ((row.reps ?? 0) > existing.bestReps) existing.bestReps = row.reps ?? 0;
        if (completedAt) existing.sessionKeys.add(completedAt);
      }
    }

    const baseProgress: BaseExerciseProgress[] = Array.from(byExercise.values())
      .map((a) => ({
        exerciseId: a.exerciseId,
        name: a.name,
        muscleGroup: a.muscleGroup,
        firstMaxWeight: a.firstWeight,
        currentMaxWeight: a.currentMaxWeight,
        bestReps: a.bestReps,
        sessionCount: a.sessionKeys.size,
        deltaPct:
          a.firstWeight > 0
            ? Math.round(((a.currentMaxWeight - a.firstWeight) / a.firstWeight) * 1000) / 10
            : null,
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount);
    setBaseExercises(baseProgress);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    weightHistory,
    compositionHistory,
    weeklyVolume,
    weeklyComparison,
    baseExercises,
    loading,
    refetch,
  };
}
