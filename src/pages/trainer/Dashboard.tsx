import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, UserPlus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClientCard } from '../../components/dashboard/ClientCard';
import { AlertsPanel } from '../../components/dashboard/AlertsPanel';
import { useTrainerDashboard } from '../../hooks/useTrainerDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

type SortMode = 'name' | 'lastActivity' | 'adherence';

export default function Dashboard() {
  const { entries, alerts, loading } = useTrainerDashboard();
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [sortMode, setSortMode] = useState<SortMode>('name');

  const sorted = [...entries].sort((a, b) => {
    switch (sortMode) {
      case 'lastActivity': {
        const ax = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bx = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bx - ax;
      }
      case 'adherence':
        return b.adherencePct - a.adherencePct;
      default:
        return (a.client.full_name ?? '').localeCompare(b.client.full_name ?? '');
    }
  });

  const inviteLink = user ? `${window.location.origin}/invite/${user.id}` : '';

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    showSuccess('Enlace de invitación copiado.');
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button type="button" onClick={copyInviteLink}>
            <UserPlus size={18} className="mr-1.5" /> Invitar cliente
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase">Clientes</h3>
              <div className="flex gap-1.5">
                <SortButton active={sortMode === 'name'} onClick={() => setSortMode('name')}>Nombre</SortButton>
                <SortButton active={sortMode === 'lastActivity'} onClick={() => setSortMode('lastActivity')}>Actividad</SortButton>
                <SortButton active={sortMode === 'adherence'} onClick={() => setSortMode('adherence')}>Adherencia</SortButton>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">
                Aún no tienes clientes. Comparte el enlace de invitación desde el botón de arriba.
              </p>
            ) : (
              <div className="space-y-3">
                {sorted.map((entry) => (
                  <ClientCard key={entry.client.id} entry={entry} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <QuickAction to="/t/clients" label="Ver clientes" />
              <QuickAction to="/t/exercises" label="Biblioteca de ejercicios" />
              <button
                type="button"
                onClick={copyInviteLink}
                className="w-full flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700"
              >
                <Copy size={14} className="text-zinc-400" />
                Copiar enlace de invitación
              </button>
            </div>
          </Card>

          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2 px-1">Alertas</h3>
            {loading ? <Skeleton className="h-24" /> : <AlertsPanel alerts={alerts} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'h-7 px-2.5 rounded-full text-[10px] font-medium ' +
        (active ? 'bg-accent text-zinc-950' : 'bg-zinc-800 text-zinc-400')
      }
    >
      {children}
    </button>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="block rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700">
      {label}
    </Link>
  );
}
