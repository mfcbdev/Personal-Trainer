import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function TopBar() {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-8 border-b border-zinc-800 bg-surface">
      <span className="font-display text-base font-semibold text-zinc-50">GROW</span>
      <button
        type="button"
        onClick={() => signOut()}
        aria-label="Cerrar sesión"
        className="flex items-center gap-2 h-11 px-3 -mr-3 text-sm text-zinc-400 hover:text-zinc-50"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </header>
  );
}
