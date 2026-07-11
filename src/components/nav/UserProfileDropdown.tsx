import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Shield, CheckCircle2, Wallet, DollarSign, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, History, PieChart, Bookmark, Bell, HelpCircle, LogOut, ShieldCheck, Award, Lock, ExternalLink, ChevronRight, Globe, Key, BookOpen, Sun, Moon, Activity, Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileDropdownProps {
  role?: 'admin' | 'analyst' | 'user';
  onLogout: () => void;
  onOpenSecurity?: () => void;
  onNavigateAction?: (action: string) => void;
  onOpenProfileCenter?: (section: any) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function UserProfileDropdown({
  role = 'user',
  onLogout,
  onOpenSecurity,
  onNavigateAction,
  onOpenProfileCenter,
  theme = 'light',
  onToggleTheme
}: UserProfileDropdownProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [settingSearch, setSettingSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine profile stats based on logged-in role & actual account user data
  const getProfileData = () => {
    const defaultName = role === 'admin' ? 'Christian Alexander' : role === 'analyst' ? 'Sarah Jenkins' : 'Christian Alexander';
    const name = user?.displayName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) || user?.name || user?.username || user?.email || defaultName;
    
    const words = name.split(' ').filter(Boolean);
    const initials = words.length >= 2 ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
    const photoURL = user?.photoURL || '';

    switch (role) {
      case 'admin':
        return {
          name,
          roleTitle: user?.roleTitle || 'System Administrator',
          initials,
          photoURL,
          avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
          status: user?.status || 'Online',
          accountId: user?.accountId || user?.id || 'ADM-0001-ROOT',
          verification: user?.verificationStatus || 'Verified Admin',
          portfolioVal: '',
          walletBal: '',
          lastLogin: user?.lastLogin || 'Today, 03:08 AM GMT'
        };
      case 'analyst':
        return {
          name,
          roleTitle: user?.roleTitle || 'Senior Analyst',
          initials,
          photoURL,
          avatarBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500',
          status: user?.status || 'Active',
          accountId: user?.accountId || user?.id || 'ACC-3102-Y4',
          verification: user?.verificationLevel || 'Star Analyst',
          portfolioVal: user?.portfolioValue || '$8,450,200.00',
          walletBal: user?.walletBalance || '$1,250,000.00',
          lastLogin: user?.lastLogin || 'Today, 02:45 AM GMT'
        };
      default:
        return {
          name,
          roleTitle: user?.roleTitle || 'Verified Trader',
          initials,
          photoURL,
          avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
          status: user?.status || 'Active',
          accountId: user?.accountId || user?.id || 'ACC-8924-X9',
          verification: user?.verificationLevel || 'Star Member',
          portfolioVal: user?.portfolioValue || '$1,428,500.00',
          walletBal: user?.walletBalance || '$420,000.00',
          lastLogin: user?.lastLogin || 'Today, 03:04 AM GMT'
        };
    }
  };

  const profile = getProfileData();

  const handleAction = (actionLabel: string) => {
    setIsOpen(false);
    if (actionLabel === 'Sign Out' || actionLabel === 'Logout') {
      onLogout();
      return;
    }
    if (onOpenProfileCenter) {
      if (actionLabel === 'My Profile') return onOpenProfileCenter('profile');
      if (actionLabel === 'Account Settings' || actionLabel === 'Language & Currency' || actionLabel === 'Time Zone') return onOpenProfileCenter('settings');
      if (actionLabel === 'Security') return onOpenProfileCenter('security');
      if (actionLabel === 'Notifications') return onOpenProfileCenter('notifications');
      if (actionLabel === 'Activity Log') return onOpenProfileCenter('activity');
      if (actionLabel === 'Login History') return onOpenProfileCenter('history');
      if (actionLabel === 'Connected Devices' || actionLabel === 'Session Management') return onOpenProfileCenter('devices');
      if (actionLabel === 'Identity Verification') return onOpenProfileCenter('verification');
      if (actionLabel === 'Help & Support') return onOpenProfileCenter('support');
    }
    if ((actionLabel === 'Security' || actionLabel === 'Session Management') && onOpenSecurity) {
      onOpenSecurity();
      return;
    }
    if (actionLabel === 'Appearance (Theme)' || actionLabel === 'Theme') {
      if (onToggleTheme) {
        onToggleTheme();
      } else {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('admin_theme', nextTheme);
        if (nextTheme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.remove('theme-light');
          document.documentElement.classList.add('dark');
        }
      }
      return;
    }
    if (onNavigateAction) {
      onNavigateAction(actionLabel);
    }
  };

  interface ActionItem {
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isDanger?: boolean;
  }

  interface ActionGroup {
    title: string;
    items: ActionItem[];
  }

  // Grouped quick actions for System Administrator (strictly removing investor features)
  const adminActionGroups: ActionGroup[] = [
    {
      title: 'Administrator Profile',
      items: [
        { label: 'My Profile', icon: <User className="w-4 h-4 text-blue-500" /> },
        { label: 'Account Settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
        { label: 'Language & Currency', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
        { label: 'Time Zone', icon: <Activity className="w-4 h-4 text-cyan-500" /> },
        { label: 'Security', icon: <Shield className="w-4 h-4 text-rose-500" />, badge: '2FA ON' },
        { label: 'Identity Verification', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, badge: 'VERIFIED' },
      ]
    },
    {
      title: 'System Preferences',
      items: [
        { label: 'Notifications', icon: <Bell className="w-4 h-4 text-amber-500" /> },
        { label: 'Connected Devices', icon: <Lock className="w-4 h-4 text-teal-500" />, badge: 'ACTIVE' },
        { label: 'Login History', icon: <History className="w-4 h-4 text-purple-500" /> },
        { label: 'Appearance (Theme)', icon: isLight ? <Moon className="w-4 h-4 text-purple-500" /> : <Sun className="w-4 h-4 text-amber-500" />, badge: isLight ? 'LIGHT' : 'DARK' },
      ]
    },
    {
      title: 'Administration & Logs',
      items: [
        { label: 'API Keys (if enabled)', icon: <Key className="w-4 h-4 text-indigo-500" />, badge: 'ENABLED' },
        { label: 'Activity Log', icon: <Activity className="w-4 h-4 text-blue-500" /> },
        { label: 'Documentation', icon: <BookOpen className="w-4 h-4 text-slate-500" /> },
        { label: 'Help & Support', icon: <HelpCircle className="w-4 h-4 text-slate-500" /> },
      ]
    },
    {
      title: 'Session Control',
      items: [
        { label: 'Logout', icon: <LogOut className="w-4 h-4 text-rose-500" />, isDanger: true },
      ]
    }
  ];

  // Grouped quick actions for institutional trader / analyst
  const userActionGroups: ActionGroup[] = [
    {
      title: 'Account & Identity',
      items: [
        { label: 'My Profile', icon: <User className="w-4 h-4 text-blue-500" /> },
        { label: 'Account Settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
        { label: 'Language & Currency', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
        { label: 'Time Zone', icon: <Activity className="w-4 h-4 text-cyan-500" /> },
        { label: 'Appearance (Theme)', icon: isLight ? <Moon className="w-4 h-4 text-purple-500" /> : <Sun className="w-4 h-4 text-amber-500" />, badge: isLight ? 'LIGHT' : 'DARK' },
        { label: 'Security', icon: <Shield className="w-4 h-4 text-rose-500" />, badge: '2FA ON' },
        { label: 'Connected Devices', icon: <Lock className="w-4 h-4 text-teal-500" />, badge: 'ACTIVE' },
        { label: 'Login History', icon: <History className="w-4 h-4 text-purple-500" /> },
        { label: 'Identity Verification', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, badge: 'STAR' },
      ]
    },
    {
      title: 'Treasury & Transfers',
      items: [
        { label: 'Banking & Wallets', icon: <Wallet className="w-4 h-4 text-indigo-500" /> },
        { label: 'Deposit Funds', icon: <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> },
        { label: 'Withdraw Funds', icon: <ArrowUpRight className="w-4 h-4 text-amber-500" /> },
        { label: 'Transfer Money', icon: <ArrowRightLeft className="w-4 h-4 text-teal-500" /> },
      ]
    },
    {
      title: 'Trading & Watchlists',
      items: [
        { label: 'Trading History', icon: <History className="w-4 h-4 text-purple-500" /> },
        { label: 'Portfolio', icon: <PieChart className="w-4 h-4 text-cyan-500" /> },
        { label: 'Watchlists', icon: <Bookmark className="w-4 h-4 text-blue-500" /> },
        { label: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-500" /> },
      ]
    },
    {
      title: 'System & Support',
      items: [
        { label: 'Activity Log', icon: <Activity className="w-4 h-4 text-blue-500" /> },
        { label: 'Help & Support', icon: <HelpCircle className="w-4 h-4 text-slate-500" /> },
        { label: 'Sign Out', icon: <LogOut className="w-4 h-4 text-rose-500" />, isDanger: true },
      ]
    }
  ];

  // Grouped quick actions for institutional financial analyst (strictly removed Treasury, Transfers, and Trading info)
  const analystActionGroups: ActionGroup[] = [
    {
      title: 'Analyst Profile',
      items: [
        { label: 'My Profile', icon: <User className="w-4 h-4 text-blue-500" /> },
        { label: 'Account Settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
        { label: 'Language & Currency', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
        { label: 'Time Zone', icon: <Activity className="w-4 h-4 text-cyan-500" /> },
        { label: 'Appearance (Theme)', icon: isLight ? <Moon className="w-4 h-4 text-purple-500" /> : <Sun className="w-4 h-4 text-amber-500" />, badge: isLight ? 'LIGHT' : 'DARK' },
        { label: 'Security', icon: <Shield className="w-4 h-4 text-rose-500" />, badge: '2FA ON' },
        { label: 'Connected Devices', icon: <Lock className="w-4 h-4 text-teal-500" />, badge: 'ACTIVE' },
        { label: 'Login History', icon: <History className="w-4 h-4 text-purple-500" /> },
        { label: 'Identity Verification', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, badge: 'STAR' },
      ]
    },
    {
      title: 'Research & Watchlists',
      items: [
        { label: 'Watchlists', icon: <Bookmark className="w-4 h-4 text-blue-500" /> },
        { label: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-500" /> },
        { label: 'Activity Log', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
      ]
    },
    {
      title: 'System & Support',
      items: [
        { label: 'Help & Support', icon: <HelpCircle className="w-4 h-4 text-slate-500" /> },
        { label: 'Sign Out', icon: <LogOut className="w-4 h-4 text-rose-500" />, isDanger: true },
      ]
    }
  ];

  const actionGroups = role === 'admin' ? adminActionGroups : role === 'analyst' ? analystActionGroups : userActionGroups;
  const filteredGroups = settingSearch.trim() === '' 
    ? actionGroups 
    : actionGroups.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.label.toLowerCase().includes(settingSearch.toLowerCase()) || 
          (item.badge && item.badge.toLowerCase().includes(settingSearch.toLowerCase())) ||
          group.title.toLowerCase().includes(settingSearch.toLowerCase())
        )
      })).filter(group => group.items.length > 0);

  return (
    <div className="relative inline-block select-none" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${profile.avatarBg} text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95 border-2 overflow-hidden ${
          isOpen ? 'ring-2 ring-blue-500 ring-offset-2 border-white dark:border-slate-800' : 'border-white/20 hover:opacity-95'
        }`}
        title={`${profile.name} (${profile.roleTitle})`}
      >
        {profile.photoURL ? (
          <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          profile.initials
        )}
      </button>

      {/* Dropdown Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden flex flex-col max-h-[88vh] ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
            }`}
          >
            {/* Top Institutional Header Card */}
            {/* Search Settings & Preferences Box inside Profile Dropdown */}
            <div className={`p-2.5 border-b ${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={settingSearch}
                  onChange={(e) => setSettingSearch(e.target.value)}
                  placeholder="Search settings & preferences..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isLight ? 'bg-white text-slate-900 placeholder-slate-400 border border-slate-200' : 'bg-slate-800 text-white placeholder-slate-400 border border-slate-700'
                  }`}
                />
              </div>
            </div>

            {role === 'admin' ? (
              <div className={`p-4 border-b ${isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${profile.avatarBg} text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0 border border-white/10 overflow-hidden`}>
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile.initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate text-slate-900 dark:text-white">{profile.name}</h3>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold truncate mt-0.5">
                      {profile.roleTitle}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 border border-slate-300/50 dark:border-slate-700/50">
                        <span className="text-slate-400 dark:text-slate-500 font-normal">Admin ID:</span>
                        <span className="text-slate-900 dark:text-white">{profile.accountId}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-end">
                  <span>Last Login: {profile.lastLogin}</span>
                </div>
              </div>
            ) : (
              <div className={`p-4 border-b ${isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${profile.avatarBg} text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0 overflow-hidden`}>
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile.initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate">{profile.name}</h3>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" title="Live Account" />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate">{profile.roleTitle}</p>
                    
                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {profile.accountId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{profile.verification}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-end">
                  <span>Last Login: {profile.lastLogin}</span>
                </div>
              </div>
            )}

            {/* Quick Actions Groups List */}
            <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No settings matching "{settingSearch}"
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.title}>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleAction(item.label)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          item.isDanger
                            ? isLight
                              ? 'text-rose-600 hover:bg-rose-50 hover:font-bold'
                              : 'text-rose-400 hover:bg-rose-950/40 hover:font-bold'
                            : isLight
                            ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
              )}
            </div>

            {/* Footer */}
            <div className={`p-2.5 border-t text-center text-[10px] font-mono ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <span>{role === 'admin' ? 'Platform Infrastructure & Security Operations v3.2' : 'Enterprise Identity & Session Management v3.2'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

