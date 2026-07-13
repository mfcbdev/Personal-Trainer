import { useCallback, useEffect, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeekStart, toISODate } from '../lib/scheduling';
import { addDays } from 'date-fns';
import type { ClientProfile } from './useClients';
import type { GrowPhase } from '../lib/constants';

export interface ClientDashboardEntry {
  client: ClientProfile;
  activePhase: GrowPhase | null;
  lastActivity: string | null; // ISO
  daysSinceLastActivity: number | null;
  sessionsCompletedThisWeek: number;
  sessionsScheduledThisWeek: number;
  adherencePct: number; // 0-100
  hasWeeklyTracking: boolean;
  isInDeloadWeek: boolean;
}

export type AlertKind = 'inactive' | 'missing_tracking' | 'deload';

export interface DashboardAlert {
  clientId: string;
  clientName: string;
  kind: AlertKind;
  detail: string;
}

const INACTIVE_THRESHOLD_DAYS = 3;

export function useTrainerDashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ClientDashboardEntry[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: clients } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .eq('trainer_id', user.id)
      .order('full_name', { ascending: true });

    if (!clients || clients.length === 0) {
      setEntries([]);
      setAlerts([]);
      setLoading(false);
      return;
    }

    const clientIds = clients.map((c) => c.id);
    const weekStart = getCurrentWeekStart();
    const weekEnd = addDays(weekStart, 6);
    const weekStartIso = toISODate(weekStart);
    const weekEndIso = toISODate(weekEnd);

    const [{ data: sessionsThisWeek }, { data: lastActivities }, { data: trackingRows }] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, completed, scheduled_date, weeks!inner(is_deload, phases!inner(type, programs!inner(client_id, status)))')
        .gte('scheduled_date', weekStartIso)
        .lte('scheduled_date', weekEndIso)
        .eq('weeks.phases.programs.status', 'active')
        .in('weeks.phases.programs.client_id', clientIds),
      supabase
        .from('sessions')
        .select('completed_at, weeks!inner(phases!inner(programs!inner(client_id)))')
        .eq('completed', true)
        .in('weeks.phases.programs.client_id', clientIds)
        .order('completed_at', { ascending: false, nullsFirst: false }),
      supabase
        .from('weekly_tracking')
        .select('client_id')
        .eq('week_start_date', weekStartIso)
        .in('client_id', clientIds),
    ]);

    const now = new Date();

    // Group sessions this week by client
    type SessionsRow = {
      id: string;
      completed: boolean;
      scheduled_date: string | null;
      weeks: {
        is_deload: boolean;
        phases: { type: GrowPhase; programs: { client_id: string; status: string } };
      };
    };
    const sessions = (sessionsThisWeek ?? []) as unknown as SessionsRow[];

    const byClient = new Map<string, { scheduled: number; completed: number; phase: GrowPhase | null; deload: boolean }>();
    for (const s of sessions) {
      const clientId = s.weeks.phases.programs.client_id;
      const entry = byClient.get(clientId) ?? { scheduled: 0, completed: 0, phase: null, deload: false };
      entry.scheduled += 1;
      if (s.completed) entry.completed += 1;
      entry.phase = entry.phase ?? s.weeks.phases.type;
      if (s.weeks.is_deload) entry.deload = true;
      byClient.set(clientId, entry);
    }

    type LastActivityRow = { completed_at: string | null; weeks: { phases: { programs: { client_id: string } } } };
    const lastByClient = new Map<string, string>();
    for (const row of (lastActivities ?? []) as unknown as LastActivityRow[]) {
      const cid = row.weeks.phases.programs.client_id;
      if (row.completed_at && !lastByClient.has(cid)) lastByClient.set(cid, row.completed_at);
    }

    const trackingClientIds = new Set((trackingRows ?? []).map((r) => r.client_id));

    const nextAlerts: DashboardAlert[] = [];
    const nextEntries: ClientDashboardEntry[] = clients.map((client) => {
      const stats = byClient.get(client.id);
      const lastActivity = lastByClient.get(client.id) ?? null;
      const daysSince = lastActivity ? differenceInDays(now, new Date(lastActivity)) : null;
      const scheduled = stats?.scheduled ?? 0;
      const completed = stats?.completed ?? 0;
      const adherencePct = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
      const hasTracking = trackingClientIds.has(client.id);
      const isDeload = stats?.deload ?? false;
      const activePhase = stats?.phase ?? null;

      if (daysSince != null && daysSince >= INACTIVE_THRESHOLD_DAYS) {
        nextAlerts.push({
          clientId: client.id,
          clientName: client.full_name ?? 'Cliente',
          kind: 'inactive',
          detail: `Sin sesiones hace ${daysSince} días`,
        });
      }
      if (scheduled > 0 && !hasTracking) {
        nextAlerts.push({
          clientId: client.id,
          clientName: client.full_name ?? 'Cliente',
          kind: 'missing_tracking',
          detail: 'Falta seguimiento semanal',
        });
      }
      if (isDeload) {
        nextAlerts.push({
          clientId: client.id,
          clientName: client.full_name ?? 'Cliente',
          kind: 'deload',
          detail: 'Semana de deload',
        });
      }

      return {
        client,
        activePhase,
        lastActivity,
        daysSinceLastActivity: daysSince,
        sessionsCompletedThisWeek: completed,
        sessionsScheduledThisWeek: scheduled,
        adherencePct,
        hasWeeklyTracking: hasTracking,
        isInDeloadWeek: isDeload,
      };
    });

    setEntries(nextEntries);
    setAlerts(nextAlerts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, alerts, loading, refetch };
}
