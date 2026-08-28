import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getWeekStartDate, getDateForWeekday, toISODate } from '../lib/scheduling';
import type { Database } from '../lib/database.types';

type Program = Database['public']['Tables']['programs']['Row'];
type Phase = Database['public']['Tables']['phases']['Row'];
type Week = Database['public']['Tables']['weeks']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type SessionExerciseRow = Database['public']['Tables']['session_exercises']['Row'];

export interface SessionWithCount extends Session {
  exerciseCount: number;
}

export interface WeekWithSessions extends Week {
  sessions: SessionWithCount[];
}

export interface PhaseWithWeeks extends Phase {
  weeks: WeekWithSessions[];
}

export interface ProgramBuilderData extends Program {
  phases: PhaseWithWeeks[];
}

export function useProgramBuilder(programId: string | undefined) {
  const [data, setData] = useState<ProgramBuilderData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!programId) return;
    setLoading(true);

    const { data: program } = await supabase.from('programs').select('*').eq('id', programId).single();
    if (!program) {
      setData(null);
      setLoading(false);
      return;
    }

    const { data: phases } = await supabase
      .from('phases')
      .select('*')
      .eq('program_id', programId)
      .order('order', { ascending: true });

    const phaseIds = (phases ?? []).map((p) => p.id);
    const { data: weeks } = phaseIds.length
      ? await supabase.from('weeks').select('*').in('phase_id', phaseIds).order('week_number', { ascending: true })
      : { data: [] as Week[] };

    const weekIds = (weeks ?? []).map((w) => w.id);
    const { data: sessions } = weekIds.length
      ? await supabase
          .from('sessions')
          .select('*')
          .in('week_id', weekIds)
          .order('session_number', { ascending: true })
      : { data: [] as Session[] };

    const sessionIds = (sessions ?? []).map((s) => s.id);
    const { data: sessionExercises } = sessionIds.length
      ? await supabase.from('session_exercises').select('id, session_id').in('session_id', sessionIds)
      : { data: [] as { id: string; session_id: string }[] };

    const countBySession = new Map<string, number>();
    for (const se of sessionExercises ?? []) {
      countBySession.set(se.session_id, (countBySession.get(se.session_id) ?? 0) + 1);
    }

    const sessionsByWeek = new Map<string, SessionWithCount[]>();
    for (const session of sessions ?? []) {
      const list = sessionsByWeek.get(session.week_id) ?? [];
      list.push({ ...session, exerciseCount: countBySession.get(session.id) ?? 0 });
      sessionsByWeek.set(session.week_id, list);
    }

    const weeksByPhase = new Map<string, WeekWithSessions[]>();
    for (const week of weeks ?? []) {
      const list = weeksByPhase.get(week.phase_id) ?? [];
      list.push({ ...week, sessions: sessionsByWeek.get(week.id) ?? [] });
      weeksByPhase.set(week.phase_id, list);
    }

    const phasesWithWeeks: PhaseWithWeeks[] = (phases ?? []).map((phase) => ({
      ...phase,
      weeks: weeksByPhase.get(phase.id) ?? [],
    }));

    setData({ ...program, phases: phasesWithWeeks });
    setLoading(false);
  }, [programId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function toggleDeload(weekId: string, isDeload: boolean) {
    const { error } = await supabase.from('weeks').update({ is_deload: isDeload }).eq('id', weekId);
    if (error) throw error;
    await refetch();
  }

  async function addSession(weekId: string, nextSessionNumber: number) {
    const week = data?.phases.flatMap((p) => p.weeks).find((w) => w.id === weekId);
    if (week && week.sessions.length >= 7) {
      throw new Error('Una semana no puede tener más de 7 sesiones.');
    }
    const { error } = await supabase.from('sessions').insert({ week_id: weekId, session_number: nextSessionNumber });
    if (error) throw error;
    await refetch();
  }

  async function setSessionDate(sessionId: string, scheduledDate: string | null) {
    const { error } = await supabase.from('sessions').update({ scheduled_date: scheduledDate }).eq('id', sessionId);
    if (error) throw error;
    await refetch();
  }

  async function deleteSession(sessionId: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) throw error;
    await refetch();
  }

  async function duplicateSession(session: SessionWithCount) {
    const week = data?.phases.flatMap((p) => p.weeks).find((w) => w.id === session.week_id);
    const nextNumber = (week?.sessions.reduce((max, s) => Math.max(max, s.session_number), 0) ?? 0) + 1;

    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({ week_id: session.week_id, session_number: nextNumber, name: session.name })
      .select()
      .single();
    if (error) throw error;

    const { data: exercises } = await supabase
      .from('session_exercises')
      .select('*')
      .eq('session_id', session.id);

    if (exercises && exercises.length > 0) {
      const copies = exercises.map((ex) => ({
        session_id: newSession.id,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rir_rpe: ex.rir_rpe,
        rest: ex.rest,
        notes: ex.notes,
      }));
      const { error: copyError } = await supabase.from('session_exercises').insert(copies);
      if (copyError) throw copyError;
    }

    await refetch();
  }

  async function duplicateWeek(sourceWeekId: string, targetWeekId: string) {
    const sourceWeek = data?.phases.flatMap((p) => p.weeks).find((w) => w.id === sourceWeekId);
    if (!sourceWeek) return;

    // Not truly atomic (no server-side transaction) — insert new sessions first so a mid-op
    // failure leaves the target week intact rather than empty. Delete the old ones only after
    // the copy succeeds.
    const sourceSessionIds = sourceWeek.sessions.map((s) => s.id);
    const { data: sourceExercises, error: sourceExError } = sourceSessionIds.length
      ? await supabase.from('session_exercises').select('*').in('session_id', sourceSessionIds)
      : { data: [] as SessionExerciseRow[], error: null };
    if (sourceExError) throw sourceExError;

    const newSessions: { source_id: string; row: { week_id: string; session_number: number; name: string | null } }[] =
      sourceWeek.sessions.map((s) => ({
        source_id: s.id,
        row: { week_id: targetWeekId, session_number: s.session_number, name: s.name },
      }));

    if (newSessions.length === 0) {
      // Just clear the target if the source is empty.
      const targetWeek = data?.phases.flatMap((p) => p.weeks).find((w) => w.id === targetWeekId);
      const targetSessionIds = targetWeek?.sessions.map((s) => s.id) ?? [];
      if (targetSessionIds.length > 0) {
        const { error: delError } = await supabase.from('sessions').delete().in('id', targetSessionIds);
        if (delError) throw delError;
      }
      await refetch();
      return;
    }

    const { data: insertedSessions, error: insertError } = await supabase
      .from('sessions')
      .insert(newSessions.map((n) => n.row))
      .select();
    if (insertError) throw insertError;

    // Map source session id -> new session id by matching session_number (unique within a week).
    const newBySessionNumber = new Map(insertedSessions.map((s) => [s.session_number, s.id]));
    const exerciseCopies = (sourceExercises ?? []).map((ex) => {
      const sourceSession = sourceWeek.sessions.find((s) => s.id === ex.session_id);
      const newSessionId = sourceSession ? newBySessionNumber.get(sourceSession.session_number) : null;
      if (!newSessionId) return null;
      return {
        session_id: newSessionId,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rir_rpe: ex.rir_rpe,
        rest: ex.rest,
        notes: ex.notes,
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    if (exerciseCopies.length > 0) {
      const { error: copyError } = await supabase.from('session_exercises').insert(exerciseCopies);
      if (copyError) throw copyError;
    }

    // Only now delete the old target sessions; ON DELETE CASCADE takes care of their exercises.
    const targetWeek = data?.phases.flatMap((p) => p.weeks).find((w) => w.id === targetWeekId);
    const targetSessionIds = targetWeek?.sessions.map((s) => s.id) ?? [];
    if (targetSessionIds.length > 0) {
      const { error: delError } = await supabase.from('sessions').delete().in('id', targetSessionIds);
      if (delError) throw delError;
    }

    await refetch();
  }

  async function activateProgram() {
    if (!data) return;

    const { error: demoteError } = await supabase
      .from('programs')
      .update({ status: 'completed' })
      .eq('client_id', data.client_id)
      .eq('status', 'active')
      .neq('id', data.id);
    if (demoteError) throw demoteError;

    const { error: activateError } = await supabase.from('programs').update({ status: 'active' }).eq('id', data.id);
    if (activateError) throw activateError;

    for (const phase of data.phases) {
      for (const week of phase.weeks) {
        const weekStart = getWeekStartDate(data.start_date, phase.order, week.week_number);
        const total = week.sessions.length;
        for (const session of week.sessions) {
          if (session.scheduled_date) continue;
          const dayIndex = total > 0 ? Math.floor(((session.session_number - 1) * 7) / Math.max(total, 1)) : 0;
          const isoDate = toISODate(getDateForWeekday(weekStart, Math.min(dayIndex, 6)));
          const { error } = await supabase.from('sessions').update({ scheduled_date: isoDate }).eq('id', session.id);
          if (error) throw error;
        }
      }
    }

    await refetch();
  }

  return {
    data,
    loading,
    refetch,
    toggleDeload,
    addSession,
    setSessionDate,
    deleteSession,
    duplicateSession,
    duplicateWeek,
    activateProgram,
  };
}
