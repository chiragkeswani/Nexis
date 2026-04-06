import { motion } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 overflow-hidden relative group"
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors duration-500" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-400" />
          </div>
          <h3 className="text-base font-bold text-surface-100 italic">Talent Intelligence Summary</h3>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-800/50 border border-surface-700/30">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">AI Insights</span>
        </div>
      </div>

      <div className="relative">
        <p className="text-sm leading-relaxed text-surface-300 font-medium">
          {summary}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-surface-800/50">
        <Info className="w-3.5 h-3.5 text-surface-500" />
        <p className="text-[11px] text-surface-500 italic">
          This behavior summary is synthesized from multi-modal AI signals including facial gaze, voice stress, and linguistic patterns.
        </p>
      </div>
    </motion.div>
  );
}
