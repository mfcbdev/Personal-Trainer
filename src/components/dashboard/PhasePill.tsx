import { cn } from '../../utils/cn';
import { PHASE_LABELS, PHASE_COLORS, type GrowPhase } from '../../lib/constants';

export function PhasePill({ phase }: { phase: GrowPhase | null }) {
  if (!phase) {
    return <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">Sin programa</span>;
  }
  const colors = PHASE_COLORS[phase];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', colors.bg, colors.text)}>
      {phase} · {PHASE_LABELS[phase]}
    </span>
  );
}
