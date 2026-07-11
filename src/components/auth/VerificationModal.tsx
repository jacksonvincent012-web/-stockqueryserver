import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, CheckCircle2, RefreshCw, X, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailOrPhone: string;
  type?: 'email' | 'phone';
  onVerified?: () => void;
}

export function VerificationModal({ isOpen, onClose, emailOrPhone, type = 'email', onVerified }: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'email' ? '/api/auth/verify-email' : '/api/auth/mfa-verify';
      const body = type === 'email' ? { email: emailOrPhone, code } : { username: emailOrPhone, code };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && (data.success || data.token)) {
        setSuccess(true);
        setTimeout(() => {
          if (onVerified) onVerified();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Incorrect or expired code.');
      }
    } catch (err) {
      setError('Connection error while verifying code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts exceeded. Please try again later.');
      return;
    }
    if (timer > 0) return;
    setResending(true);
    setError('');
    try {
      if (type === 'email') {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: emailOrPhone, method: 'email' })
        });
      } else {
        await fetch('/api/auth/phone-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: emailOrPhone })
        });
      }
      setResendCount(c => c + 1);
      setTimer(60);
    } catch (e) {
      setError('Failed to resend OTP.');
    } finally {
      setResending(false);
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

          {!success ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                {type === 'email' ? <Mail className="w-8 h-8 animate-pulse" /> : <Phone className="w-8 h-8 animate-pulse" />}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {type === 'email' ? 'Email Verification Required' : 'Phone OTP Verification'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a 6-digit security code to <strong className="text-slate-900 font-mono">{emailOrPhone}</strong>
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
                  💡 <strong>Testing Code:</strong> Check console logs or use code <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-600 font-bold">123456</code> for immediate verification.
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
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying Credentials...' : 'Verify & Activate Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || resending || resendCount >= 3}
                  className={`font-semibold transition-colors flex items-center gap-1 ${
                    timer > 0 || resending || resendCount >= 3 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {timer > 0 ? `Resend in ${timer}s` : `Resend OTP (${3 - resendCount} left)`}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 py-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Verification Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your identity has been confirmed. Redirecting to your secure dashboard...
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
