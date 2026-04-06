import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText } from 'lucide-react';
import InterviewTable from '../components/InterviewTable';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getResults } from '../api/interviews';

const demoResults = [
  { id: 1, candidate_name: 'Aarav Mehta', truth_score: 82.5, confidence_score: 88.0, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: {}, created_at: '2026-03-28T10:30:00Z' },
  { id: 2, candidate_name: 'Priya Sharma', truth_score: 64.3, confidence_score: 72.0, classification: 'Uncertain', behavioral_flags: ['Elevated voice stress'], detailed_analysis: {}, created_at: '2026-03-29T14:15:00Z' },
  { id: 3, candidate_name: 'Ravi Kumar', truth_score: 91.0, confidence_score: 94.5, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: {}, created_at: '2026-03-30T09:00:00Z' },
  { id: 4, candidate_name: 'Sneha Patel', truth_score: 35.2, confidence_score: 60.0, classification: 'Potential Deception Indicators', behavioral_flags: ['Excessive hedging', 'Gaze aversion'], detailed_analysis: {}, created_at: '2026-03-31T16:45:00Z' },
  { id: 5, candidate_name: 'Ankit Verma', truth_score: 76.8, confidence_score: 81.0, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: {}, created_at: '2026-04-01T08:20:00Z' },
  { id: 6, candidate_name: 'Meera Joshi', truth_score: 58.1, confidence_score: 65.3, classification: 'Uncertain', behavioral_flags: ['High speech rate variability'], detailed_analysis: {}, created_at: '2026-04-01T11:00:00Z' },
  { id: 7, candidate_name: 'Karan Singh', truth_score: 88.4, confidence_score: 91.2, classification: 'Likely Truthful', behavioral_flags: [], detailed_analysis: {}, created_at: '2026-04-01T13:30:00Z' },
  { id: 8, candidate_name: 'Neha Gupta', truth_score: 45.6, confidence_score: 55.8, classification: 'Uncertain', behavioral_flags: ['Inconsistent responses'], detailed_analysis: {}, created_at: '2026-04-01T15:00:00Z' },
];

const classificationOptions = ['All', 'Likely Truthful', 'Uncertain', 'Potential Deception Indicators'];

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getResults(0, 100);
        setResults(data.results?.length > 0 ? data.results : demoResults);
      } catch {
        setResults(demoResults);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let data = results;
    if (filter !== 'All') {
      data = data.filter((r) => r.classification === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.candidate_name.toLowerCase().includes(q));
    }
    return data;
  }, [results, search, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Interview Reports</h1>
        <p className="text-sm text-surface-500 mt-1">{results.length} candidate analyses</p>
      </div>

      {/* Filters row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2.5 bg-surface-800/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all cursor-pointer"
          >
            {classificationOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results */}
      {filtered.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <InterviewTable data={filtered} />
        </motion.div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No results found"
          description="Try adjusting your search or filter criteria."
        />
      )}
    </div>
  );
}
