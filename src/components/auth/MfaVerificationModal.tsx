import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Smartphone, Mail, Lock, ArrowRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MfaVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  mfaType?: string;
  onSuccess: (token: string, role: string, user: any) => void;
  expectedRole?: string;
}

export function MfaVerificationModal({ isOpen, onClose, username, mfaType = 'app', onSuccess, expectedRole }: MfaVerificationModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter your 6-digit 2FA authentication code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, expectedRole })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (rememberDevice) {
          localStorage.setItem(`mfa_trusted_${username}`, 'true');
        }
        onSuccess(data.token, data.role, data.user);
        onClose();
      } else {
        setError(data.error || 'Invalid 2FA code. Please check your authenticator app.');
      }
    } catch (err) {
      setError('Connection error while verifying MFA token.');
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-slate-800 text-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Multi-Factor Authentication</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit code from your {mfaType === 'sms' ? 'SMS Messages' : mfaType === 'email' ? 'Registered Email' : 'Authenticator App'} for <strong className="text-slate-900 font-mono">{username}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-left">
              <p className="text-[11px] text-indigo-900 font-medium">
                💡 <strong>Testing Code:</strong> For immediate evaluation without your app, use code <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-600 font-bold">123456</code>.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl tracking-[0.4em] font-mono font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
                autoFocus
              />
            </div>

            {/* Remember device for 30 days */}
            <div 
              onClick={() => setRememberDevice(!rememberDevice)}
              className="flex items-center justify-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900 py-1"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                rememberDevice ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {rememberDevice && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <span>Trusted Device: Remember this device for 30 days</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying 2FA Token...' : 'Authenticate & Access Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
