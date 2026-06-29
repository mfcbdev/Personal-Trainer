import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { PhaseTabs } from '../../components/programs/PhaseTabs';
import { WeekRow } from '../../components/programs/WeekRow';
import { useProgramBuilder, type SessionWithCount } from '../../hooks/useProgramBuilder';
import { useToast } from '../../contexts/ToastContext';
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
  const { data, loading, toggleDeload, addSession, deleteSession, duplicateSession, duplicateWeek } =
    useProgramBuilder(programId);
  const [activePhase, setActivePhase] = useState<GrowPhase>('G');

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Programa" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const phase = data.phases.find((p) => p.type === activePhase);
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

  return (
    <div>
      <PageHeader
        title={data.name}
        action={<Badge variant={data.status === 'active' ? 'accent' : 'default'}>{STATUS_LABELS[data.status]}</Badge>}
      />

      <PhaseTabs value={activePhase} onChange={setActivePhase} />

      {phase?.weeks.map((week) => (
        <WeekRow
          key={week.id}
          week={week}
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
