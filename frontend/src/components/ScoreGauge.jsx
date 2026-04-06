import { useEffect, useState } from 'react';

export default function ScoreGauge({ score = 0, size = 120, strokeWidth = 8, label = '' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 70) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'rgba(16, 185, 129, 0.1)' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'rgba(245, 158, 11, 0.1)' };
    return { stroke: '#ef4444', text: 'text-red-400', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color.text}`}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      {label && <span className="text-sm text-surface-400">{label}</span>}
    </div>
  );
}
