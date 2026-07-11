import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Smartphone, RefreshCw, X, CheckCircle2, ShieldCheck, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export function SystemMessagesModal({ isOpen, onClose, theme = 'light' }: SystemMessagesModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'EMAIL' | 'SMS'>('ALL');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/messages');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMessages(data);
      }
    } catch (e) {
      // Ignore in SQ Platform
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const isDark = theme === 'dark';
  const filtered = filter === 'ALL' ? messages : messages.filter(m => m.type === filter);

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Send className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Live SQ Platform Email & SMS Dispatcher</h2>
              <p className="text-xs text-slate-500">Real-time log of verification emails, 2FA codes, and security alerts</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
              {(['ALL', 'EMAIL', 'SMS'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === f 
                      ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {f === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                  {f === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                  {f === 'ALL' ? 'All Channels' : f}
                </button>
              ))}
            </div>

            <button
              onClick={fetchMessages}
              disabled={loading}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Feeds
            </button>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {loading && messages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Scanning messaging gateways...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No verification messages or security alerts dispatched yet. Perform a login, registration, or password reset!</div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? 'bg-slate-800/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${
                        msg.type === 'EMAIL' 
                          ? isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                          : isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {msg.type === 'EMAIL' ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                        {msg.type} DISPATCHED
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">To: {msg.recipient}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.subject && (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Subject: {msg.subject}</p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {msg.body}
                  </p>

                  {msg.code && (
                    <div className="mt-2.5 flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                      <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300">
                        ⚡ Verification Code / OTP:
                      </span>
                      <span className="font-mono text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded shadow-sm">
                        {msg.code}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>📡 Global Trading SMTP / SMS High-Throughput Gateway</span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all shadow-md"
            >
              Close Feed
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
