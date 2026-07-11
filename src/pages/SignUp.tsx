import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, username, email, phone, country, preferredCurrency, password, photoURL
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        navigate("/verify-email");
      } else {
        setError(data.error || 'Failed to register');
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
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h2>
          <p className="text-slate-600 text-sm mb-6">
            {successMessage}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/30 mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2">Join SQ Platform to access global trading and market intelligence.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="p-3 mb-6 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-3">Profile Photo (Optional)</label>
              <ProfilePhotoUpload photoURL={photoURL} setPhotoURL={setPhotoURL} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="JP">Japan</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">UAE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Currency</label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>I accept the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Creating Account...
                </div>
              ) : (
                <>Create Account <UserPlus className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <p>
              Already have an account? <Link to="/" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
