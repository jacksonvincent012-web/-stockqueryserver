import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, ShieldCheck, Key, Lock, Smartphone, Mail, Globe, Laptop, CheckCircle2, AlertTriangle, X, Check, Eye, EyeOff, RefreshCw, LogOut, History, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function SecurityModal({ isOpen, onClose, theme = 'light' }: SecurityModalProps) {
  const [activeTab, setActiveTab] = useState<'auth' | 'sessions' | 'devices' | 'history'>('auth');
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [isGoogleAuthLinked, setIsGoogleAuthLinked] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState('sirlilchristian@gmail.com');
  const [verifiedPhone, setVerifiedPhone] = useState('+1 (555) 892-4921');

  // Password confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetAction: () => void;
  }>({ isOpen: false, title: '', description: '', targetAction: () => {} });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isLight = theme === 'light';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmModal.isOpen) {
          setConfirmModal({ isOpen: false, title: '', description: '', targetAction: () => {} });
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, confirmModal.isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleRequestSensitiveChange = (title: string, desc: string, action: () => void) => {
    setSuccessMsg('');
    setErrorMsg('');
    setPasswordInput('');
    setConfirmModal({
      isOpen: true,
      title,
      description: desc,
      targetAction: action
    });
  };

  const executeConfirmedAction = () => {
    if (!passwordInput || passwordInput.length < 4) {
      setErrorMsg('Please enter your valid institutional account password.');
      return;
    }
    setErrorMsg('');
    confirmModal.targetAction();
    setConfirmModal({ isOpen: false, title: '', description: '', targetAction: () => {} });
    setSuccessMsg(`Successfully verified password and updated ${confirmModal.title}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const sessions = [
    { id: 'ses-1', device: 'Apple Safari on macOS', ip: '193.186.4.92', location: 'London, United Kingdom', status: 'Current Session', time: 'Active Now' },
    { id: 'ses-2', device: 'Chrome on macOS', ip: '193.186.4.92', location: 'London, United Kingdom', status: 'Active', time: '2 hours ago' },
    { id: 'ses-3', device: 'Mobile Safari on iPhone 15 Pro', ip: '82.132.218.41', location: 'London, United Kingdom', status: 'Active', time: 'Yesterday' }
  ];

  const trustedDevices = [
    { id: 'dev-1', name: 'MacBook Pro M3 Max (Institutional Laptop)', os: 'macOS 14.5 Sonoma', added: 'Jan 12, 2026', status: 'Primary Device' },
    { id: 'dev-2', name: 'iPhone 15 Pro Max (Biometric Key)', os: 'iOS 18.1', added: 'Mar 04, 2026', status: 'Trusted Authenticator' },
    { id: 'dev-3', name: 'Trading Terminal workstation-09', os: 'Ubuntu Linux 24.04 LTS', added: 'Apr 20, 2026', status: 'API Access Node' }
  ];

  const loginHistory = [
    { id: 'log-1', time: 'Today, 03:08:19 AM', ip: '193.186.4.92', location: 'London, UK', device: 'Safari / macOS', status: 'Success (2FA Verified)' },
    { id: 'log-2', time: 'Yesterday, 14:22:04 PM', ip: '193.186.4.92', location: 'London, UK', device: 'Chrome / macOS', status: 'Success (Biometric ID)' },
    { id: 'log-3', time: 'Jul 03, 2026 09:15:11 AM', ip: '82.132.218.41', location: 'London, UK', device: 'iPhone 15 Pro', status: 'Success (2FA Verified)' },
    { id: 'log-4', time: 'Jul 01, 2026 18:40:02 PM', ip: '104.28.21.90', location: 'Frankfurt, DE', device: 'Firefox / Windows', status: 'Blocked (Unrecognized IP)' },
    { id: 'log-5', time: 'Jun 28, 2026 11:02:45 AM', ip: '193.186.4.92', location: 'London, UK', device: 'Safari / macOS', status: 'Success (2FA Verified)' }
  ];

  return createPortal(
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/80 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col my-auto max-h-[85vh] ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
          }`}
        >
          {/* Header */}
          <div className={`p-5 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Enterprise Security & 2FA Center</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Institutional authentication, multi-factor verification & device telemetry
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl cursor-pointer transition-colors ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Notification Banner */}
          {successMsg && (
            <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-xs opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className={`px-5 py-2 border-b flex items-center gap-2 overflow-x-auto ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0e1420] border-slate-800'
          }`}>
            {[
              { id: 'auth', label: '2FA & Authentication', icon: <Lock className="w-3.5 h-3.5" /> },
              { id: 'sessions', label: 'Active Sessions', icon: <Globe className="w-3.5 h-3.5" /> },
              { id: 'devices', label: 'Trusted Devices', icon: <Laptop className="w-3.5 h-3.5" /> },
              { id: 'history', label: 'Login History', icon: <History className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'auth' && (
              <div className="space-y-4 max-w-3xl">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">Institutional 2FA Protection Active</h4>
                    <p className="text-xs text-blue-700/80 dark:text-blue-200/70 mt-0.5">
                      Your account requires dual-layer verification for logins, withdrawals, and sensitive API configurations.
                    </p>
                  </div>
                </div>

                {/* 2FA Master Toggle */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-3 rounded-xl ${is2FaEnabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-500'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">Two-Factor Authentication (2FA)</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          is2FaEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {is2FaEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Require a secondary cryptographic token during authentication.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestSensitiveChange(
                      is2FaEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication',
                      'You are attempting to change your primary 2FA setting. Password confirmation is required.',
                      () => setIs2FaEnabled(!is2FaEnabled)
                    )}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      is2FaEnabled
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                    }`}
                  >
                    {is2FaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Google Authenticator */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-purple-500/15 text-purple-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">Google Authenticator App</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400">
                          {isGoogleAuthLinked ? 'LINKED ✓' : 'UNLINKED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Time-based One-Time Password (TOTP) generated via mobile app.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestSensitiveChange(
                      'Reconfigure Google Authenticator Key',
                      'Generating a new QR secret will invalidate your current TOTP authenticator app tokens.',
                      () => setIsGoogleAuthLinked(true)
                    )}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Configure App
                  </button>
                </div>

                {/* Email Verification */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-blue-500/15 text-blue-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">Email Verification</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-500">
                          VERIFIED ✓
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {verifiedEmail}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestSensitiveChange(
                      'Update Verified Email Address',
                      `You are requesting to change verified email address from ${verifiedEmail}.`,
                      () => setVerifiedEmail('christian.vip@institutional.org')
                    )}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Change Email
                  </button>
                </div>

                {/* Phone Verification */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-slate-900/50'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-teal-500/15 text-teal-500">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">Phone Verification (SMS / Voice)</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-500">
                          VERIFIED ✓
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {verifiedPhone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestSensitiveChange(
                      'Update Verified Phone Number',
                      `Changing verified phone number requires institutional password confirmation.`,
                      () => setVerifiedPhone('+1 (555) 901-8842')
                    )}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    Change Phone
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">Active Authenticated Sessions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage browsers and applications currently signed into your account.</p>
                  </div>
                  <button
                    onClick={() => handleRequestSensitiveChange(
                      'Revoke All Other Sessions',
                      'This will immediately disconnect all mobile terminals and web browsers except your current session.',
                      () => {}
                    )}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Revoke All Other Sessions</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.map((ses) => (
                    <div key={ses.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl mt-0.5 ${ses.status.includes('Current') ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{ses.device}</span>
                            {ses.status.includes('Current') ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-500">
                                THIS SESSION
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800">
                                {ses.time}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                            IP: {ses.ip} • Location: {ses.location}
                          </div>
                        </div>
                      </div>
                      {!ses.status.includes('Current') && (
                        <button
                          onClick={() => handleRequestSensitiveChange(
                            `Revoke Session: ${ses.device}`,
                            `Are you sure you want to log out session on IP ${ses.ip}?`,
                            () => {}
                          )}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm">Trusted Institutional Devices</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Devices authorized to skip 2FA challenges for 30 days.</p>
                </div>

                <div className="space-y-3">
                  {trustedDevices.map((dev) => (
                    <div key={dev.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-500 mt-0.5">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{dev.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20">
                              {dev.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                            OS: {dev.os} • Added: {dev.added}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRequestSensitiveChange(
                          `Revoke Trusted Device: ${dev.name}`,
                          `Revoking trust will force an immediate 2FA challenge on next login from ${dev.os}.`,
                          () => {}
                        )}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        Remove Trust
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm">Institutional Login & Access Log</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Audit trail of recent authentication attempts across all interfaces.</p>
                </div>

                <div className={`rounded-2xl border overflow-hidden ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? 'bg-slate-100/80 text-slate-600' : 'bg-slate-900 text-slate-400'}`}>
                        <th className="p-3 font-bold">Timestamp</th>
                        <th className="p-3 font-bold">IP Address</th>
                        <th className="p-3 font-bold">Location</th>
                        <th className="p-3 font-bold">Device / OS</th>
                        <th className="p-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {loginHistory.map((log) => (
                        <tr key={log.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                          <td className="p-3 font-semibold">{log.time}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{log.ip}</td>
                          <td className="p-3">{log.location}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{log.device}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status.includes('Success')
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer with easy close button & hint */}
          <div className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">ESC</kbd> or click backdrop to close</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done & Close</span>
            </button>
          </div>

          {/* Password Confirmation Modal Overlay */}
          <AnimatePresence>
            {confirmModal.isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', targetAction: () => {} })}
                className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 10 }}
                  className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border my-auto ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#131b2e] border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/15 text-amber-500">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Security Verification Required</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Password Confirmation</p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 font-sans">
                    <strong className="block font-bold mb-0.5 text-slate-900 dark:text-white">{confirmModal.title}</strong>
                    {confirmModal.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                        Enter Account Password to Authorize:
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => {
                            setPasswordInput(e.target.value);
                            if (errorMsg) setErrorMsg('');
                          }}
                          placeholder="••••••••••••••••"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isLight
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') executeConfirmedAction();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errorMsg && (
                        <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{errorMsg}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ isOpen: false, title: '', description: '', targetAction: () => {} })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={executeConfirmedAction}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Authorize</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
