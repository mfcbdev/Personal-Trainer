import { NavLink } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden sm:flex sm:flex-col sm:w-56 sm:shrink-0 border-r border-zinc-800 bg-surface px-3 py-6 gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              isActive ? 'bg-accent/15 text-accent' : 'text-zinc-400 hover:text-zinc-50',
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
