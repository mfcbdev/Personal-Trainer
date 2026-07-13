import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WeightPoint } from '../../hooks/useClientProgress';

export function WeightChart({ points }: { points: WeightPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">Aún no hay datos de peso.</p>;
  }

  const data = points.map((p) => ({ date: p.date.slice(5), weight: p.weight }));

  return (
    <div className="h-56 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} width={36} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value) => [`${value} kg`, 'Peso']}
          />
          <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
