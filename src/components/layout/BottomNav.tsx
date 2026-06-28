import { NavLink } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-zinc-800 bg-surface sm:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs min-h-[56px] justify-center',
              isActive ? 'text-accent' : 'text-zinc-500',
            )
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
