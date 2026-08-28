import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClientCard } from '../../components/dashboard/ClientCard';
import { useTrainerDashboard } from '../../hooks/useTrainerDashboard';

export default function ClientList() {
  const { entries, loading } = useTrainerDashboard();
  const [search, setSearch] = useState('');

  const filtered = entries.filter((entry) =>
    (entry.client.full_name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Clientes" />

      <div className="relative mb-5">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="h-11 w-full rounded-lg border border-zinc-800 bg-surface pl-10 pr-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-accent"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-zinc-200 mb-1">Aún no tienes clientes</p>
            <p className="text-sm text-zinc-500 mb-4">
              Copia tu enlace de invitación desde el Dashboard o Ajustes para que un cliente cree su cuenta vinculada.
            </p>
            <Link to="/t/dashboard" className="text-sm text-accent font-medium">
              Ir al Dashboard →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-10">No se encontraron clientes.</p>
        )
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <ClientCard key={entry.client.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
