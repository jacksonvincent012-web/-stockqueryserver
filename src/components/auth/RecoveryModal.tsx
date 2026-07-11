import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Key, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmailOrPhone?: string;
  onSuccess?: () => void;
}

export function RecoveryModal({ isOpen, onClose, defaultEmailOrPhone = "", onSuccess }: RecoveryModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState(defaultEmailOrPhone);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!identifier) {
      setError('Please enter your email or phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send recovery code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords do not match or are empty');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: identifier, code: otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Password Recovery</h2>
            <p className="text-xs text-slate-500">SQ Platform Access</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    method === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('phone'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    method === 'phone' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'email' ? 'user@sqplatform.com' : '+1 (555) 000-0000'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading || !identifier}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl tracking-[0.5em] font-mono font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 mb-3"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || !otp || !newPassword}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                {loading ? 'Resetting...' : 'Create New Password'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Password Successfully Updated</h3>
              <p className="text-sm text-slate-500 mb-6">Your password has been changed securely. You can now sign in with your new credentials.</p>
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
