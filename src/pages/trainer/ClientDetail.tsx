import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Copy, Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgramCreateModal } from '../../components/programs/ProgramCreateModal';
import { ProgramDuplicateModal } from '../../components/programs/ProgramDuplicateModal';
import { MessageThread } from '../../components/messages/MessageThread';
import { MeasurementFormModal } from '../../components/measurements/MeasurementFormModal';
import { MeasurementList } from '../../components/measurements/MeasurementList';
import { TrackingTrendChart } from '../../components/dashboard/TrackingTrendChart';
import { HRZonesTable } from '../../components/dashboard/HRZonesTable';
import { HRTargetTable } from '../../components/dashboard/HRTargetTable';
import { PhotoGallery } from '../../components/progress/PhotoGallery';
import { useClient } from '../../hooks/useClients';
import { useClientPrograms, type Program } from '../../hooks/usePrograms';
import { useMeasurements } from '../../hooks/useMeasurements';
import { useClientTrackingHistory } from '../../hooks/useClientTrackingHistory';
import { useCardioEvaluation } from '../../hooks/useCardioEvaluation';
import { PROGRAM_TEMPLATE_LABELS } from '../../lib/constants';

const TABS = ['overview', 'program', 'measurements', 'tracking', 'photos', 'messages', 'zones'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Resumen',
  program: 'Programa',
  measurements: 'Mediciones',
  tracking: 'Seguimiento',
  photos: 'Fotos',
  messages: 'Mensajes',
  zones: 'Zonas FC',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { client, loading: clientLoading } = useClient(id);
  const { programs, loading: programsLoading, createProgram, duplicateProgram } = useClientPrograms(id);
  const { measurements, loading: measurementsLoading, createMeasurement, deleteMeasurement } = useMeasurements(id);
  const { rows: trackingRows, loading: trackingLoading } = useClientTrackingHistory(id);
  const { evaluation, loading: evalLoading, refetch: refetchEval } = useCardioEvaluation(id);
  const [tab, setTab] = useState<Tab>(() => TABS.find((t) => t === searchParams.get('tab')) ?? 'overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Program | null>(null);
  const [measurementOpen, setMeasurementOpen] = useState(false);

  return (
    <div>
      <PageHeader title={client?.full_name ?? 'Cliente'} />

      <div className="flex gap-2 mb-5 border-b border-zinc-800 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 whitespace-nowrap px-1 pb-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-accent text-zinc-50' : 'border-transparent text-zinc-500'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' &&
        (clientLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <Card className="space-y-1">
            <p className="text-sm text-zinc-200">{client?.email}</p>
            <p className="text-sm text-zinc-400">
              {client?.nationality} · {client?.sex} · {client?.birth_date}
            </p>
            <p className="text-sm text-zinc-400">{client?.phone}</p>
            {client?.objectives && (
              <p className="text-sm text-zinc-300 mt-3 whitespace-pre-wrap">{client.objectives}</p>
            )}
          </Card>
        ))}

      {tab === 'program' && (
        <div>
          <div className="flex justify-end mb-3">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus size={18} className="mr-1.5" /> Crear programa
            </Button>
          </div>

          {programsLoading ? (
            <Skeleton className="h-20" />
          ) : programs.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-10">Este cliente aún no tiene un programa.</p>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <Card
                  key={program.id}
                  className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/t/clients/${id}/program/${program.id}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium text-zinc-50 truncate">{program.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-zinc-500">Inicio: {program.start_date}</p>
                      {program.template_type && (
                        <span className="text-xs text-zinc-500">·</span>
                      )}
                      {program.template_type && (
                        <p className="text-xs text-zinc-400">
                          {PROGRAM_TEMPLATE_LABELS[program.template_type]}
                        </p>
                      )}
                    </div>
                  </button>
                  <Badge variant={program.status === 'active' ? 'accent' : 'default'}>
                    {STATUS_LABELS[program.status]}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setDuplicateSource(program)}
                    aria-label={`Duplicar ${program.name}`}
                    title="Duplicar o reutilizar para otro alumno"
                    className="h-11 w-11 -mr-2 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                  >
                    <Copy size={18} />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'measurements' && (
        <div>
          <div className="flex justify-end mb-3">
            <Button type="button" onClick={() => setMeasurementOpen(true)} disabled={!client}>
              <Plus size={18} className="mr-1.5" /> Nueva medición
            </Button>
          </div>

          {measurementsLoading ? <Skeleton className="h-20" /> : <MeasurementList measurements={measurements} onDelete={deleteMeasurement} />}
        </div>
      )}

      {tab === 'tracking' && (
        <Card>
          <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Peso, cansancio y motivación</h3>
          {trackingLoading ? <Skeleton className="h-48" /> : <TrackingTrendChart rows={trackingRows} />}
        </Card>
      )}

      {tab === 'photos' && id && (
        <Card>
          <PhotoGallery clientId={id} canEdit={false} />
        </Card>
      )}

      {tab === 'messages' && id && (
        <Card>
          <MessageThread clientId={id} emptyHint="Aún no hay mensajes con este alumno." />
        </Card>
      )}

      {tab === 'zones' && client && (
        evalLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <div className="space-y-4">
            <HRZonesTable client={client} evaluation={evaluation} onSaved={refetchEval} />
            <HRTargetTable
              restingHr={evaluation?.resting_hr ?? null}
              maxHr={evaluation?.max_hr ?? null}
              evaluation={evaluation}
              onSaved={refetchEval}
            />
          </div>
        )
      )}

      {id && (
        <ProgramCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={createProgram}
          onCreated={(program) => {
            setCreateOpen(false);
            navigate(`/t/clients/${id}/program/${program.id}`);
          }}
        />
      )}

      {duplicateSource && (
        <ProgramDuplicateModal
          source={duplicateSource}
          onClose={() => setDuplicateSource(null)}
          onDuplicate={duplicateProgram}
          onDuplicated={(program) => {
            setDuplicateSource(null);
            navigate(`/t/clients/${program.client_id}/program/${program.id}`);
          }}
        />
      )}

      {client && (
        <MeasurementFormModal
          open={measurementOpen}
          onClose={() => setMeasurementOpen(false)}
          client={client}
          onSubmit={createMeasurement}
        />
      )}
    </div>
  );
}
