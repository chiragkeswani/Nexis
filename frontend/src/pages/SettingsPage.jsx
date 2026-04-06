import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Server, Bell, Shield, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className="w-4.5 h-4.5 text-primary-400" />
        <h3 className="text-sm font-semibold text-surface-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-800/20 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-surface-300">{label}</p>
        {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked = false, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out flex items-center px-0.5 cursor-pointer ${
        checked ? 'bg-primary-600' : 'bg-surface-600'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  // Local state for mock settings so toggles animate on click
  const [animations, setAnimations] = useState(true);
  const [compact, setCompact] = useState(false);
  const [notifAnalysis, setNotifAnalysis] = useState(true);
  const [notifRisk, setNotifRisk] = useState(true);
  const [autoCleanup, setAutoCleanup] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 mt-1">Manage your preferences and configuration</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* API Status */}
        <SettingsSection icon={Server} title="Backend Connection">
          <div className="flex items-center justify-between p-3 bg-surface-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-surface-200">API Server</p>
                <p className="text-xs text-surface-500">http://localhost:8000</p>
              </div>
            </div>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-all"
            >
              API Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance">
          <SettingRow label="Dark Mode" description="Toggle between light and dark themes">
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </SettingRow>
          <SettingRow label="Animations" description="Enable smooth transitions and micro-animations">
            <Toggle checked={animations} onChange={setAnimations} />
          </SettingRow>
          <SettingRow label="Compact View" description="Reduce spacing in tables and cards">
            <Toggle checked={compact} onChange={setCompact} />
          </SettingRow>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications">
          <SettingRow label="Analysis Complete" description="Get notified when an analysis finishes">
            <Toggle checked={notifAnalysis} onChange={setNotifAnalysis} />
          </SettingRow>
          <SettingRow label="High-Risk Alerts" description="Immediate alerts for flagged candidates">
            <Toggle checked={notifRisk} onChange={setNotifRisk} />
          </SettingRow>
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon={Shield} title="Analysis Defaults">
          <SettingRow label="Auto-Cleanup Uploads" description="Automatically delete uploaded files after analysis">
            <Toggle checked={autoCleanup} onChange={setAutoCleanup} />
          </SettingRow>
          <SettingRow label="Confidence Threshold" description="Minimum confidence for reliable results">
            <span className="text-sm font-semibold text-primary-400">60%</span>
          </SettingRow>
        </SettingsSection>
      </motion.div>

      <p className="text-xs text-surface-600 text-center py-4">
        Envision v1.0.0 — AI Interview Analysis Platform
      </p>
    </div>
  );
}
