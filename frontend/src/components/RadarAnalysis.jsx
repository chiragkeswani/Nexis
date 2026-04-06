import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarAnalysis({ data = [], title = "Module Comparison" }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-surface-200 mb-4">{title}</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(148,163,184,0.1)" />
            <PolarAngleAxis
              dataKey="module"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#475569' }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
