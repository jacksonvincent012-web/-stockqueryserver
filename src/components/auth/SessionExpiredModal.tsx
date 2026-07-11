import React from 'react';
import { Lock, LogIn, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onReLogin: () => void;
  theme?: 'light' | 'dark';
}

export default function SessionExpiredModal({
  isOpen,
  onReLogin,
  theme = 'light'
}: SessionExpiredModalProps) {
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.25 }}
          className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141f] border-slate-800 text-slate-200'
          }`}
        >
          {/* Header Banner */}
          <div className="p-8 text-center border-b border-slate-800/60 bg-gradient-to-b from-amber-500/10 to-transparent flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Session Expired</h3>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              SQ Platform Security Protocol Active
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className={`p-4 rounded-xl border text-center space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-center gap-2 text-amber-500 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>30 Minutes of Inactivity Detected</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                To protect your financial accounts and SQ Platform trading data, your authenticated session has been expired automatically. All cached tokens and WebSocket streams have been securely closed.
              </p>
            </div>

            <div className={`text-xs px-3.5 py-2.5 rounded-lg border flex items-center gap-2.5 ${
              isLight ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-blue-950/40 border-blue-800/60 text-blue-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
              <span>Please log in again to verify your identity and resume trading.</span>
            </div>
          </div>

          {/* Action */}
          <div className={`p-6 pt-2 border-t ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
          }`}>
            <button
              onClick={onReLogin}
              className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Account</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
