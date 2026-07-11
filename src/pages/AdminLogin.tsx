import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { MfaVerificationModal } from '../components/auth/MfaVerificationModal';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mfaOpen, setMfaOpen] = useState(false);
  const [mfaType, setMfaType] = useState('app');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const { login, openRecoveryModal } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          expectedRole: 'admin'
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.requireMfa) {
          setMfaType(data.mfaType || 'app');
          setPendingUser(data.user);
          setMfaOpen(true);
          return;
        }
        
        if (data.role !== 'admin') {
          setError('Access denied. Administrator privileges required.');
          return;
        }
        
        login(data.token, data.role, data.user);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Authentication server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/30 mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Administrator Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Platform administration and system management.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          {error && (
            <div className="p-3 mb-6 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sqplatform.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => openRecoveryModal(email)}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Authenticating...' : 'Administrator Sign In'}
              <Lock className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <Link to="/admin-request-access" className="text-indigo-600 font-semibold hover:underline">Request Administrator Access</Link>
              <button
                type="button"
                onClick={() => openRecoveryModal(email)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              </div>
              <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
            </div>
            <div className="mt-2 text-center">
              <Link to="/" className="text-indigo-600 font-semibold hover:underline">User Log In</Link>
              <span className="mx-2">•</span>
              <Link to="/analyst-login" className="text-indigo-600 font-semibold hover:underline">Analyst Login</Link>
            </div>
          </div>
        </div>
      </div>

      <MfaVerificationModal
        isOpen={mfaOpen}
        onClose={() => setMfaOpen(false)}
        username={email}
        mfaType={mfaType}
        onSuccess={(token, role, usr) => {
          login(token, role, usr);
          navigate('/admin/dashboard');
        }}
      />
    </div>
  );
}
