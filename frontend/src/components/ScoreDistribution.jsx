import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  '0-20': '#ef4444',
  '20-40': '#f97316',
  '40-60': '#f59e0b',
  '60-80': '#10b981',
  '80-100': '#06b6d4',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 !border-surface-700/50">
      <p className="text-xs text-surface-400 mb-1">Score Range: {payload[0].payload.range}</p>
      <p className="text-sm font-semibold text-primary-400">{payload[0].value} candidates</p>
    </div>
  );
};

export default function ScoreDistribution({ data = [] }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-surface-200 mb-4">Score Distribution</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell key={entry.range} fill={COLORS[entry.range] || '#6366f1'} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
