import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { PhaseTabs } from '../../components/programs/PhaseTabs';
import { WeekRow } from '../../components/programs/WeekRow';
import { ProgressionTable } from '../../components/programs/ProgressionTable';
import { useProgramBuilder, type SessionWithCount } from '../../hooks/useProgramBuilder';
import { useToast } from '../../contexts/ToastContext';
import { getWeekStartDate } from '../../lib/scheduling';
import type { GrowPhase } from '../../lib/constants';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
};

export default function ProgramEditor() {
  const { id: clientId, pid: programId } = useParams<{ id: string; pid: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const {
    data,
    loading,
    toggleDeload,
    addSession,
    setSessionDate,
    deleteSession,
    duplicateSession,
    duplicateWeek,
    activateProgram,
  } = useProgramBuilder(programId);
  const [activating, setActivating] = useState(false);
  const [activePhase, setActivePhase] = useState<GrowPhase>('G');
  const [view, setView] = useState<'plan' | 'progression'>('plan');

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Programa" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const program = data;
  const phase = program.phases.find((p) => p.type === activePhase);
  const allWeeks = data.phases.flatMap((p) =>
    p.weeks.map((w) => ({ id: w.id, label: `${p.type} · Semana ${w.week_number}` })),
  );

  function handleSessionClick(session: SessionWithCount) {
    navigate(`/t/clients/${clientId}/program/${programId}/session/${session.id}`);
  }

  async function handleAction(action: () => Promise<void>, successMessage?: string) {
    try {
      await action();
      if (successMessage) showSuccess(successMessage);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Ocurrió un error.');
    }
  }

  async function handleActivate() {
    if (program.status === 'active') return;
    if (!confirm('¿Activar este programa? Cualquier otro programa activo de este cliente pasará a completado.')) {
      return;
    }
    setActivating(true);
    try {
      await activateProgram();
      showSuccess('Programa activado.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo activar el programa.');
    } finally {
      setActivating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={data.name}
        action={
          <div className="flex items-center gap-3">
            <Badge variant={data.status === 'active' ? 'accent' : 'default'}>{STATUS_LABELS[data.status]}</Badge>
            {data.status !== 'active' && (
              <Button type="button" size="md" onClick={handleActivate} disabled={activating}>
                {activating ? 'Activando...' : 'Activar programa'}
              </Button>
            )}
          </div>
        }
      />

      <PhaseTabs value={activePhase} onChange={setActivePhase} />

      <div className="flex gap-2 mb-5 border-b border-zinc-800 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['plan', 'progression'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`shrink-0 whitespace-nowrap px-1 pb-2.5 text-sm font-medium border-b-2 -mb-px ${
              view === v ? 'border-accent text-zinc-50' : 'border-transparent text-zinc-500'
            }`}
          >
            {v === 'plan' ? 'Plan' : 'Progresión'}
          </button>
        ))}
      </div>

      {view === 'progression' && phase && programId && (
        <ProgressionTable
          programId={programId}
          phaseId={phase.id}
          weekNumbers={phase.weeks.map((w) => w.week_number)}
        />
      )}

      {view === 'plan' &&
        phase &&
        phase.weeks.map((week) => (
          <WeekRow
            key={week.id}
            week={week}
            weekStart={getWeekStartDate(data.start_date, phase.order, week.week_number)}
            allWeeks={allWeeks}
            onToggleDeload={(isDeload) => handleAction(() => toggleDeload(week.id, isDeload))}
            onAddSession={() =>
              handleAction(() => addSession(week.id, (week.sessions.at(-1)?.session_number ?? 0) + 1))
            }
            onSessionClick={handleSessionClick}
            onDuplicateSession={(session) =>
              handleAction(() => duplicateSession(session), 'Sesión duplicada.')
            }
            onDeleteSession={(session) => {
              if (!confirm(`¿Eliminar sesión ${session.session_number}?`)) return;
              handleAction(() => deleteSession(session.id));
            }}
            onDuplicateWeek={(targetWeekId) =>
              handleAction(() => duplicateWeek(week.id, targetWeekId), 'Semana duplicada.')
            }
            onSetSessionDay={(session, isoDate) =>
              handleAction(() =>
                setSessionDate(session.id, session.scheduled_date === isoDate ? null : isoDate),
              )
            }
          />
        ))}

      <div className="mt-6">
        <Button type="button" variant="secondary" onClick={() => navigate(`/t/clients/${clientId}`)}>
          Volver al cliente
        </Button>
      </div>
    </div>
  );
}
