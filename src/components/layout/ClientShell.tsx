import { Outlet } from 'react-router-dom';
import { Home, Calendar, LineChart, User, ClipboardList, Dumbbell } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const navItems = [
  { to: '/c/today', label: 'Hoy', icon: Home },
  { to: '/c/calendar', label: 'Calendario', icon: Calendar },
  { to: '/c/progress', label: 'Progreso', icon: LineChart },
  { to: '/c/profile', label: 'Perfil', icon: User },
];

const sidebarItems = [
  ...navItems,
  { to: '/c/exercises', label: 'Ejercicios', icon: Dumbbell },
  { to: '/c/tracking', label: 'Seguimiento', icon: ClipboardList },
];

export function ClientShell() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 min-w-0 px-4 py-6 pb-20 sm:pb-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <BottomNav items={navItems} />
    </div>
  );
}
