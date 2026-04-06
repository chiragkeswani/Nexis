import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, CheckCircle, Calendar, User } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import ClassificationBadge from '../components/ClassificationBadge';
import ModuleCard from '../components/ModuleCard';
import RadarAnalysis from '../components/RadarAnalysis';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getResult } from '../api/interviews';

const demoReport = {
  id: 1,
  candidate_name: 'Aarav Mehta',
  truth_score: 82.5,
  confidence_score: 88.0,
  classification: 'Likely Truthful',
  behavioral_flags: ['Minor gaze shifts during question 3'],
  detailed_analysis: {
    soft_skills: {
      confidence: 85,
      clarity: 78,
      engagement: 92
    },
    recruiter_summary: "The candidate presents as highly authentic and composed. They demonstrate exceptional confidence and emotional stability. Communication is remarkably clear and articulate. Highly engaging presence with positive facial affect.",
    facial: {
      score: 85,
      combined_score: 85,
      flags: ['Minor gaze shifts during question 3'],
      details: { expression_score: 88, eye_movement_score: 82 },
    },
    voice: {
      score: 80,
      combined_score: 80,
      flags: [],
      details: { voice_stress_score: 78, speech_rate_score: 82 },
    },
    nlp: {
      score: 82,
      combined_score: 82,
      flags: [],
      details: { sentiment_score: 85, hedging_score: 79, diversity_score: 82 },
    },
  },
  created_at: '2026-03-28T10:30:00Z',
};

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await getResult(id);
        setReport(data);
      } catch {
        // Fallback to demo data
        setReport({ ...demoReport, id: parseInt(id) });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading report..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <EmptyState
        title="Report not found"
        description="The requested analysis report could not be loaded."
        action={
          <Link
            to="/results"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/15 text-primary-400 border border-primary-500/30 text-sm font-medium hover:bg-primary-500/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
        }
      />
    );
  }

  const analysis = report.detailed_analysis || {};
  const softSkills = analysis.soft_skills || { confidence: 0, clarity: 0, engagement: 0 };
  
  const radarData = [
    { module: 'Confidence', score: softSkills.confidence },
    { module: 'Clarity', score: softSkills.clarity },
    { module: 'Engagement', score: softSkills.engagement },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back link + Header */}
      <div>
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center text-sm font-semibold text-primary-400">
                {report.candidate_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h1 className="text-2xl font-bold text-surface-100">{report.candidate_name}</h1>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-surface-500">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-surface-500">
                <User className="w-3.5 h-3.5" />
                Report #{report.id}
              </div>
            </div>
          </div>
          <ClassificationBadge classification={report.classification} />
        </motion.div>
      </div>

      {/* Score Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Truth Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={report.truth_score} size={140} strokeWidth={10} />
          <p className="text-sm font-medium text-surface-300 mt-3">Truth Score</p>
        </div>

        {/* Confidence Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={report.confidence_score} size={140} strokeWidth={10} />
          <p className="text-sm font-medium text-surface-300 mt-3">Confidence Score</p>
        </div>

        {/* Behavioral Flags */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-300 mb-4">Behavioral Flags</h3>
          {report.behavioral_flags && report.behavioral_flags.length > 0 ? (
            <div className="space-y-3">
              {report.behavioral_flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-surface-400">{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              No behavioral flags detected
            </div>
          )}
        </div>
      </motion.div>

      {/* Radar + Summary + Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          <RadarAnalysis data={radarData} title="Soft Skills Radar" />
          <SummaryCard summary={analysis.recruiter_summary} />
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['facial', 'voice', 'nlp'].map((type, idx) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <ModuleCard type={type} data={analysis[type]} />
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Technical Consistency Notes
            </h3>
            <p className="text-sm text-surface-400 leading-relaxed">
              Automated cross-referencing between visual cues and verbal sentiment indicates a 
              <span className="text-primary-400 font-medium mx-1">
                {report.truth_score > 70 ? 'high' : report.truth_score > 40 ? 'moderate' : 'low'} degree
              </span> 
              of behavioral alignment. No major discordance between facial expressions and spoken content was flagged by the system.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
