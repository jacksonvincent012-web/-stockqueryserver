import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

export default function AdminRequestAccess() {
  const [fullName, setFullName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [reasonForAccess, setReasonForAccess] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    setLoading(true);
    try {
      const res = await fetch('/api/register/admin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, organization, email, phone, position, reasonForAccess, photoURL, password
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit request');
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
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted</h2>
          <p className="text-slate-600 text-sm mb-6">
            {successMessage}
          </p>
          <button
            onClick={() => navigate('/admin-login')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Return to Admin Login
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
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Registration</h1>
          <p className="text-slate-500 mt-2">Create an administrator account to access platform management capabilities.</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-3">Profile Photo (Recommended)</label>
              <ProfilePhotoUpload photoURL={photoURL} setPhotoURL={setPhotoURL} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization</label>
                <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Position</label>
              <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Access</label>
              <textarea 
                rows={2} 
                value={reasonForAccess} 
                onChange={(e) => setReasonForAccess(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none" 
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
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
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Registering...
                </div>
              ) : (
                <>Register Admin Account <CheckCircle className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <p>
              Already have an admin account? <Link to="/admin-login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
