import { cn } from '../../utils/cn';
import { GROW_PHASES, PHASE_LABELS, PHASE_COLORS, type GrowPhase } from '../../lib/constants';

interface PhaseTabsProps {
  value: GrowPhase;
  onChange: (phase: GrowPhase) => void;
}

export function PhaseTabs({ value, onChange }: PhaseTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
      {GROW_PHASES.map((phase) => {
        const colors = PHASE_COLORS[phase];
        const active = value === phase;
        return (
          <button
            key={phase}
            type="button"
            onClick={() => onChange(phase)}
            className={cn(
              'h-11 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
              active ? colors.bg : 'bg-surface',
              active ? colors.text : 'text-zinc-500',
            )}
          >
            {phase} · {PHASE_LABELS[phase]}
          </button>
        );
      })}
    </div>
  );
}
