import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyCompositionPoint } from '../../hooks/useClientProgress';

export function BodyCompositionChart({ points }: { points: BodyCompositionPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">Aún no hay mediciones de composición corporal.</p>;
  }

  const data = points.map((p) => ({ date: p.date.slice(5), fatMass: p.fatMass, leanMass: p.leanMass }));

  return (
    <div className="h-56 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={36} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value, name) => [`${value} kg`, name === 'fatMass' ? 'Masa grasa' : 'Masa magra']}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
            formatter={(name) => (name === 'fatMass' ? 'Masa grasa' : 'Masa magra')}
          />
          <Line type="monotone" dataKey="leanMass" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
          <Line type="monotone" dataKey="fatMass" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
