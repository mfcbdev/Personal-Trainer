import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toISODate } from '../lib/scheduling';

export interface TrainerCalendarSession {
  id: string;
  sessionNumber: number;
  name: string | null;
  scheduledDate: string;
  completed: boolean;
  clientId: string;
  clientName: string;
  programId: string;
  programName: string;
  phaseType: 'G' | 'R' | 'O' | 'W';
  weekNumber: number;
  isDeload: boolean;
}

type RawSessionRow = {
  id: string;
  session_number: number;
  name: string | null;
  scheduled_date: string;
  completed: boolean;
  weeks: {
    week_number: number;
    is_deload: boolean;
    phases: {
      type: 'G' | 'R' | 'O' | 'W';
      programs: {
        id: string;
        name: string;
        client_id: string;
        status: string;
        profiles: { full_name: string | null };
      };
    };
  };
};

/**
 * Fetches every scheduled session across the trainer's active-program clients
 * for a date range. Meant for the coach-wide calendar surface at /t/calendar.
 */
export function useTrainerCalendar(rangeStart: Date, rangeEnd: Date) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TrainerCalendarSession[]>([]);
  const [loading, setLoading] = useState(true);

  const startIso = toISODate(rangeStart);
  const endIso = toISODate(rangeEnd);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('sessions')
      .select(
        'id, session_number, name, scheduled_date, completed, ' +
          'weeks!inner(week_number, is_deload, phases!inner(type, programs!inner(id, name, client_id, status, profiles!inner(full_name))))',
      )
      .gte('scheduled_date', startIso)
      .lte('scheduled_date', endIso)
      .eq('weeks.phases.programs.status', 'active')
      .eq('weeks.phases.programs.trainer_id', user.id)
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true });

    const rows = (data as unknown as RawSessionRow[]) ?? [];
    const flat: TrainerCalendarSession[] = rows.map((r) => ({
      id: r.id,
      sessionNumber: r.session_number,
      name: r.name,
      scheduledDate: r.scheduled_date,
      completed: r.completed,
      clientId: r.weeks.phases.programs.client_id,
      clientName: r.weeks.phases.programs.profiles.full_name ?? 'Cliente',
      programId: r.weeks.phases.programs.id,
      programName: r.weeks.phases.programs.name,
      phaseType: r.weeks.phases.type,
      weekNumber: r.weeks.week_number,
      isDeload: r.weeks.is_deload,
    }));

    setSessions(flat);
    setLoading(false);
  }, [user, startIso, endIso]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sessions, loading, refetch };
}
