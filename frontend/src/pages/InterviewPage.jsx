import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import WebcamCapture from '../components/WebcamCapture';
import FileDropzone from '../components/FileDropzone';
import { analyzeInterview } from '../api/interviews';

export default function InterviewPage() {
  const navigate = useNavigate();
  const [candidateName, setCandidateName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleWebcamCapture = (file) => {
    setVideoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('candidate_name', candidateName || 'Unknown Candidate');
      if (transcript.trim()) formData.append('transcript', transcript);
      if (videoFile) formData.append('video', videoFile);
      if (audioFile) formData.append('audio', audioFile);

      const result = await analyzeInterview(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/results/${result.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasInput = candidateName.trim() || transcript.trim() || videoFile || audioFile;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">New Interview Analysis</h1>
        <p className="text-sm text-surface-500 mt-1">
          Record or upload interview data for AI-powered truthfulness analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column — Webcam & Files */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <WebcamCapture onCapture={handleWebcamCapture} />

            <div className="grid grid-cols-2 gap-4">
              <FileDropzone
                label="Upload Video"
                accept="video/*"
                type="video"
                onFile={setVideoFile}
              />
              <FileDropzone
                label="Upload Audio"
                accept="audio/*"
                type="audio"
                onFile={setAudioFile}
              />
            </div>
          </motion.div>

          {/* Right column — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Candidate Name */}
            <div className="glass-card p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-surface-300 mb-3">
                <User className="w-4 h-4 text-primary-400" />
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate's full name"
                className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Transcript */}
            <div className="glass-card p-5 flex-1">
              <label className="flex items-center gap-2 text-sm font-medium text-surface-300 mb-3">
                <FileText className="w-4 h-4 text-primary-400" />
                Interview Transcript
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste or type the interview transcript here for NLP analysis..."
                rows={10}
                className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all resize-none leading-relaxed"
              />
              <p className="text-xs text-surface-500 mt-2">
                {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : 'Optional — improves NLP accuracy'}
              </p>
            </div>

            {/* Analysis Steps Info */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-medium text-surface-300 mb-3">Analysis Pipeline</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'Facial Expression & Eye Tracking', active: !!videoFile },
                  { label: 'Voice Stress Analysis', active: !!audioFile || !!videoFile },
                  { label: 'NLP & Sentiment Analysis', active: !!transcript.trim() },
                ].map(({ label, active }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      active ? 'bg-emerald-500/20' : 'bg-surface-800/60'
                    }`}>
                      {active ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-surface-600" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${
                      active ? 'text-surface-200' : 'text-surface-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">Analysis complete! Redirecting to report...</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button
            type="submit"
            disabled={submitting || !hasInput || success}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
