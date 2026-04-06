import { Link } from 'react-router-dom';
import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import ClassificationBadge from './ClassificationBadge';

function ScoreBar({ score }) {
  const getColor = (s) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColor(score)}`}
        />
      </div>
      <span className="text-sm font-semibold text-surface-200 w-8 text-right">{Math.round(score)}</span>
    </div>
  );
}

function TrendIcon({ score }) {
  if (score >= 70) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (score >= 40) return <Minus className="w-3.5 h-3.5 text-amber-400" />;
  return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
}

export default function InterviewTable({ data = [], compact = false }) {
  if (data.length === 0) return null;

  const displayData = compact ? data.slice(0, 5) : data;

  return (
    <div className="glass-card overflow-hidden">
      {compact && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-800/30">
          <h3 className="text-sm font-semibold text-surface-200">Recent Interviews</h3>
          <Link to="/results" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View all →
          </Link>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-800/30">
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Candidate</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Truth Score</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Confidence</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Classification</th>
              <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Date</th>
              <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/20">
            {displayData.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group hover:bg-surface-800/20 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center text-xs font-semibold text-primary-400">
                      {item.candidate_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-surface-200">{item.candidate_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <ScoreBar score={item.truth_score} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <TrendIcon score={item.confidence_score} />
                    <span className="text-sm text-surface-300">{Math.round(item.confidence_score)}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <ClassificationBadge classification={item.classification} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-surface-400">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/results/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
