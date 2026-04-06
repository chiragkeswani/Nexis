import { Bell, Search, LogOut, User as UserIcon, Settings, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-surface-800/50 glass flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="Search candidates..."
          className="w-full pl-10 pr-4 py-2 bg-surface-800/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="relative p-2 rounded-xl text-surface-400 hover:bg-surface-800/60 hover:text-surface-200 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-surface-400 hover:bg-surface-800/60 hover:text-surface-200 transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full animate-pulse-glow" />
          </button>
          
          <AnimatePresence>
            {showNotifMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 glass-card p-4 shadow-xl z-50 origin-top-right border border-surface-700/50"
              >
                <h3 className="text-sm font-semibold text-surface-200 mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-surface-200 font-medium">Interview complete</p>
                      <p className="text-surface-400 text-xs mt-0.5">Aarav Mehta's analysis is ready</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-surface-600 flex-shrink-0" />
                    <div>
                      <p className="text-surface-200 font-medium">System Update</p>
                      <p className="text-surface-400 text-xs mt-0.5">New NLP models available</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-surface-800/40 p-1.5 pr-3 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-surface-200 leading-tight">{user?.name || 'Recruiter'}</p>
              <p className="text-xs text-surface-500">{user?.role || 'Admin'}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-xl z-50 origin-top-right border border-surface-700/50"
              >
                <div className="px-4 py-2 border-b border-surface-800/50 mb-1">
                  <p className="text-sm font-medium text-surface-200">{user?.name || 'User'}</p>
                  <p className="text-xs text-surface-500">{user?.email || 'user@example.com'}</p>
                </div>
                
                <button 
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile & Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
