import { useCallback, useEffect, useState } from 'react';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseLocalDate, toISODate } from '../lib/scheduling';
import { copyItemForNewSession } from './useProgramBuilder';
import type { Database, ProgramTemplateType } from '../lib/database.types';

export type Program = Database['public']['Tables']['programs']['Row'];
type SessionExerciseRow = Database['public']['Tables']['session_exercises']['Row'];
type ProgressionRow = Database['public']['Tables']['progressions']['Row'];

export interface ProgramCreateInput {
  name: string;
  startDate: string;
  templateType: ProgramTemplateType | null;
}

export interface ProgramDuplicateInput {
  name: string;
  startDate: string;
  clientId: string;
}

type PhaseTree = {
  id: string;
  type: string;
  weeks: {
    id: string;
    week_number: number;
    is_deload: boolean;
    sessions: { id: string; session_number: number; name: string | null; scheduled_date: string | null }[];
  }[];
};

/**
 * Copy weeks' deload flags, sessions, session_exercises and progressions from
 * `source` into `target`. The on_program_created trigger has already given
 * `target` its 4 phases × 4 weeks, so we map by (phase type, week number).
 * Session dates shift by the gap between the two start dates, which keeps
 * the coach's weekday pattern.
 */
async function copyProgramContents(source: Program, target: Program) {
  const tree = 'id, type, weeks(id, week_number, is_deload, sessions(id, session_number, name, scheduled_date))';
  const [srcRes, dstRes, progRes] = await Promise.all([
    supabase.from('phases').select(tree).eq('program_id', source.id),
    supabase.from('phases').select(tree).eq('program_id', target.id),
    supabase.from('progressions').select('*').eq('program_id', source.id),
  ]);
  if (srcRes.error) throw srcRes.error;
  if (dstRes.error) throw dstRes.error;
  if (progRes.error) throw progRes.error;
  const src = srcRes.data as unknown as PhaseTree[];
  const dst = dstRes.data as unknown as PhaseTree[];

  const dstPhaseIdByType = new Map(dst.map((p) => [p.type, p.id]));
  const dstWeekIdByKey = new Map<string, string>();
  for (const p of dst) for (const w of p.weeks) dstWeekIdByKey.set(`${p.type}-${w.week_number}`, w.id);

  const dayShift = differenceInCalendarDays(parseLocalDate(target.start_date), parseLocalDate(source.start_date));
  const deloadWeekIds: string[] = [];
  const srcSessionKeyById = new Map<string, string>();
  const sessionRows: { week_id: string; session_number: number; name: string | null; scheduled_date: string | null }[] = [];

  for (const p of src) {
    for (const w of p.weeks) {
      const weekId = dstWeekIdByKey.get(`${p.type}-${w.week_number}`);
      if (!weekId) continue;
      if (w.is_deload) deloadWeekIds.push(weekId);
      for (const s of w.sessions) {
        srcSessionKeyById.set(s.id, `${weekId}-${s.session_number}`);
        sessionRows.push({
          week_id: weekId,
          session_number: s.session_number,
          name: s.name,
          scheduled_date: s.scheduled_date ? toISODate(addDays(parseLocalDate(s.scheduled_date), dayShift)) : null,
        });
      }
    }
  }

  if (deloadWeekIds.length > 0) {
    const { error } = await supabase.from('weeks').update({ is_deload: true }).in('id', deloadWeekIds);
    if (error) throw error;
  }

  if (sessionRows.length > 0) {
    const { data: newSessions, error } = await supabase.from('sessions').insert(sessionRows).select('id, week_id, session_number');
    if (error) throw error;
    const newSessionIdByKey = new Map(newSessions.map((s) => [`${s.week_id}-${s.session_number}`, s.id]));

    const { data: items, error: itemsError } = await supabase
      .from('session_exercises')
      .select('*')
      .in('session_id', [...srcSessionKeyById.keys()]);
    if (itemsError) throw itemsError;

    const copies = (items as SessionExerciseRow[]).flatMap((ex) => {
      const newSessionId = newSessionIdByKey.get(srcSessionKeyById.get(ex.session_id) ?? '');
      return newSessionId ? [copyItemForNewSession(ex, newSessionId)] : [];
    });
    if (copies.length > 0) {
      const { error: copyError } = await supabase.from('session_exercises').insert(copies);
      if (copyError) throw copyError;
    }
  }

  const progressionCopies = (progRes.data as ProgressionRow[]).flatMap((pr) => {
    const srcPhase = src.find((p) => p.id === pr.phase_id);
    const phaseId = srcPhase ? dstPhaseIdByType.get(srcPhase.type) : undefined;
    if (!phaseId) return [];
    return [{
      program_id: target.id,
      phase_id: phaseId,
      muscle_group: pr.muscle_group,
      week_number: pr.week_number,
      target_sets: pr.target_sets,
      target_reps: pr.target_reps,
      target_intensity: pr.target_intensity,
    }];
  });
  if (progressionCopies.length > 0) {
    const { error } = await supabase.from('progressions').insert(progressionCopies);
    if (error) throw error;
  }
}

export function useClientPrograms(clientId: string | undefined) {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (!error) setPrograms(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createProgram(input: ProgramCreateInput) {
    if (!clientId || !user) throw new Error('Faltan datos');
    const { data, error } = await supabase
      .from('programs')
      .insert({
        client_id: clientId,
        trainer_id: user.id,
        name: input.name,
        start_date: input.startDate,
        template_type: input.templateType,
      })
      .select()
      .single();
    if (error) throw error;
    await refetch();
    return data;
  }

  /** Duplicate a program for this alumno or reuse it for another one (Notion 9.1). */
  async function duplicateProgram(source: Program, input: ProgramDuplicateInput) {
    if (!user) throw new Error('Faltan datos');
    const { data: created, error } = await supabase
      .from('programs')
      .insert({
        client_id: input.clientId,
        trainer_id: user.id,
        name: input.name,
        start_date: input.startDate,
        template_type: source.template_type,
      })
      .select()
      .single();
    if (error) throw error;

    try {
      await copyProgramContents(source, created);
    } catch (copyError) {
      // No transaction across REST calls — ON DELETE CASCADE removes the partial copy instead.
      await supabase.from('programs').delete().eq('id', created.id);
      throw copyError;
    }

    await refetch();
    return created;
  }

  return { programs, loading, refetch, createProgram, duplicateProgram };
}
