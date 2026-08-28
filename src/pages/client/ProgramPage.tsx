import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useActiveProgram } from '../../hooks/useActiveProgram';
import { GROW_PHASES, PHASE_LABELS, PHASE_COLORS, type GrowPhase } from '../../lib/constants';
import { getCurrentPhaseIndex, getWeekStartDate, formatShortDate } from '../../lib/scheduling';
import { cn } from '../../utils/cn';
import type { SessionWithCount } from '../../hooks/useProgramBuilder';

export default function ProgramPage() {
  const { data, loading, hasActiveProgram } = useActiveProgram();

  const currentPhaseIndex = useMemo(() => getCurrentPhaseIndex(data?.start_date), [data?.start_date]);
  const [activePhase, setActivePhase] = useState<GrowPhase>('G');
  const [initialised, setInitialised] = useState(false);

  // Jump the tab to the phase the alumno is currently in the first time we
  // learn the program's start date.
  useEffect(() => {
    if (!initialised && data?.start_date) {
      setActivePhase(GROW_PHASES[currentPhaseIndex]);
      setInitialised(true);
    }
  }, [initialised, data?.start_date, currentPhaseIndex]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Mi Programa" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!hasActiveProgram || !data) {
    return (
      <div>
        <PageHeader title="Mi Programa" />
        <Card className="text-center">
          <p className="text-sm text-zinc-400">
            Aún no tienes un programa activo. Tu entrenador te lo asignará pronto.
          </p>
        </Card>
      </div>
    );
  }

  const phase = data.phases.find((p) => p.type === activePhase);

  return (
    <div>
      <PageHeader title="Mi Programa" />

      <LockedPhaseTabs value={activePhase} currentIndex={currentPhaseIndex} onChange={setActivePhase} />

      {phase && (
        <div className="space-y-4">
          {phase.weeks.map((week) => (
            <WeekBlock
              key={week.id}
              phaseType={phase.type}
              weekNumber={week.week_number}
              weekStart={getWeekStartDate(data.start_date, phase.order, week.week_number)}
              sessions={week.sessions}
              isDeload={week.is_deload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LockedPhaseTabs({
  value,
  currentIndex,
  onChange,
}: {
  value: GrowPhase;
  currentIndex: number;
  onChange: (phase: GrowPhase) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
      {GROW_PHASES.map((phase, i) => {
        const colors = PHASE_COLORS[phase];
        const active = value === phase;
        const locked = i > currentIndex;
        return (
          <button
            key={phase}
            type="button"
            onClick={() => !locked && onChange(phase)}
            disabled={locked}
            aria-label={locked ? `${PHASE_LABELS[phase]} — se desbloquea más adelante` : PHASE_LABELS[phase]}
            className={cn(
              'h-11 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5',
              active ? colors.bg : 'bg-surface',
              active ? colors.text : locked ? 'text-zinc-600' : 'text-zinc-400',
              locked && 'opacity-60 cursor-not-allowed',
            )}
          >
            {locked && <Lock size={12} />}
            {phase} · {PHASE_LABELS[phase]}
          </button>
        );
      })}
    </div>
  );
}

function WeekBlock({
  phaseType,
  weekNumber,
  weekStart,
  sessions,
  isDeload,
}: {
  phaseType: GrowPhase;
  weekNumber: number;
  weekStart: Date;
  sessions: SessionWithCount[];
  isDeload: boolean;
}) {
  return (
    <div className={cn('rounded-lg p-4', isDeload ? 'bg-zinc-900/60' : 'bg-surface')}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-50">
          {phaseType} · Semana {weekNumber}
        </h3>
        <div className="flex items-center gap-2">
          {isDeload && <span className="text-xs text-zinc-500">Deload</span>}
          <span className="text-xs text-zinc-500 capitalize">{formatShortDate(weekStart)}</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-3">Sin sesiones asignadas.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: SessionWithCount }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/c/session/${session.id}`)}
      className="w-full text-left rounded-lg bg-base border border-zinc-800 p-3 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-50 truncate">
            {session.name || `Sesión ${session.session_number}`}
          </p>
          <p className="text-xs text-zinc-500">
            {session.exerciseCount} ejercicios · {session.scheduled_date ?? 'Sin fecha'}
          </p>
        </div>
        {session.completed && <span className="text-xs text-accent shrink-0">Completada</span>}
      </div>
    </button>
  );
}
