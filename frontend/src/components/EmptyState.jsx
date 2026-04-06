import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', description = '', action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-800/60 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-surface-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
