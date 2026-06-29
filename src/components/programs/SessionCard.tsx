import { Copy, Trash2 } from 'lucide-react';
import type { SessionWithCount } from '../../hooks/useProgramBuilder';

interface SessionCardProps {
  session: SessionWithCount;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SessionCard({ session, onClick, onDuplicate, onDelete }: SessionCardProps) {
  return (
    <div className="w-36 shrink-0 rounded-lg bg-surface p-3 flex flex-col gap-2">
      <button type="button" onClick={onClick} className="text-left flex-1">
        <p className="text-sm font-medium text-zinc-50">Sesión {session.session_number}</p>
        <p className="text-xs text-zinc-500 mt-1">{session.exerciseCount} ejercicios</p>
      </button>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Duplicar sesión"
          onClick={onDuplicate}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-50"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          aria-label="Eliminar sesión"
          onClick={onDelete}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
