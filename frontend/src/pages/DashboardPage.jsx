import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, AlertTriangle, TrendingUp, Video, Cpu } from 'lucide-react';
import StatCard from '../components/StatCard';
import InterviewTable from '../components/InterviewTable';
import AnalysisChart from '../components/AnalysisChart';
import ScoreDistribution from '../components/ScoreDistribution';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getResults } from '../api/interviews';

// --- Demo data for when the backend is offline ---
const demoResults = [
  { id: 1, candidate_name: 'Aarav Mehta', truth_score: 82.5, confidence_score: 88.0, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: { facial: { score: 85, flags: [] }, voice: { score: 80, flags: [] }, nlp: { score: 82, flags: [] } }, created_at: '2026-03-28T10:30:00Z' },
  { id: 2, candidate_name: 'Priya Sharma', truth_score: 64.3, confidence_score: 72.0, classification: 'Uncertain', behavioral_flags: ['Elevated voice stress'], detailed_analysis: { facial: { score: 70, flags: [] }, voice: { score: 55, flags: ['Elevated stress'] }, nlp: { score: 68, flags: [] } }, created_at: '2026-03-29T14:15:00Z' },
  { id: 3, candidate_name: 'Ravi Kumar', truth_score: 91.0, confidence_score: 94.5, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: { facial: { score: 92, flags: [] }, voice: { score: 90, flags: [] }, nlp: { score: 91, flags: [] } }, created_at: '2026-03-30T09:00:00Z' },
  { id: 4, candidate_name: 'Sneha Patel', truth_score: 35.2, confidence_score: 60.0, classification: 'Potential Deception Indicators', behavioral_flags: ['Excessive hedging', 'Gaze aversion'], detailed_analysis: { facial: { score: 30, flags: ['Gaze aversion'] }, voice: { score: 38, flags: [] }, nlp: { score: 37, flags: ['Excessive hedging'] } }, created_at: '2026-03-31T16:45:00Z' },
  { id: 5, candidate_name: 'Ankit Verma', truth_score: 76.8, confidence_score: 81.0, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: { facial: { score: 78, flags: [] }, voice: { score: 74, flags: [] }, nlp: { score: 78, flags: [] } }, created_at: '2026-04-01T08:20:00Z' },
  { id: 6, candidate_name: 'Meera Joshi', truth_score: 58.1, confidence_score: 65.3, classification: 'Uncertain', behavioral_flags: ['High speech rate variability'], detailed_analysis: { facial: { score: 60, flags: [] }, voice: { score: 52, flags: ['Speech rate variability'] }, nlp: { score: 62, flags: [] } }, created_at: '2026-04-01T11:00:00Z' },
  { id: 7, candidate_name: 'Karan Singh', truth_score: 88.4, confidence_score: 91.2, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: { facial: { score: 90, flags: [] }, voice: { score: 86, flags: [] }, nlp: { score: 89, flags: [] } }, created_at: '2026-04-01T13:30:00Z' },
];

export default function DashboardPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getResults(0, 50);
        if (data.results && data.results.length > 0) {
          setResults(data.results);
        } else {
          setResults(demoResults);
          setIsDemo(true);
        }
      } catch {
        setResults(demoResults);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const avg = (arr, key) => arr.reduce((s, r) => s + r[key], 0) / arr.length;
    const flagged = results.filter((r) => r.classification === 'Potential Deception Indicators').length;
    return {
      total: results.length,
      avgTruth: avg(results, 'truth_score'),
      avgConfidence: avg(results, 'confidence_score'),
      flagged,
    };
  }, [results]);

  const trendData = useMemo(() => {
    return results
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((r) => ({
        name: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: r.truth_score,
      }));
  }, [results]);

  const distributionData = useMemo(() => {
    const buckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
    results.forEach((r) => {
      const s = r.truth_score;
      if (s < 20) buckets['0-20']++;
      else if (s < 40) buckets['20-40']++;
      else if (s < 60) buckets['40-60']++;
      else if (s < 80) buckets['60-80']++;
      else buckets['80-100']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="No interviews yet"
        description="Start your first interview analysis to see insights here."
        action={
          <Link
            to="/interview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Video className="w-4 h-4" />
            Start Interview
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">
            Overview of interview analysis results
            {isDemo && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Demo Data
              </span>
            )}
          </p>
        </div>
        <Link
          to="/interview"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
        >
          <Video className="w-4 h-4" />
          New Interview
        </Link>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Interviews" value={stats.total} color="primary" />
          <StatCard icon={ShieldCheck} label="Avg Truth Score" value={`${stats.avgTruth.toFixed(1)}%`} color="success" />
          <StatCard icon={AlertTriangle} label="Flagged Candidates" value={stats.flagged} sub={`${((stats.flagged / stats.total) * 100).toFixed(0)}% of total`} color="danger" />
          <StatCard icon={TrendingUp} label="Avg Confidence" value={`${stats.avgConfidence.toFixed(1)}%`} color="warning" />
        </div>
      )}

      {/* Tech Stack Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-primary-400" />
          <h2 className="text-sm font-semibold text-surface-200">Powered By Advanced AI Models</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            'OpenCV – facial expression & eye tracking',
            'Speech Recognition API',
            'Machine Learning models',
            'Natural Language Processing (NLP)',
            'TensorFlow / PyTorch'
          ].map((tech) => (
            <span key={tech} className="px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-700/50 text-xs font-medium text-surface-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500/80"></span>
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AnalysisChart data={trendData} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ScoreDistribution data={distributionData} />
        </motion.div>
      </div>

      {/* Recent interviews */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <InterviewTable data={results} compact />
      </motion.div>
    </div>
  );
}
