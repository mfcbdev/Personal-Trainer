import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MUSCLE_GROUPS } from '../../lib/constants';
import type { VolumeByMuscleGroup } from '../../hooks/useClientProgress';

export function VolumeChart({ data }: { data: VolumeByMuscleGroup[] }) {
  const byGroup = new Map(data.map((d) => [d.muscleGroup, d.sets]));
  const rows = MUSCLE_GROUPS.map((mg) => ({ muscleGroup: mg, sets: byGroup.get(mg) ?? 0 }));
  const total = rows.reduce((s, r) => s + r.sets, 0);

  if (total === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">Aún no has completado sesiones esta semana.</p>;
  }

  return (
    <div className="h-64 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="muscleGroup" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} height={40} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value) => [`${value} series`, 'Volumen']}
          />
          <Bar dataKey="sets" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
