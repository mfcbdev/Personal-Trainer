import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Exercise } from './useExercises';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionExercise = Database['public']['Tables']['session_exercises']['Row'];
type SessionExerciseInsert = Database['public']['Tables']['session_exercises']['Insert'];
type SessionExerciseUpdate = Database['public']['Tables']['session_exercises']['Update'];

/** exercise is null for cardio_informal / cardio_formal items. */
export interface SessionExerciseWithExercise extends SessionExercise {
  exercise: Exercise | null;
}

export function useSessionDetail(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<SessionExerciseWithExercise[]>([]);
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

    setItems((rows as unknown as SessionExerciseWithExercise[]) ?? []);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function updateSessionMeta(fields: Partial<Pick<Session, 'name' | 'scheduled_date'>>) {
    if (!sessionId) return;
    const { error } = await supabase.from('sessions').update(fields).eq('id', sessionId);
    if (error) throw error;
    await refetch();
  }

  async function addExercise(
    exerciseId: string,
    config: { sets?: number | null; reps?: string | null; weight?: number | null } = {},
  ) {
    if (!sessionId) return;
    const nextOrder = items.length;
    const { error } = await supabase.from('session_exercises').insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      order_index: nextOrder,
      item_type: 'strength',
      sets: config.sets ?? 3,
      reps: config.reps ?? '10-12',
      weight: config.weight ?? null,
      rest: '60s',
    });
    if (error) throw error;
    await refetch();
  }

  async function addCardioItem(fields: Omit<SessionExerciseInsert, 'session_id' | 'order_index'>) {
    if (!sessionId) return;
    const nextOrder = items.length;
    const { error } = await supabase.from('session_exercises').insert({
      session_id: sessionId,
      order_index: nextOrder,
      ...fields,
    });
    if (error) throw error;
    await refetch();
  }

  // Fields legal on each shape. Anything outside these lists is stripped
  // before the UPDATE so a cardio row can't accidentally acquire strength
  // fields (or vice versa) — the DB check constraint only guards
  // exercise_id nullability, not the strength/cardio field split.
  const STRENGTH_FIELDS = new Set<keyof SessionExerciseUpdate>([
    'sets',
    'reps',
    'weight',
    'rir_rpe',
    'rest',
    'notes',
    'order_index',
  ]);
  const CARDIO_FIELDS = new Set<keyof SessionExerciseUpdate>([
    'cardio_modality',
    'total_minutes',
    'rounds',
    'work_seconds',
    'rest_seconds',
    'recovery_seconds',
    'incline',
    'intensity',
    'observations',
    'notes',
    'order_index',
    'completed',
  ]);

  async function updateItem(id: string, fields: SessionExerciseUpdate) {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const allowed = target.item_type === 'strength' ? STRENGTH_FIELDS : CARDIO_FIELDS;
    const safe: SessionExerciseUpdate = {};
    for (const key of Object.keys(fields) as (keyof SessionExerciseUpdate)[]) {
      if (allowed.has(key)) safe[key] = fields[key] as never;
    }
    if (Object.keys(safe).length === 0) return;
    const { error } = await supabase.from('session_exercises').update(safe).eq('id', id);
    if (error) throw error;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...safe } : item)));
  }

  async function removeItem(id: string) {
    const { error } = await supabase.from('session_exercises').delete().eq('id', id);
    if (error) throw error;
    await refetch();
  }

  async function reorder(newItems: SessionExerciseWithExercise[]) {
    setItems(newItems);
    await Promise.all(
      newItems.map((item, index) =>
        supabase.from('session_exercises').update({ order_index: index }).eq('id', item.id),
      ),
    );
  }

  return {
    session,
    items,
    loading,
    refetch,
    updateSessionMeta,
    addExercise,
    addCardioItem,
    updateItem,
    removeItem,
    reorder,
  };
}
