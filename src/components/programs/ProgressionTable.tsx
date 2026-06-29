import { TrendingUp } from 'lucide-react';
import { MUSCLE_GROUPS } from '../../lib/constants';
import { useProgressions } from '../../hooks/useProgressions';
import { useToast } from '../../contexts/ToastContext';

interface ProgressionTableProps {
  programId: string;
  phaseId: string;
  weekNumbers: number[];
}

export function ProgressionTable({ programId, phaseId, weekNumbers }: ProgressionTableProps) {
  const { progressions, loading, upsertCell } = useProgressions(programId, phaseId);
  const { showError } = useToast();

  function cellFor(muscleGroup: string, weekNumber: number) {
    return progressions.find((p) => p.muscle_group === muscleGroup && p.week_number === weekNumber);
  }

  async function handleChange(
    muscleGroup: string,
    weekNumber: number,
    field: 'target_sets' | 'target_reps' | 'target_intensity',
    value: string,
  ) {
    try {
      if (field === 'target_sets') {
        await upsertCell(muscleGroup, weekNumber, { target_sets: value ? Number(value) : null });
      } else {
        await upsertCell(muscleGroup, weekNumber, { [field]: value || null });
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'No se pudo guardar.');
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Cargando progresión...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-2">
        <thead>
          <tr>
            <th className="text-left text-xs text-zinc-500 font-medium w-40">Grupo muscular</th>
            {weekNumbers.map((w) => (
              <th key={w} className="text-xs text-zinc-500 font-medium min-w-36">
                Semana {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MUSCLE_GROUPS.map((muscleGroup) => (
            <tr key={muscleGroup}>
              <td className="text-sm text-zinc-300 align-top pt-2">{muscleGroup}</td>
              {weekNumbers.map((weekNumber, i) => {
                const cell = cellFor(muscleGroup, weekNumber);
                const prevCell = i > 0 ? cellFor(muscleGroup, weekNumbers[i - 1]) : undefined;
                const increased =
                  cell?.target_sets != null && prevCell?.target_sets != null && cell.target_sets > prevCell.target_sets;

                return (
                  <td key={weekNumber} className="rounded-lg bg-surface p-2 align-top">
                    <div className="flex items-center gap-1 mb-1.5">
                      <input
                        type="number"
                        min={0}
                        placeholder="Series"
                        defaultValue={cell?.target_sets ?? ''}
                        onBlur={(e) => handleChange(muscleGroup, weekNumber, 'target_sets', e.target.value)}
                        className="h-8 w-16 rounded border border-zinc-800 bg-base px-2 text-xs text-zinc-50 outline-none focus:border-accent"
                      />
                      {increased && <TrendingUp size={14} className="text-accent shrink-0" />}
                    </div>
                    <input
                      type="text"
                      placeholder="Reps"
                      defaultValue={cell?.target_reps ?? ''}
                      onBlur={(e) => handleChange(muscleGroup, weekNumber, 'target_reps', e.target.value)}
                      className="h-8 w-full rounded border border-zinc-800 bg-base px-2 text-xs text-zinc-50 outline-none focus:border-accent mb-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Intensidad"
                      defaultValue={cell?.target_intensity ?? ''}
                      onBlur={(e) => handleChange(muscleGroup, weekNumber, 'target_intensity', e.target.value)}
                      className="h-8 w-full rounded border border-zinc-800 bg-base px-2 text-xs text-zinc-50 outline-none focus:border-accent"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
