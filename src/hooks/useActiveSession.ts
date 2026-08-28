import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Exercise } from './useExercises';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionExercise = Database['public']['Tables']['session_exercises']['Row'];
type SetLog = Database['public']['Tables']['set_logs']['Row'];
type SetLogUpdate = Database['public']['Tables']['set_logs']['Update'];

export interface GhostValue {
  reps: number | null;
  weight: number | null;
}

export interface SetUpdateFields {
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  completed?: boolean;
}

/**
 * Item as rendered on the active session page. Strength items have `exercise`
 * populated and use set_logs / ghosts; cardio items (item_type != 'strength')
 * have `exercise = null` and completion lives on session_exercises.completed.
 */
export interface ActiveSessionExercise extends SessionExercise {
  exercise: Exercise | null;
  logs: SetLog[];
  ghosts: GhostValue[];
}

export function useActiveSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<ActiveSessionExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);

    const { data: sessionRow } = await supabase.from('sessions').select('*').eq('id', sessionId).single();
    setSession(sessionRow ?? null);

    const { data: rows } = await supabase
      .from('session_exercises')
      .select('*, exercise:exercises(*)')
      .eq('session_id', sessionId)
      .order('order_index', { ascending: true });

    const sessionExercises = (rows as unknown as (SessionExercise & { exercise: Exercise })[]) ?? [];

    const withLogsAndGhosts = await Promise.all(
      sessionExercises.map(async (se) => {
        // Cardio items have no set_logs and no ghost lookup — bail early.
        if (se.item_type !== 'strength' || !se.exercise_id) {
          return { ...se, logs: [], ghosts: [] as GhostValue[] };
        }

        const { data: logs } = await supabase
          .from('set_logs')
          .select('*')
          .eq('session_exercise_id', se.id)
          .order('set_number', { ascending: true });

        const { data: priorSessionExercise } = await supabase
          .from('session_exercises')
          .select('id, sessions!inner(completed, completed_at)')
          .eq('exercise_id', se.exercise_id)
          .neq('session_id', sessionId)
          .eq('sessions.completed', true)
          .order('completed_at', { ascending: false, foreignTable: 'sessions' })
          .limit(1)
          .maybeSingle();

        let ghosts: GhostValue[] = [];
        if (priorSessionExercise) {
          const { data: priorLogs } = await supabase
            .from('set_logs')
            .select('set_number, reps, weight')
            .eq('session_exercise_id', priorSessionExercise.id)
            .order('set_number', { ascending: true });
          ghosts = (priorLogs ?? []).map((l) => ({ reps: l.reps, weight: l.weight }));
        }

        return { ...se, logs: logs ?? [], ghosts };
      }),
    );

    setItems(withLogsAndGhosts);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function upsertSetLog(
    sessionExerciseId: string,
    setNumber: number,
    fields: SetLogUpdate,
  ) {
    const item = items.find((i) => i.id === sessionExerciseId);
    const existing = item?.logs.find((l) => l.set_number === setNumber);

    if (existing) {
      const { error } = await supabase.from('set_logs').update(fields).eq('id', existing.id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) =>
          i.id === sessionExerciseId
            ? { ...i, logs: i.logs.map((l) => (l.id === existing.id ? { ...l, ...fields } : l)) }
            : i,
        ),
      );
    } else {
      const { data, error } = await supabase
        .from('set_logs')
        .insert({ session_exercise_id: sessionExerciseId, set_number: setNumber, ...fields })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) => (i.id === sessionExerciseId ? { ...i, logs: [...i.logs, data] } : i)),
      );
    }
  }

  async function addSet(sessionExerciseId: string) {
    const item = items.find((i) => i.id === sessionExerciseId);
    const nextSetNumber = (item?.logs.at(-1)?.set_number ?? 0) + 1;
    await upsertSetLog(sessionExerciseId, nextSetNumber, { completed: false });
  }

  async function removeSetLog(sessionExerciseId: string, logId: string) {
    const { error } = await supabase.from('set_logs').delete().eq('id', logId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((i) => (i.id === sessionExerciseId ? { ...i, logs: i.logs.filter((l) => l.id !== logId) } : i)),
    );
  }

  async function completeWorkout() {
    if (!sessionId) return;
    const { error } = await supabase
      .from('sessions')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
    await refetch();
  }

  async function setCardioCompleted(sessionExerciseId: string, completed: boolean) {
    const { error } = await supabase
      .from('session_exercises')
      .update({ completed })
      .eq('id', sessionExerciseId);
    if (error) throw error;
    setItems((prev) => prev.map((i) => (i.id === sessionExerciseId ? { ...i, completed } : i)));
  }

  return {
    session,
    items,
    loading,
    refetch,
    upsertSetLog,
    addSet,
    removeSetLog,
    setCardioCompleted,
    completeWorkout,
  };
}
