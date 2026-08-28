import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MUSCLE_GROUPS } from '../../lib/constants';
import type { WeeklyVolumeComparison } from '../../hooks/useClientProgress';

// A palette that reads distinctly in dark mode for up to 9 muscle groups.
const MUSCLE_COLORS: Record<string, string> = {
  Pecho: '#22c55e',
  Hombros: '#38bdf8',
  Tríceps: '#a78bfa',
  Espalda: '#f97316',
  Bíceps: '#ec4899',
  Cuádriceps: '#eab308',
  'Isquiotibiales y Glúteos': '#14b8a6',
  Pantorrillas: '#f43f5e',
  Abdomen: '#94a3b8',
};

export function WeeklyComparisonChart({ data }: { data: WeeklyVolumeComparison[] }) {
  const rows = data.map((w) => ({
    label: w.label,
    ...w.byMuscle,
  }));
  const totalSets = rows.reduce(
    (s, r) =>
      s +
      Object.entries(r).reduce(
        (sum, [k, v]) => (k === 'label' ? sum : sum + (typeof v === 'number' ? v : 0)),
        0,
      ),
    0,
  );

  if (totalSets === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-6">
        Aún no hay volumen registrado en las últimas 4 semanas.
      </p>
    );
  }

  // Only draw stacks for muscle groups that actually appear in the data —
  // keeps the legend tidy and the tooltip readable.
  const activeMuscles = MUSCLE_GROUPS.filter((mg) => rows.some((r) => (r as Record<string, unknown>)[mg]));

  return (
    <div className="h-72 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value, name) => [`${value} series`, String(name)]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          {activeMuscles.map((mg) => (
            <Bar key={mg} dataKey={mg} stackId="volume" fill={MUSCLE_COLORS[mg] ?? '#71717a'} radius={[0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
