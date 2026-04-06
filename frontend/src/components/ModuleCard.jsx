import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

const moduleIcons = {
  facial: '👁️',
  voice: '🎙️',
  nlp: '📝',
};

const moduleLabels = {
  facial: 'Facial Analysis',
  voice: 'Voice Analysis',
  nlp: 'NLP Analysis',
};

export default function ModuleCard({ type = 'facial', data }) {
  if (!data) return null;

  const subScores = Object.entries(data.details || {}).filter(
    ([key]) => key.endsWith('_score') || key.includes('score')
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">{moduleIcons[type]}</span>
        <h4 className="text-sm font-semibold text-surface-200">{moduleLabels[type]}</h4>
      </div>

      <div className="flex items-center justify-center mb-5">
        <ScoreGauge score={data.score || data.combined_score || 0} size={100} strokeWidth={6} />
      </div>

      {/* Sub-scores */}
      {subScores.length > 0 && (
        <div className="space-y-3 mb-4">
          {subScores.map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-surface-400 capitalize">
                  {key.replace(/_/g, ' ').replace('score', '').trim()}
                </span>
                <span className="text-xs font-semibold text-surface-300">{Math.round(value)}</span>
              </div>
              <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flags */}
      {data.flags && data.flags.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-surface-800/30">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Flags</p>
          {data.flags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-surface-400">{flag}</span>
            </div>
          ))}
        </div>
      )}

      {data.flags && data.flags.length === 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-surface-800/30">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400">No flags detected</span>
        </div>
      )}
    </motion.div>
  );
}
