import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgramCreateModal } from '../../components/programs/ProgramCreateModal';
import { useClient } from '../../hooks/useClients';
import { useClientPrograms } from '../../hooks/usePrograms';

const TABS = ['overview', 'program'] as const;
type Tab = (typeof TABS)[number];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, loading: clientLoading } = useClient(id);
  const { programs, loading: programsLoading, createProgram } = useClientPrograms(id);
  const [tab, setTab] = useState<Tab>('overview');
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader title={client?.full_name ?? 'Cliente'} />

      <div className="flex gap-2 mb-5 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-1 pb-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-accent text-zinc-50' : 'border-transparent text-zinc-500'
            }`}
          >
            {t === 'overview' ? 'Resumen' : 'Programa'}
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
                <button
                  key={program.id}
                  type="button"
                  onClick={() => navigate(`/t/clients/${id}/program/${program.id}`)}
                  className="w-full text-left"
                >
                  <Card className="flex items-center justify-between hover:ring-1 hover:ring-zinc-700 transition-shadow">
                    <div>
                      <p className="text-sm font-medium text-zinc-50">{program.name}</p>
                      <p className="text-xs text-zinc-500">Inicio: {program.start_date}</p>
                    </div>
                    <Badge variant={program.status === 'active' ? 'accent' : 'default'}>
                      {STATUS_LABELS[program.status]}
                    </Badge>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
}
