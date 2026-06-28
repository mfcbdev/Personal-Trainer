import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

const navItems = [
  { to: '/t/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/t/clients', label: 'Clientes', icon: Users },
  { to: '/t/exercises', label: 'Ejercicios', icon: Dumbbell },
  { to: '/t/settings', label: 'Ajustes', icon: Settings },
];

export function TrainerShell() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 px-4 py-6 pb-20 sm:pb-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <BottomNav items={navItems} />
    </div>
  );
}
