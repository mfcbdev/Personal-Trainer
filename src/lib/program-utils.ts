import type { ProgramBuilderData, SessionWithCount } from '../hooks/useProgramBuilder';

export interface FlatSession {
  session: SessionWithCount;
  phaseType: string;
  weekNumber: number;
  isDeload: boolean;
}

export function flattenSessions(program: ProgramBuilderData): FlatSession[] {
  return program.phases.flatMap((phase) =>
    phase.weeks.flatMap((week) =>
      week.sessions.map((session) => ({
        session,
        phaseType: phase.type,
        weekNumber: week.week_number,
        isDeload: week.is_deload,
      })),
    ),
  );
}

export function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
