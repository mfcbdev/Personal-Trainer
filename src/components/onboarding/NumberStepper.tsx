import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberStepper({ value, onChange, min = 0, max = 999999, step = 1, suffix }: NumberStepperProps) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Disminuir"
        onClick={() => onChange(clamp(value - step))}
        className="h-11 w-11 flex items-center justify-center rounded-lg bg-surface text-zinc-300 hover:text-zinc-50"
      >
        <Minus size={18} />
      </button>
      <span className="min-w-16 text-center font-mono text-lg text-zinc-50">
        {value}
        {suffix && <span className="text-sm text-zinc-500"> {suffix}</span>}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => onChange(clamp(value + step))}
        className="h-11 w-11 flex items-center justify-center rounded-lg bg-surface text-zinc-300 hover:text-zinc-50"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
