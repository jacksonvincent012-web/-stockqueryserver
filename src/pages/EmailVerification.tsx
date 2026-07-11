import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerification() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your email address has been successfully verified. You can now access your account.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verify Email</h1>
          <p className="text-slate-500 mt-2">Enter the verification code sent to your email.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="p-3 mb-6 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-center tracking-widest font-mono text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <p>
              Return to <Link to="/" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
