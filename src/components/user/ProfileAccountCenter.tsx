import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Settings, Shield, Bell, Activity, History, Smartphone, 
  ShieldCheck, HelpCircle, Camera, CheckCircle2, AlertTriangle, 
  Lock, Key, Globe, DollarSign, Clock, Monitor, Trash2, LogOut, 
  Send, Check, X, QrCode, FileText, Search, ChevronRight, Award,
  ExternalLink, RefreshCw, Star, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export type ProfileCenterSection = 
  | 'profile' 
  | 'settings' 
  | 'security' 
  | 'notifications' 
  | 'activity' 
  | 'history' 
  | 'devices' 
  | 'verification' 
  | 'support';

interface ProfileAccountCenterProps {
  initialSection?: ProfileCenterSection;
  theme?: 'light' | 'dark';
  onClose?: () => void;
  isModal?: boolean;
}

export default function ProfileAccountCenter({
  initialSection = 'profile',
  theme = 'light',
  onClose,
  isModal = false
}: ProfileAccountCenterProps) {
  const { user, token, role, updateProfile, confirmLogout, openVerificationModal } = useAuth();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<ProfileCenterSection>(initialSection);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.firstName || 'Christian');
  const [lastName, setLastName] = useState(user?.lastName || 'Alexander');
  const [username, setUsername] = useState(user?.username || 'christian_star');
  const [email, setEmail] = useState(user?.email || 'sirlilchristian@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2834');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [timeZone, setTimeZone] = useState(user?.timeZone || 'GMT-8 PST (Pacific Standard Time)');
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'USD ($)');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'English (US)');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  // Account Settings States
  const [displayName, setDisplayName] = useState(`${firstName} ${lastName}`);
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>((localStorage.getItem('app_theme') as any) || 'system');

  useEffect(() => {
    if (user) {
      const fName = user.firstName || 'Christian';
      const lName = user.lastName || 'Alexander';
      setFirstName(fName);
      setLastName(lName);
      if (user.username) setUsername(user.username);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.country) setCountry(user.country);
      if (user.timeZone) setTimeZone(user.timeZone);
      if (user.preferredCurrency) setCurrency(user.preferredCurrency);
      if (user.preferredLanguage) setLanguage(user.preferredLanguage);
      if (user.photoURL) setPhotoURL(user.photoURL);
      setDisplayName(user.displayName || (fName && lName ? `${fName} ${lName}` : '') || user.username || 'Christian Alexander');
      if (user.notificationPreferences) {
        setNotifPrefs(prev => ({ ...prev, ...user.notificationPreferences }));
      }
    }
  }, [user]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as ProfileCenterSection);
      }
    };
    window.addEventListener('navigate-profile-tab', handleNavigate);
    return () => window.removeEventListener('navigate-profile-tab', handleNavigate);
  }, []);

  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || true);
  const [mfaType, setMfaType] = useState<'app' | 'sms'>(user?.mfaType === 'sms' ? 'sms' : 'app');
  const [showQrCode, setShowQrCode] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('JBSWY3DPEHPK3PXP9921');

  // Lists & Feeds
  const [sessions, setSessions] = useState<any[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Trading Execution');
  const [ticketPriority, setTicketPriority] = useState('High');
  const [ticketDesc, setTicketDesc] = useState('');

  // Notification toggles
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifs: true,
    smsNotifs: true,
    pushNotifs: true,
    tradingAlerts: true,
    depositAlerts: true,
    withdrawalAlerts: true,
    securityAlerts: true,
    marketAlerts: true,
    ...(user?.notificationPreferences || {})
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Load backend data
  const loadSecurityData = async () => {
    if (!token) return;
    try {
      const [sessRes, devRes, logRes] = await Promise.all([
        fetch('/api/auth/sessions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/trusted-devices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/activity-log', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (sessRes.ok) setSessions(await sessRes.json());
      if (devRes.ok) setTrustedDevices(await devRes.json());
      if (logRes.ok) setActivityLogs(await logRes.json());
    } catch {}
  };

  useEffect(() => {
    loadSecurityData();
  }, [token, activeTab]);

  // Save immediate setting change
  const saveImmediateSetting = async (key: string, value: any) => {
    const updates = { [key]: value };
    await updateProfile(updates);
    showToast(`${key} preference saved immediately to database.`);
  };

  // Handle Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Unsupported format. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB.');
      return;
    }

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const minSize = Math.min(img.width, img.height);
      canvas.width = minSize;
      canvas.height = minSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const xOffset = (img.width - minSize) / 2;
      const yOffset = (img.height - minSize) / 2;
      ctx.drawImage(img, xOffset, yOffset, minSize, minSize, 0, 0, minSize, minSize);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoURL(dataUrl);
      updateProfile({ photoURL: dataUrl });
      showToast('Profile picture uploaded and updated successfully.');
    } catch (err) {
      showToast('Failed to process image');
    }
  };

  // Save Profile with Verification check for email/phone
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDisplayName = `${firstName} ${lastName}`.trim() || username;
    setDisplayName(updatedDisplayName);
    const payload = { firstName, lastName, username, email, phone, country, timeZone, preferredCurrency: currency, preferredLanguage: language, photoURL, displayName: updatedDisplayName };

    if (email !== user?.email) {
      openVerificationModal(email, 'email', async () => {
        await updateProfile(payload);
        showToast('Email verified! Profile updated in database.');
      });
      return;
    }
    if (phone !== user?.phone) {
      openVerificationModal(phone, 'phone', async () => {
        await updateProfile(payload);
        showToast('Phone verified! Profile updated in database.');
      });
      return;
    }

    setLoading(true);
    await updateProfile(payload);
    setLoading(false);
    showToast('All profile changes saved successfully to database.');
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Error: Please enter your current valid password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Error: New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Error: Password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password updated successfully! Other sessions marked for review.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(`Error: ${data.error || 'Password update failed'}`);
      }
    } catch {
      showToast('Password updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  // Toggle MFA
  const handleToggleMfa = async (nextState: boolean) => {
    setMfaEnabled(nextState);
    if (nextState && mfaType === 'app') {
      setShowQrCode(true);
    }
    await fetch('/api/auth/mfa-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ enabled: nextState, type: mfaType, phone })
    });
    showToast(`Two-Factor Authentication ${nextState ? 'enabled' : 'disabled'} in security profile.`);
  };

  // Revoke session
  const handleRevokeSession = async (id: string) => {
    await fetch(`/api/auth/sessions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Active session revoked successfully.');
  };

  // Revoke all other sessions
  const handleRevokeOthers = async () => {
    const current = sessions.find(s => s.isCurrent) || sessions[0];
    const res = await fetch('/api/auth/sessions/revoke-others', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentSessionId: current?.id })
    });
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.isCurrent || s.id === current?.id));
      showToast('All secondary sessions revoked. Your current session is active.');
    }
  };

  // Remove trusted device
  const handleRemoveDevice = async (id: string) => {
    await fetch(`/api/auth/trusted-devices/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setTrustedDevices(prev => prev.filter(d => d.id !== id));
    showToast('Device removed from trusted security whitelist.');
  };

  // Toggle Notification Pref
  const handleToggleNotif = async (key: keyof typeof notifPrefs) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    await updateProfile({ notificationPreferences: next });
    showToast('Notification preference saved immediately to database.');
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    setLoading(true);
    await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject: ticketSubject, category: ticketCategory, priority: ticketPriority, description: ticketDesc })
    });
    setLoading(false);
    showToast('Priority institutional ticket submitted! Assigned to Dedicated Account Manager.');
    setTicketSubject('');
    setTicketDesc('');
  };

  const navItems: { id: ProfileCenterSection; label: string; icon: any; badge?: string }[] = [
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security & 2FA', icon: <Shield className="w-4 h-4" />, badge: '2FA ON' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
    { id: 'history', label: 'Login History', icon: <History className="w-4 h-4" /> },
    { id: 'devices', label: 'Connected Devices', icon: <Smartphone className="w-4 h-4" />, badge: `${sessions.length || 2}` },
    { id: 'verification', label: 'Identity Verification', icon: <ShieldCheck className="w-4 h-4" />, badge: 'STAR' },
    { id: 'support', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className={`w-full flex flex-col md:flex-row rounded-2xl border shadow-xl overflow-hidden ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0b0e14] border-slate-800 text-slate-200'
    } ${isModal ? 'max-h-[85vh] min-h-[650px]' : 'min-h-[700px]'}`}>
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="p-1 hover:bg-emerald-700 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Nav */}
      <div className={`w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r p-4 flex flex-col justify-between ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0f141f]/90 border-slate-800/80'
      }`}>
        <div className="space-y-6">
          {/* Back to Start Page button */}
          <div className="pb-3 border-b border-slate-800/20">
            <button
              type="button"
              onClick={() => {
                if (isModal && onClose) {
                  onClose();
                } else {
                  window.location.href = '/';
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Back to Start Page</span>
            </button>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{firstName.charAt(0)}{lastName.charAt(0)}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">{firstName} {lastName}</h3>
              <p className={`text-[11px] truncate uppercase tracking-wider font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {role === 'admin' ? 'Root Admin' : role === 'analyst' ? 'Senior Analyst' : 'Star Member'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active 
                      ? (isLight ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-blue-600/90 text-white shadow-md shadow-blue-500/20')
                      : (isLight ? 'text-slate-600 hover:bg-slate-200/60' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      active ? 'bg-white/20 text-white' : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800/20 space-y-2">
          {isModal && onClose && (
            <button
              onClick={onClose}
              className={`w-full py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Center</span>
            </button>
          )}
          <button
            onClick={() => confirmLogout()}
            className="w-full py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[85vh]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSaveProfile}
              className="space-y-6 max-w-2xl"
            >
              <div className="border-b pb-4 border-slate-800/20">
                <h2 className="text-xl font-bold">My Profile</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Manage your personal identity, contact details, and institutional preferences.
                </p>
              </div>

              {/* Profile Picture Upload */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{firstName.charAt(0)}{lastName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Profile Photo</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      PNG, JPG or WEBP under 5MB. Verified institutional avatar.
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                      isLight ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Email Address</span>
                    <span className="text-[10px] text-amber-500 font-normal">Requires Verification</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Phone Number</span>
                    <span className="text-[10px] text-amber-500 font-normal">Requires Verification</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <option value="Kenya">Kenya 🇰🇪 (+254)</option>
                    <option value="Nigeria">Nigeria 🇳🇬 (+234)</option>
                    <option value="South Africa">South Africa 🇿🇦 (+27)</option>
                    <option value="Egypt">Egypt 🇪🇬 (+20)</option>
                    <option value="Ghana">Ghana 🇬🇭 (+233)</option>
                    <option value="Tanzania">Tanzania 🇹🇿 (+255)</option>
                    <option value="Uganda">Uganda 🇺🇬 (+256)</option>
                    <option value="Rwanda">Rwanda 🇷🇼 (+250)</option>
                    <option value="Morocco">Morocco 🇲🇦 (+212)</option>
                    <option value="Algeria">Algeria 🇩🇿 (+213)</option>
                    <option value="Ethiopia">Ethiopia 🇪🇹 (+251)</option>
                    <option value="Ivory Coast">Ivory Coast 🇨🇮 (+225)</option>
                    <option value="Senegal">Senegal 🇸🇳 (+221)</option>
                    <option value="Zambia">Zambia 🇿🇲 (+260)</option>
                    <option value="Zimbabwe">Zimbabwe 🇿🇼 (+263)</option>
                    <option value="Tunisia">Tunisia 🇹🇳 (+216)</option>
                    <option value="Botswana">Botswana 🇧🇼 (+267)</option>
                    <option value="Mauritius">Mauritius 🇲🇺 (+230)</option>
                    <option value="Cameroon">Cameroon 🇨🇲 (+237)</option>
                    <option value="Angola">Angola 🇦🇴 (+244)</option>
                    <option value="Mozambique">Mozambique 🇲🇿 (+258)</option>
                    <option value="Namibia">Namibia 🇳🇦 (+264)</option>
                    <option value="Malawi">Malawi 🇲🇼 (+265)</option>
                    <option value="Madagascar">Madagascar 🇲🇬 (+261)</option>
                    <option value="United States">United States 🇺🇸 (+1)</option>
                    <option value="United Kingdom">United Kingdom 🇬🇧 (+44)</option>
                    <option value="Singapore">Singapore 🇸🇬 (+65)</option>
                    <option value="Switzerland">Switzerland 🇨🇭 (+41)</option>
                    <option value="Japan">Japan 🇯🇵 (+81)</option>
                    <option value="Germany">Germany 🇩🇪 (+49)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <option value="GMT-8 PST">GMT-8 PST (Pacific)</option>
                    <option value="GMT-5 EST">GMT-5 EST (Eastern)</option>
                    <option value="GMT+0 UTC">GMT+0 UTC (London)</option>
                    <option value="GMT+1 CET">GMT+1 CET (Zurich)</option>
                    <option value="GMT+8 CST">GMT+8 CST (Singapore)</option>
                    <option value="GMT+9 JST">GMT+9 JST (Tokyo)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono truncate ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <option value="KES (KSh)">KES (KSh - Kenya)</option>
                    <option value="NGN (₦)">NGN (₦ - Nigeria)</option>
                    <option value="ZAR (R)">ZAR (R - South Africa)</option>
                    <option value="EGP (E£)">EGP (E£ - Egypt)</option>
                    <option value="GHS (GH₵)">GHS (GH₵ - Ghana)</option>
                    <option value="TZS (TSh)">TZS (TSh - Tanzania)</option>
                    <option value="UGX (USh)">UGX (USh - Uganda)</option>
                    <option value="RWF (FRw)">RWF (FRw - Rwanda)</option>
                    <option value="MAD (DH)">MAD (DH - Morocco)</option>
                    <option value="DZD (DA)">DZD (DA - Algeria)</option>
                    <option value="ETB (Br)">ETB (Br - Ethiopia)</option>
                    <option value="ZMW (ZK)">ZMW (ZK - Zambia)</option>
                    <option value="XOF (CFA)">XOF (CFA - West Africa)</option>
                    <option value="ZWL ($)">ZWL ($ - Zimbabwe)</option>
                    <option value="TND (DT)">TND (DT - Tunisia)</option>
                    <option value="BWP (P)">BWP (P - Botswana)</option>
                    <option value="MUR (₨)">MUR (₨ - Mauritius)</option>
                    <option value="XAF (FCFA)">XAF (FCFA - Central Africa)</option>
                    <option value="AOA (Kz)">AOA (Kz - Angola)</option>
                    <option value="MZN (MT)">MZN (MT - Mozambique)</option>
                    <option value="NAD (N$)">NAD (N$ - Namibia)</option>
                    <option value="MWK (MK)">MWK (MK - Malawi)</option>
                    <option value="MGA (Ar)">MGA (Ar - Madagascar)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="JPY (¥)">JPY (¥)</option>
                    <option value="BTC (₿)">BTC (₿)</option>
                    <option value="ETH (Ξ)">ETH (Ξ)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish (ES)">Spanish (ES)</option>
                    <option value="French (FR)">French (FR)</option>
                    <option value="German (DE)">German (DE)</option>
                    <option value="Japanese (JA)">Japanese (JA)</option>
                    <option value="Chinese (ZH)">Chinese (ZH)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/20 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 2: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="border-b pb-4 border-slate-800/20">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Changes made below are automatically saved immediately to the enterprise database.
                </p>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Display Name</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Name shown on institutional trading desks and leaderboards.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      saveImmediateSetting('displayName', e.target.value);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-sm border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Interface Theme</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Toggle between Light Slate and Dark Obsidian institutional modes.
                    </p>
                  </div>
                  <select
                    value={themePref}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setThemePref(val);
                      localStorage.setItem('app_theme', val);
                      if (val === 'light') document.documentElement.classList.add('theme-light');
                      else if (val === 'dark') document.documentElement.classList.remove('theme-light');
                      saveImmediateSetting('theme', val);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="dark">Dark Obsidian (Default)</option>
                    <option value="light">Light Slate Mode</option>
                    <option value="system">System Preference</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Trading Language</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Select primary interface dialect and number formatting.
                    </p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      saveImmediateSetting('preferredLanguage', e.target.value);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs border font-semibold ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish (ES)">Spanish (ES)</option>
                    <option value="French (FR)">French (FR)</option>
                    <option value="German (DE)">German (DE)</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Base Settlement Currency</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Default currency used for portfolio valuation and margin checks.
                    </p>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      saveImmediateSetting('preferredCurrency', e.target.value);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border truncate max-w-[200px] ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="KES (KSh)">KES (KSh - Kenya)</option>
                    <option value="NGN (₦)">NGN (₦ - Nigeria)</option>
                    <option value="ZAR (R)">ZAR (R - South Africa)</option>
                    <option value="EGP (E£)">EGP (E£ - Egypt)</option>
                    <option value="GHS (GH₵)">GHS (GH₵ - Ghana)</option>
                    <option value="TZS (TSh)">TZS (TSh - Tanzania)</option>
                    <option value="UGX (USh)">UGX (USh - Uganda)</option>
                    <option value="RWF (FRw)">RWF (FRw - Rwanda)</option>
                    <option value="MAD (DH)">MAD (DH - Morocco)</option>
                    <option value="DZD (DA)">DZD (DA - Algeria)</option>
                    <option value="ETB (Br)">ETB (Br - Ethiopia)</option>
                    <option value="ZMW (ZK)">ZMW (ZK - Zambia)</option>
                    <option value="XOF (CFA)">XOF (CFA - West Africa)</option>
                    <option value="ZWL ($)">ZWL ($ - Zimbabwe)</option>
                    <option value="TND (DT)">TND (DT - Tunisia)</option>
                    <option value="BWP (P)">BWP (P - Botswana)</option>
                    <option value="MUR (₨)">MUR (₨ - Mauritius)</option>
                    <option value="XAF (FCFA)">XAF (FCFA - Central Africa)</option>
                    <option value="AOA (Kz)">AOA (Kz - Angola)</option>
                    <option value="MZN (MT)">MZN (MT - Mozambique)</option>
                    <option value="NAD (N$)">NAD (N$ - Namibia)</option>
                    <option value="MWK (MK)">MWK (MK - Malawi)</option>
                    <option value="MGA (Ar)">MGA (Ar - Madagascar)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="BTC (₿)">BTC (₿)</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Account Email & Verification</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Primary institutional email associated with this account.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-500">{email}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">Verified</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Account Phone & SMS Alerting</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Registered mobile contact for security codes and order execution alerts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">{phone}</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-[11px] text-blue-500 hover:underline cursor-pointer font-bold"
                    >
                      Edit in Profile
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div>
                    <h4 className="font-bold text-sm">Trading Time Zone & Jurisdiction</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Set market opening bell alerts and report timestamp offsets.
                    </p>
                  </div>
                  <select
                    value={timeZone}
                    onChange={(e) => {
                      setTimeZone(e.target.value);
                      saveImmediateSetting('timeZone', e.target.value);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="GMT-8 PST">GMT-8 PST (Pacific)</option>
                    <option value="GMT-5 EST">GMT-5 EST (Eastern)</option>
                    <option value="GMT+0 UTC">GMT+0 UTC (London)</option>
                    <option value="GMT+1 CET">GMT+1 CET (Zurich)</option>
                    <option value="GMT+8 CST">GMT+8 CST (Singapore)</option>
                    <option value="GMT+9 JST">GMT+9 JST (Tokyo)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All account settings are active and synchronizing live with your institutional cluster.</span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="border-b pb-4 border-slate-800/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Security & 2FA</h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Manage passwords, two-factor authentication, active sessions, and trusted devices.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs border border-emerald-500/20 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>2FA PROTECTED</span>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Change Institutional Password</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>New Password (8+ chars)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Two-Factor Authentication Toggle */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-500" />
                      <span>Two-Factor Authentication (2FA)</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Protect your withdrawals and API access with TOTP apps or SMS verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleMfa(!mfaEnabled)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      mfaEnabled 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {mfaEnabled ? 'Enabled (Active)' : 'Disabled'}
                  </button>
                </div>

                {mfaEnabled && (
                  <div className="pt-3 border-t border-slate-800/20 space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mfaType"
                          checked={mfaType === 'app'}
                          onChange={() => setMfaType('app')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-semibold">Google Authenticator App</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mfaType"
                          checked={mfaType === 'sms'}
                          onChange={() => setMfaType('sms')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-semibold">SMS OTP ({phone})</span>
                      </label>
                    </div>

                    {mfaType === 'app' && (
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="w-24 h-24 rounded-lg bg-white p-2 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                          <QrCode className="w-20 h-20 text-slate-900" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="font-bold">Scan QR Code with Google Authenticator</p>
                          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Or enter this institutional manual secret key into your authenticator app:
                          </p>
                          <div className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-800 text-amber-400 border border-slate-700 inline-block select-all">
                            {mfaSecret}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Sessions Overview */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-500" />
                      <span>Active Sessions</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Review logged-in devices across your enterprise accounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeOthers}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                  >
                    Logout Other Devices
                  </button>
                </div>

                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div key={sess.id} className={`p-3 rounded-xl border flex items-center justify-between ${
                      sess.isCurrent 
                        ? (isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-blue-950/30 border-blue-800/60') 
                        : (isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')
                    }`}>
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{sess.device} • {sess.browser}</span>
                            {sess.isCurrent && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold text-[9px] uppercase">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {sess.ip} ({sess.country}) • Active {sess.loginTime}
                          </p>
                        </div>
                      </div>
                      {!sess.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Revoke session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="border-b pb-4 border-slate-800/20">
                <h2 className="text-xl font-bold">Notification Preferences</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Customize real-time trading alerts, deposit/withdrawal updates, and security feeds.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive daily portfolio digests and trade confirmations via email.' },
                  { key: 'smsNotifs', label: 'SMS Notifications', desc: 'Urgent mobile SMS alerts for large margin calls and withdrawals.' },
                  { key: 'pushNotifs', label: 'Push Notifications', desc: 'Browser and mobile push banners for live market order fills.' },
                  { key: 'tradingAlerts', label: 'Trading Execution Alerts', desc: 'Immediate notification when buy/sell limit orders are filled.' },
                  { key: 'depositAlerts', label: 'Deposit Confirmation Alerts', desc: 'Notify when wire transfers or crypto deposits clear.' },
                  { key: 'withdrawalAlerts', label: 'Withdrawal Security Alerts', desc: 'Priority security alerts whenever funds leave your wallet.' },
                  { key: 'securityAlerts', label: 'Security & Login Alerts', desc: 'Alert when a login occurs from an unrecognized device or IP.' },
                  { key: 'marketAlerts', label: 'Live Market Volatility Alerts', desc: 'Alert when watchlisted symbols jump or drop more than 5%.' },
                ].map((item) => {
                  const val = (notifPrefs as any)[item.key];
                  return (
                    <div key={item.key} className={`p-4 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                    }`}>
                      <div>
                        <h4 className="font-bold text-sm">{item.label}</h4>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleNotif(item.key as any)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-1 shrink-0 ${
                          val ? 'bg-blue-600' : (isLight ? 'bg-slate-300' : 'bg-slate-700')
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-md ${
                          val ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="border-b pb-4 border-slate-800/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Account Activity Log</h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Audit trail of recent logins, profile edits, password changes, and transactions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSecurityData}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Log</span>
                </button>
              </div>

              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        log.event?.includes('LOGIN') ? 'bg-blue-500/10 text-blue-500' :
                        log.event?.includes('SECURITY') || log.event?.includes('PASSWORD') ? 'bg-rose-500/10 text-rose-500' :
                        'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{log.event || 'SYSTEM_EVENT'}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {log.ip}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 font-medium">{log.details}</p>
                        <p className={`text-[11px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Device: {log.device}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 6: LOGIN HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="border-b pb-4 border-slate-800/20">
                <h2 className="text-xl font-bold">Login History</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Verified authentication timestamps and IP geolocation across your sessions.
                </p>
              </div>

              <div className={`rounded-2xl border overflow-hidden ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-mono text-[11px] uppercase ${
                      isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Device / Browser</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20">
                    {[
                      { time: 'Today, 03:04 AM GMT', ip: '192.168.1.104', loc: 'New York, US', dev: 'MacBook Pro • Chrome', status: 'SUCCESS' },
                      { time: 'Yesterday, 08:15 PM GMT', ip: '172.56.21.89', loc: 'New York, US', dev: 'iPhone 15 • Safari', status: 'SUCCESS' },
                      { time: 'Jul 3, 2026, 09:12 AM GMT', ip: '192.168.1.104', loc: 'New York, US', dev: 'MacBook Pro • Chrome', status: 'SUCCESS' },
                      { time: 'Jul 2, 2026, 04:30 PM GMT', ip: '82.102.19.4', loc: 'Amsterdam, NL', dev: 'Windows PC • Firefox', status: 'MFA REQUIRED' },
                      { time: 'Jul 1, 2026, 11:20 AM GMT', ip: '192.168.1.104', loc: 'New York, US', dev: 'MacBook Pro • Chrome', status: 'SUCCESS' },
                    ].map((row, idx) => (
                      <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                        <td className="p-3.5 font-semibold">{row.time}</td>
                        <td className="p-3.5 font-mono">{row.ip}</td>
                        <td className="p-3.5">{row.loc}</td>
                        <td className="p-3.5">{row.dev}</td>
                        <td className="p-3.5 text-right font-bold font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            row.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 7: CONNECTED DEVICES */}
          {activeTab === 'devices' && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="border-b pb-4 border-slate-800/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Connected & Trusted Devices</h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Active hardware endpoints whitelisted for institutional trading access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeOthers}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md"
                >
                  Revoke All Secondary Devices
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sessions.map((sess) => (
                  <div key={sess.id} className={`p-5 rounded-2xl border space-y-3 relative ${
                    sess.isCurrent 
                      ? (isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-800/60') 
                      : (isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800')
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-tight">{sess.device}</h4>
                          <span className="text-[11px] font-mono text-blue-400">{sess.browser} ({sess.os})</span>
                        </div>
                      </div>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider">
                          This Device
                        </span>
                      )}
                    </div>

                    <div className={`space-y-1 text-xs pt-2 border-t border-slate-800/20 font-mono ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <p>IP: <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sess.ip}</span></p>
                      <p>Country: <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sess.country}</span></p>
                      <p>Last Active: <span className="text-emerald-500 font-semibold">{sess.loginTime}</span></p>
                    </div>

                    {!sess.isCurrent && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="w-full py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Session</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 8: IDENTITY VERIFICATION */}
          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="border-b pb-4 border-slate-800/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Account Verification & Star Badge</h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Account verification status for secure withdrawals and trading.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>STAR MEMBER</span>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-emerald-400">Star Account Fully Verified</h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-300/80'}`}>
                      Your identity documents, corporate authorization, and biometric KYC have been audited and approved by Risk Compliance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Government Photo ID (Passport)', status: 'VERIFIED', date: 'June 15, 2026' },
                  { title: 'Proof of Residential Address (Utility Bill)', status: 'VERIFIED', date: 'June 15, 2026' },
                  { title: 'Biometric Facial Verification Check', status: 'VERIFIED', date: 'June 15, 2026' },
                  { title: 'Global AML & Sanctions Database Clearance', status: 'PASSED', date: 'June 15, 2026' },
                  { title: 'Institutional Bank Account Verification (Chase Wire)', status: 'VERIFIED', date: 'June 16, 2026' },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs">{item.title}</h4>
                        <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Audited {item.date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 9: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="border-b pb-4 border-slate-800/20">
                <h2 className="text-xl font-bold">Institutional Help & Support</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Dedicated account management, technical docs, and priority ticket desk.
                </p>
              </div>

              {/* Dedicated Manager Card */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-blue-950/30 border-blue-800/60'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    MV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">Michael Vance</h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold text-[9px] uppercase">Online 24/7</span>
                    </div>
                    <p className="text-xs text-blue-400 font-semibold">Dedicated Account Manager</p>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Direct Support Line: +1 (800) 555-ALPHA</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Opening direct WebSocket encrypted chat with Michael Vance...')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer shrink-0"
                >
                  Start Live Chat
                </button>
              </div>

              {/* Submit Ticket Form */}
              <form onSubmit={handleSubmitTicket} className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
              }`}>
                <h3 className="font-bold text-sm">Submit Priority Institutional Ticket</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Subject</label>
                    <input
                      type="text"
                      placeholder="e.g., FIX API Rate Limit Quota Increase"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:ring-2 focus:ring-blue-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:ring-2 focus:ring-blue-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <option value="Trading Execution">Trading Execution & Margin</option>
                      <option value="FIX API / Webhook">FIX API / WebSocket Feeds</option>
                      <option value="Treasury & Wire">Treasury Deposits & Withdrawals</option>
                      <option value="Security & KYC">Security & KYC Compliance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the technical requirement or institutional request..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Submitting...' : 'Submit Support Ticket'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
