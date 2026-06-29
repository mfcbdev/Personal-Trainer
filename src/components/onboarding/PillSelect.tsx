import { cn } from '../../utils/cn';

interface PillOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  options: PillOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function PillSelect({ options, value, onChange }: PillSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-11 px-5 rounded-full text-sm font-medium border transition-colors',
            value === opt.value
              ? 'bg-accent text-zinc-950 border-accent'
              : 'bg-surface text-zinc-300 border-zinc-800 hover:border-zinc-600',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
