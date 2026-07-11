import React from 'react';
import { LogOut, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  theme?: 'light' | 'dark';
}

export default function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirmLogout,
  theme = 'light'
}: LogoutConfirmationModalProps) {
  const isLight = theme === 'light';
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141f] border-slate-800 text-slate-200'
          }`}
        >
          {/* Header */}
          <div className={`px-6 py-5 border-b flex items-center justify-between ${
            isLight ? 'bg-rose-50/50 border-slate-200' : 'bg-rose-950/20 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Sign Out</h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  You're about to sign out of your SQ Platform account.
                </p>
              </div>
            </div>
            <button
              disabled={isSigningOut}
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-200/60 text-slate-400' : 'hover:bg-slate-800 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              isLight ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}>
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-bold text-sm">Are you sure you want to sign out?</p>
                <div className={`mt-2 space-y-1 text-xs opacity-95 ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                  <p className="font-semibold mb-1">After signing out:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Your session will end securely.</li>
                    <li>You'll need to sign in again to access your account.</li>
                    <li>Any unsaved changes may be lost.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}>
              <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0" />
              <span>If Remember Me was enabled, your email will remain filled in next time. Your password is never saved.</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
          }`}>
            <button
              disabled={isSigningOut}
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              disabled={isSigningOut}
              onClick={() => {
                setIsSigningOut(true);
                setTimeout(() => {
                  setIsSigningOut(false);
                  onConfirmLogout();
                  onClose();
                }, 500);
              }}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-80 text-white transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
