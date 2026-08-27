import { useCallback, useEffect, useState } from 'react';
import { addDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toISODate } from '../lib/scheduling';
import type { Database } from '../lib/database.types';

export type WeeklyTracking = Database['public']['Tables']['weekly_tracking']['Row'];
export type DailyLog = Database['public']['Tables']['daily_log']['Row'];
export type DailyStatus = Database['public']['Tables']['daily_log']['Row']['status'];

export interface WeeklyTrackingInput {
  sessionsCompleted: number;
  fatigue: number;
  recovery: number;
  energy: number;
  mood: number;
  weight: number | null;
  nutritionAdherence: number;
  satiety: number;
  hydration: number;
  planFollowing: number;
  sleepHours: number | null;
  sleepQuality: number;
  stress: number;
  motivation: number;
  proudestMoment: string;
  dailyLogs: { date: string; status: DailyStatus; observation: string }[];
}

export function useWeeklyTracking(weekStart: Date) {
  const { user } = useAuth();
  const [tracking, setTracking] = useState<WeeklyTracking | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStartIso = toISODate(weekStart);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: trackingRow } = await supabase
      .from('weekly_tracking')
      .select('*')
      .eq('client_id', user.id)
      .eq('week_start_date', weekStartIso)
      .maybeSingle();
    setTracking(trackingRow ?? null);

    if (trackingRow) {
      const { data: logs } = await supabase
        .from('daily_log')
        .select('*')
        .eq('weekly_tracking_id', trackingRow.id)
        .order('day_date', { ascending: true });
      setDailyLogs(logs ?? []);
    } else {
      setDailyLogs([]);
    }

    setLoading(false);
  }, [user, weekStartIso]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function submit(input: WeeklyTrackingInput) {
    if (!user) throw new Error('No autenticado');

    const { data: savedTracking, error: trackingError } = await supabase
      .from('weekly_tracking')
      .upsert(
        {
          id: tracking?.id,
          client_id: user.id,
          week_start_date: weekStartIso,
          sessions_completed: input.sessionsCompleted,
          fatigue: input.fatigue,
          recovery: input.recovery,
          energy: input.energy,
          mood: input.mood,
          weight: input.weight,
          nutrition_adherence: input.nutritionAdherence,
          satiety: input.satiety,
          hydration: input.hydration,
          plan_following: input.planFollowing,
          sleep_hours: input.sleepHours,
          sleep_quality: input.sleepQuality,
          stress: input.stress,
          motivation: input.motivation,
          proudest_moment: input.proudestMoment,
        },
        { onConflict: 'client_id,week_start_date' },
      )
      .select()
      .single();
    if (trackingError) throw trackingError;

    const logRows = input.dailyLogs.map((log) => ({
      weekly_tracking_id: savedTracking.id,
      day_date: log.date,
      status: log.status,
      observation: log.observation || null,
    }));

    const { error: logsError } = await supabase
      .from('daily_log')
      .upsert(logRows, { onConflict: 'weekly_tracking_id,day_date' });
    if (logsError) throw logsError;

    await refetch();
  }

  return { tracking, dailyLogs, loading, refetch, submit };
}

export function weekDates(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i)));
}
