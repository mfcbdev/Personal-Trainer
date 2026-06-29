import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

export function useExercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group', { ascending: true })
      .order('name', { ascending: true });
    if (!error) setExercises(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createExercise(input: Omit<ExerciseInsert, 'trainer_id'>) {
    if (!user) throw new Error('No autenticado');
    const { error } = await supabase.from('exercises').insert({ ...input, trainer_id: user.id });
    if (error) throw error;
    await refetch();
  }

  async function updateExercise(id: string, input: ExerciseUpdate) {
    const { error } = await supabase.from('exercises').update(input).eq('id', id);
    if (error) throw error;
    await refetch();
  }

  async function deleteExercise(id: string) {
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) throw error;
    await refetch();
  }

  async function seedDefaultLibrary() {
    if (!user) throw new Error('No autenticado');
    const { error } = await supabase.rpc('seed_default_exercises', { p_trainer_id: user.id });
    if (error) throw error;
    await refetch();
  }

  return { exercises, loading, refetch, createExercise, updateExercise, deleteExercise, seedDefaultLibrary };
}
