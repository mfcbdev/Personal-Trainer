import type { VolumeByMuscleGroup } from '../../hooks/useClientProgress';

// Heat scale: 0 sets = zinc-800, 1-4 = muted, 5-9 = medium, 10-14 = warm, 15+ = hot.
function heatColor(sets: number): string {
  if (sets === 0) return '#27272a';
  if (sets < 5) return '#166534';
  if (sets < 10) return '#22c55e';
  if (sets < 15) return '#f59e0b';
  return '#ef4444';
}

// Muscle regions on a stylized front + back silhouette. Coordinates target
// a 200x300 viewBox per view. Each region is keyed to a muscle_group name
// (matching the values in lib/constants.ts).
interface Region {
  key: string;
  path: string;
  view: 'front' | 'back';
}

const REGIONS: Region[] = [
  // Front view (viewBox x: 0-200)
  { view: 'front', key: 'Hombros', path: 'M50,60 Q40,55 42,72 L60,78 L72,68 Z M150,60 Q160,55 158,72 L140,78 L128,68 Z' },
  { view: 'front', key: 'Pecho', path: 'M72,68 L128,68 L140,90 Q100,105 60,90 Z' },
  { view: 'front', key: 'Bíceps', path: 'M42,72 L50,110 L36,112 L32,80 Z M158,72 L150,110 L164,112 L168,80 Z' },
  { view: 'front', key: 'Abdomen', path: 'M74,105 L126,105 L128,165 Q100,175 72,165 Z' },
  { view: 'front', key: 'Cuádriceps', path: 'M72,175 L100,180 L96,255 L70,258 Z M128,175 L100,180 L104,255 L130,258 Z' },
  { view: 'front', key: 'Pantorrillas', path: 'M70,258 L96,258 L92,295 L74,295 Z M104,258 L130,258 L126,295 L108,295 Z' },
  // Back view (viewBox x: 220-420, so add 220 offset)
  { view: 'back', key: 'Espalda', path: 'M272,68 L348,68 L354,140 Q310,150 266,140 Z' },
  { view: 'back', key: 'Tríceps', path: 'M262,72 L270,112 L256,114 L252,80 Z M358,72 L350,112 L364,114 L368,80 Z' },
  { view: 'back', key: 'Isquiotibiales y Glúteos', path: 'M272,175 L320,180 L316,255 L268,258 Z M320,180 L348,175 L352,258 L316,255 Z' },
  { view: 'back', key: 'Pantorrillas', path: 'M268,258 L316,258 L312,295 L272,295 Z M316,258 L352,258 L348,295 L316,295 Z' },
];

const SILHOUETTE_STROKE = '#3f3f46';

export function MuscleHeatmap({ data }: { data: VolumeByMuscleGroup[] }) {
  const setsByGroup = new Map(data.map((d) => [d.muscleGroup, d.sets]));

  function fillFor(key: string) {
    return heatColor(setsByGroup.get(key) ?? 0);
  }

  return (
    <div>
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 420 320" className="w-full" role="img" aria-label="Mapa de calor muscular">
          {/* Front silhouette outline */}
          <g stroke={SILHOUETTE_STROKE} strokeWidth="1.5" fill="none">
            <ellipse cx="100" cy="35" rx="18" ry="22" />
            <path d="M62,58 Q30,60 38,120 L46,175 L60,180 L60,300 L82,300 L88,180 L112,180 L118,300 L140,300 L140,180 L154,175 L162,120 Q170,60 138,58 Z" />
            {/* Back silhouette outline */}
            <ellipse cx="320" cy="35" rx="18" ry="22" />
            <path d="M282,58 Q250,60 258,120 L266,175 L280,180 L280,300 L302,300 L308,180 L332,180 L338,300 L360,300 L360,180 L374,175 L382,120 Q390,60 358,58 Z" />
          </g>
          {/* Muscle regions */}
          {REGIONS.map((region) => (
            <path
              key={`${region.view}-${region.key}`}
              d={region.path}
              fill={fillFor(region.key)}
              stroke={SILHOUETTE_STROKE}
              strokeWidth="0.5"
              opacity="0.9"
            />
          ))}
          <text x="100" y="315" textAnchor="middle" fontSize="10" fill="#71717a">Frente</text>
          <text x="320" y="315" textAnchor="middle" fontSize="10" fill="#71717a">Espalda</text>
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-zinc-500">
        <LegendChip color="#27272a" label="0" />
        <LegendChip color="#166534" label="1-4" />
        <LegendChip color="#22c55e" label="5-9" />
        <LegendChip color="#f59e0b" label="10-14" />
        <LegendChip color="#ef4444" label="15+" />
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
