import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-600/20 to-primary-400/5 border-primary-500/20 text-primary-400',
    success: 'from-emerald-600/20 to-emerald-400/5 border-emerald-500/20 text-emerald-400',
    warning: 'from-amber-600/20 to-amber-400/5 border-amber-500/20 text-amber-400',
    danger: 'from-red-600/20 to-red-400/5 border-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} border p-5 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-surface-800/60 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorMap[color].split(' ').pop()}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-surface-100">{value}</p>
      <p className="text-sm text-surface-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
    </motion.div>
  );
}
