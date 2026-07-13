import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WeeklyTracking } from '../../hooks/useClientTrackingHistory';

export function TrackingTrendChart({ rows }: { rows: WeeklyTracking[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">Este cliente aún no ha registrado seguimiento semanal.</p>;
  }

  const data = rows.map((r) => ({
    week: r.week_start_date.slice(5),
    weight: r.weight,
    fatigue: r.fatigue,
    motivation: r.motivation,
  }));

  return (
    <div className="h-64 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={30} />
          <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={30} domain={[0, 10]} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="fatigue" name="Cansancio" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="motivation" name="Motivación" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
