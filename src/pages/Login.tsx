import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, RefreshCw, Send, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { MfaVerificationModal } from '../components/auth/MfaVerificationModal';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  
  // Email/Password state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Phone OTP state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Common state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA Challenge state
  const [mfaOpen, setMfaOpen] = useState(false);
  const [mfaType, setMfaType] = useState('app');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const { login, openRecoveryModal } = useAuth();
  const navigate = useNavigate();

  const validateEmailOrUser = (val: string) => {
    setUsernameOrEmail(val);
    if (val.includes('@') && !val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Please enter a valid email format');
    } else {
      setEmailError('');
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please provide your username/email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameOrEmail.includes('@') ? undefined : usernameOrEmail,
          email: usernameOrEmail.includes('@') ? usernameOrEmail : undefined,
          password
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
        if (rememberMe) {
          localStorage.setItem('remembered_user', usernameOrEmail);
        }
        login(data.token, data.role || 'viewer', data.user);
        const targetDash = data.role === 'admin' ? '/admin/dashboard' : data.role === 'analyst' ? '/analyst/dashboard' : '/dashboard';
        navigate(targetDash);
      } else {
        setError(data.error || 'Invalid authentication credentials.');
      }
    } catch (err) {
      setError('Connection error to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      setError('Please enter a valid mobile phone number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullPhone = `${countryCode}${phoneNumber.replace(/[^0-9]/g, '')}`;
      const res = await fetch('/api/auth/phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpTimer(60);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) clearInterval(interval);
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to dispatch OTP SMS.');
      }
    } catch (err) {
      setError('Network error while dispatching SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit OTP received via SMS.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullPhone = `${countryCode}${phoneNumber.replace(/[^0-9]/g, '')}`;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otpCode, provider: 'phone' })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.role || 'viewer', data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
          provider: 'google'
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.role || 'viewer', data.user);
        navigate('/dashboard');
      } else {
        setError('Google OAuth session synchronization failed.');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Authentication failed: ' + (err.message || err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/30 mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to SQ Platform</h1>
          <p className="text-slate-500 mt-2">Global Trading, Investment & Market Intelligence</p>
          <p className="text-sm text-slate-400 mt-1">Secure access to your trading, investing, and market analysis workspace.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'phone' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone Number (OTP)
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => validateEmailOrUser(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  required
                />
                {emailError && <p className="text-[11px] text-rose-500 mt-1 font-medium">{emailError}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => openRecoveryModal(usernameOrEmail)}
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
                    required
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="font-medium">Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !!emailError}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <Lock className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Country & Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-40 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
                      >
                        <option value="+1">+1 (US / Canada)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (Australia)</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !phoneNumber}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Sending SMS...' : 'Receive OTP Code'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex justify-between items-center">
                    <span>SMS sent to <strong>{countryCode} {phoneNumber}</strong></span>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-indigo-600 font-bold hover:underline">Change</button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter Verification OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl tracking-[0.3em] font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0 || resendCount >= 3}
                      className={`font-semibold flex items-center gap-1 ${
                        otpTimer > 0 || resendCount >= 3 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:underline'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : `Resend OTP`}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                <path fill="#ffb900" d="M11 11h9v9h-9z"/>
              </svg>
              Continue with Microsoft
            </button>
            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Create Account</Link>
              <button
                type="button"
                onClick={() => openRecoveryModal(usernameOrEmail)}
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
              <Link to="/analyst-login" className="text-indigo-600 font-semibold hover:underline">Analyst Login</Link>
              <span className="mx-2">•</span>
              <Link to="/admin-login" className="text-indigo-600 font-semibold hover:underline">Administrator Login</Link>
            </div>
          </div>
        </div>
      </div>

      <MfaVerificationModal
        isOpen={mfaOpen}
        onClose={() => setMfaOpen(false)}
        username={usernameOrEmail}
        mfaType={mfaType}
        onSuccess={(token, role, usr) => {
          login(token, role, usr);
          const targetDash = role === 'admin' ? '/admin/dashboard' : role === 'analyst' ? '/analyst/dashboard' : '/dashboard';
          navigate(targetDash);
        }}
      />
    </div>
  );
}
