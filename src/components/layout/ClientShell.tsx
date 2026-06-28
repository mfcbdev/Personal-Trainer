import { Outlet } from 'react-router-dom';
import { Home, Calendar, LineChart, User } from 'lucide-react';
import { BottomNav } from './BottomNav';

const navItems = [
  { to: '/c/today', label: 'Hoy', icon: Home },
  { to: '/c/calendar', label: 'Calendario', icon: Calendar },
  { to: '/c/progress', label: 'Progreso', icon: LineChart },
  { to: '/c/profile', label: 'Perfil', icon: User },
];

export function ClientShell() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1 px-4 py-6 pb-20">
        <Outlet />
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
