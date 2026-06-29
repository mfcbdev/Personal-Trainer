import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Perfil" />
      <Link to="/c/tracking">
        <Card className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow">
          <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-50">Seguimiento semanal</p>
            <p className="text-xs text-zinc-500">Registra tu entrenamiento, nutrición y descanso</p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
