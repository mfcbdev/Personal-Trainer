import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div
        className={cn(
          'w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-xl sm:rounded-xl bg-surface p-5',
          className,
        )}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          {title && <h2 className="font-display text-lg text-zinc-50">{title}</h2>}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="h-11 w-11 -mr-2 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-50"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
