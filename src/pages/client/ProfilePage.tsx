import { Link } from 'react-router-dom';
import { ClipboardList, Dumbbell } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

interface ShortcutProps {
  to: string;
  icon: typeof ClipboardList;
  title: string;
  subtitle: string;
}

function Shortcut({ to, icon: Icon, title, subtitle }: ShortcutProps) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 hover:ring-1 hover:ring-zinc-700 transition-shadow">
        <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-50">{title}</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Perfil" />
      <div className="space-y-3">
        <Shortcut
          to="/c/tracking"
          icon={ClipboardList}
          title="Seguimiento semanal"
          subtitle="Registra tu entrenamiento, nutrición y descanso"
        />
        <Shortcut
          to="/c/exercises"
          icon={Dumbbell}
          title="Ejercicios"
          subtitle="Explora la biblioteca y aprende cada movimiento"
        />
      </div>
    </div>
  );
}
