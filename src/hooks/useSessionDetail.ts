import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Exercise } from './useExercises';

type Session = Database['public']['Tables']['sessions']['Row'];
type SessionExercise = Database['public']['Tables']['session_exercises']['Row'];
type SessionExerciseUpdate = Database['public']['Tables']['session_exercises']['Update'];

export interface SessionExerciseWithExercise extends SessionExercise {
  exercise: Exercise;
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
      sets: config.sets ?? 3,
      reps: config.reps ?? '10-12',
      weight: config.weight ?? null,
      rest: '60s',
    });
    if (error) throw error;
    await refetch();
  }

  async function updateItem(id: string, fields: SessionExerciseUpdate) {
    const { error } = await supabase.from('session_exercises').update(fields).eq('id', id);
    if (error) throw error;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...fields } : item)));
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

  return { session, items, loading, refetch, updateSessionMeta, addExercise, updateItem, removeItem, reorder };
}
