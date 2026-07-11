import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Laptop, Smartphone, Globe, Clock, ShieldAlert, LogOut, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function ActiveSessionsModal({ isOpen, onClose, theme = 'light' }: ActiveSessionsModalProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setSessions(data);
      }
    } catch (e) {
      setError('Failed to fetch active device sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleRevoke = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        setSuccessMsg('Session successfully revoked and signed out.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      setError('Failed to revoke session.');
    }
  };

  const isDark = theme === 'dark';

  return createPortal(
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
          }`}
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Active Security Sessions</h2>
              <p className="text-xs text-slate-500">Manage device authorizations and revoke suspicious logins</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authenticated Endpoints ({sessions.length})</span>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {loading && sessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Scanning active sessions across security nodes...</div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No active remote sessions found.</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    sess.isCurrent 
                      ? isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200' 
                      : isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl ${
                      sess.device?.includes('Mobile') 
                        ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        : isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {sess.device?.includes('Mobile') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">{sess.browser} on {sess.os}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm uppercase">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {sess.ip} ({sess.country})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Logged in at {sess.loginTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevoke(sess.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>🔒 SQ Platform Zero-Trust Session Enforcement</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
