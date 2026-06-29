import { cn } from '../../utils/cn';
import type { FrequencyScale } from '../../lib/database.types';

const OPTIONS: { value: FrequencyScale; label: string }[] = [
  { value: 'never', label: 'Nunca' },
  { value: 'sometimes', label: 'A veces' },
  { value: 'often', label: 'Frecuente' },
  { value: 'always', label: 'Siempre' },
];

interface FrequencySelectProps {
  value: FrequencyScale | undefined;
  onChange: (value: FrequencyScale) => void;
}

export function FrequencySelect({ value, onChange }: FrequencySelectProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-11 rounded-lg text-xs font-medium border transition-colors',
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
