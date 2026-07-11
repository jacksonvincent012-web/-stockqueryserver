import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Sun, Moon, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import GlobalSearchModal, { GlobalSearchResult } from '../nav/GlobalSearchModal';
import RefreshControl from '../nav/RefreshControl';
import MarketClock from '../nav/MarketClock';
import NotificationsDropdown from '../nav/NotificationsDropdown';
import UserProfileDropdown from '../nav/UserProfileDropdown';
import SecurityModal from '../nav/SecurityModal';
import ProfileCenterModal from '../nav/ProfileCenterModal';

interface AdminHeaderProps {
  onLogout: () => void;
  onOpenMobileSidebar?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  healthStatus?: string;
  activeConnections?: number;
  systemMode?: string;
  onModeChange?: (mode: string) => void;
  activeTab?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onRefresh?: () => void;
  onOpenSearch?: () => void;
  role?: 'admin' | 'analyst' | 'user';
  customTitle?: string;
  onNavigateTab?: (tab: string, category?: string) => void;
}

export default function AdminHeader({
  onLogout,
  onOpenMobileSidebar,
  onToggleSidebar,
  isSidebarOpen = true,
  healthStatus = 'healthy',
  activeConnections = 62,
  systemMode = 'LIVE',
  onModeChange,
  activeTab = 'dashboard',
  theme = 'light',
  onToggleTheme,
  onRefresh,
  onOpenSearch,
  role = 'admin',
  customTitle,
  onNavigateTab
}: AdminHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [profileCenterOpen, setProfileCenterOpen] = useState(false);
  const [profileCenterSection, setProfileCenterSection] = useState<any>('profile');
  const [adminTabSearch, setAdminTabSearch] = useState('');
  const [showAdminTabResults, setShowAdminTabResults] = useState(false);

  const adminTabsAndButtons = [
    { label: 'Platform Overview', type: 'Tab', target: 'dashboard', icon: '📊' },
    { label: 'Platform Health', type: 'Tab', target: 'health', icon: '💚' },
    { label: 'Market Monitor', type: 'Tab', target: 'market', icon: '📈' },
    { label: 'User Management', type: 'Tab', target: 'users', icon: '👥' },
    { label: 'Platform Reports', type: 'Tab', target: 'reports', icon: '📋' },
    { label: 'System Performance', type: 'Tab', target: 'performance', icon: '⚡' },
    { label: 'Platform Settings', type: 'Tab', target: 'settings', icon: '⚙️' },
    { label: 'System Alerts', type: 'Tab', target: 'alerts', icon: '🚨' },
    { label: 'Data Processing Feed', type: 'Tab', target: 'queue', icon: '🔄' },
    { label: 'Platform Capacity', type: 'Tab', target: 'capacity', icon: '💾' },
    { label: 'Infrastructure Nodes', type: 'Tab', target: 'infrastructure', icon: '🖥️' },
    { label: 'Operations Center', type: 'Tab', target: 'operations', icon: '🛠️' },
    { label: 'Audit Logs', type: 'Tab', target: 'audit', icon: '📜' },
    { label: 'Support Tickets', type: 'Tab', target: 'support', icon: '🎧' },
    { label: 'System Benchmarks', type: 'Tab', target: 'benchmarks', icon: '🏎️' },
    { label: 'Market Directory', type: 'Tab', target: 'tickers', icon: '📁' },
    { label: 'Add Institutional User', type: 'Button', target: 'users', icon: '➕' },
    { label: 'Export Audit CSV', type: 'Button', target: 'audit', icon: '📥' },
    { label: 'Generate Monthly Report', type: 'Button', target: 'reports', icon: '📑' },
    { label: 'Restart Node Engine', type: 'Button', target: 'health', icon: '🔄' },
    { label: 'Flush Cache / Memory', type: 'Button', target: 'performance', icon: '🧹' },
    { label: 'Broadcast Emergency Alert', type: 'Button', target: 'alerts', icon: '📢' },
    { label: 'Modify API Rate Limits', type: 'Button', target: 'settings', icon: '🔒' },
    { label: 'Review KYC Documents', type: 'Button', target: 'users', icon: '🪪' }
  ];

  const filteredAdminItems = adminTabsAndButtons.filter(item =>
    item.label.toLowerCase().includes(adminTabSearch.toLowerCase()) ||
    item.type.toLowerCase().includes(adminTabSearch.toLowerCase())
  );

  // Keyboard shortcut Ctrl+K or / to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTitle = () => {
    if (customTitle) return customTitle;
    if (role === 'analyst' && activeTab === 'dashboard') return 'Analyst Portal • Stock Query Server';
    if (role === 'user' && activeTab === 'dashboard') return 'Institutional Trading & Multi-Grid Center';

    switch (activeTab) {
      case 'dashboard': return 'Platform Overview';
      case 'health': return 'Platform Health';
      case 'market': return 'Market Monitor';
      case 'users': return 'User Management';
      case 'reports': return 'Platform Reports';
      case 'performance': return 'System Performance';
      case 'settings': return 'Platform Settings';
      case 'alerts': return 'System Alerts';
      case 'queue': return 'Data Processing Feed';
      case 'capacity': return 'Platform Capacity';
      case 'infrastructure': return 'Infrastructure Nodes';
      case 'operations': return 'Operations Center';
      case 'audit': return 'Audit Logs';
      case 'support': return 'Support Tickets';
      case 'benchmarks': return 'System Benchmarks';
      case 'tickers': return 'Market Directory';
      default: return 'Platform Overview';
    }
  };

  const isLight = theme === 'light';

  const handleThemeToggle = () => {
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
  };

  const handleSearchResultSelect = (res: GlobalSearchResult) => {
    if (res.title.toLowerCase().includes('security') || res.category === 'Settings') {
      setIsSecurityOpen(true);
    } else if (res.category === 'Support') {
      if (onNavigateTab) {
        onNavigateTab('profile');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate-profile-tab', { detail: 'support' }));
      }, 50);
    } else if (onNavigateTab && res.category) {
      const target = res.category === 'Stocks' || res.category === 'Crypto' ? 'trade' : res.category === 'Watchlists' ? 'watchlists' : res.category === 'Statements' ? 'reports' : 'dashboard';
      onNavigateTab(target);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 h-[61px] px-4 sm:px-6 flex items-center justify-between border-b transition-colors select-none ${
        isLight ? 'bg-white/90 border-slate-200 text-slate-800 backdrop-blur-md' : 'bg-[#0A0E17]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
      {/* Left Section: Menu Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {(onToggleSidebar || onOpenMobileSidebar) && (
          <button
            onClick={onToggleSidebar || onOpenMobileSidebar}
            className={`p-2 -ml-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
            aria-label="Toggle navigation sidebar"
          >
            <motion.div
              key={isSidebarOpen ? 'open' : 'closed'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </button>
        )}

        {/* Back to Start / Previous Page Arrow */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              const defaultTab = role === 'admin' ? 'users' : role === 'analyst' ? 'watchlist' : 'portfolio';
              if (activeTab !== defaultTab && activeTab !== 'dashboard' && activeTab !== 'overview') {
                onNavigateTab(defaultTab);
                return;
              }
            }
            window.history.back();
          }}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 ${
            isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Back to start / previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back / Start</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight truncate font-sans">
            {getTitle()}
          </h1>
          {role !== 'admin' && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 uppercase font-mono">
              {role === 'analyst' ? 'Analyst Portal' : 'Enterprise Trader'}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Search, Refresh, Clock, Bell, Theme, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Pill or Admin Tab/Button Search */}
        {role === 'admin' ? (
          <div className="relative hidden md:block w-64 lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={adminTabSearch}
              onChange={(e) => {
                setAdminTabSearch(e.target.value);
                setShowAdminTabResults(true);
              }}
              onFocus={() => setShowAdminTabResults(true)}
              placeholder="Search admin tabs & buttons..."
              className={`w-full pl-8 pr-8 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isLight ? 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200' : 'bg-slate-900 text-white placeholder-slate-400 border border-slate-800'
              }`}
            />
            {adminTabSearch && (
              <button
                onClick={() => setAdminTabSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {showAdminTabResults && adminTabSearch.trim() !== '' && (
              <div className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl shadow-2xl border p-2 z-50 max-h-72 overflow-y-auto ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
              }`}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 border-b mb-1 border-slate-200 dark:border-slate-800">
                  Admin Tabs & Quick Buttons
                </div>
                {filteredAdminItems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">No matching tabs or buttons</div>
                ) : (
                  filteredAdminItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAdminTabSearch('');
                        setShowAdminTabResults(false);
                        if (onNavigateTab) onNavigateTab(item.target);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        item.type === 'Tab' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {item.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setIsSearchOpen(true);
              if (onOpenSearch) onOpenSearch();
            }}
            className={`hidden md:flex items-center gap-6 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
            title="Search entire institutional platform (Ctrl+K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search platform...</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              isLight ? 'bg-white border border-slate-200 text-slate-400' : 'bg-slate-800 text-slate-400'
            }`}>
              Ctrl+K
            </span>
          </button>
        )}

        {/* Refresh Button Pill & Auto-Refresh Dropdown */}
        <RefreshControl
          onRefresh={onRefresh}
          theme={theme}
        />

        {/* Time & Active Market Session Display */}
        <div className="hidden lg:block">
          <MarketClock theme={theme} />
        </div>

        {/* Notification Bell Dropdown */}
        <NotificationsDropdown
          onNavigate={(page, cat) => {
            if (onNavigateTab) onNavigateTab(page, cat);
          }}
          theme={theme}
        />

        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
          }`}
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            setProfileCenterSection('settings');
            setProfileCenterOpen(true);
          }}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? 'text-slate-500 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
          }`}
          title="Open Complete Settings Page"
        >
          <Settings className="w-4 h-4 text-blue-500" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <UserProfileDropdown
          role={role}
          onLogout={onLogout}
          onOpenSecurity={() => setIsSecurityOpen(true)}
          onOpenProfileCenter={(sec) => {
            setProfileCenterSection(sec);
            setProfileCenterOpen(true);
          }}
          onNavigateAction={(actLabel) => {
            if (onNavigateTab) {
              const label = actLabel.toLowerCase();
              if (label.includes('setting') || label.includes('profile') || label.includes('language') || label.includes('appearance') || label.includes('identity')) {
                onNavigateTab('settings');
              } else if (label.includes('activity') || label.includes('log')) {
                onNavigateTab('audit');
              } else if (label.includes('support') || label.includes('help') || label.includes('doc')) {
                onNavigateTab('support');
              } else if (label.includes('session') || label.includes('key') || label.includes('api')) {
                onNavigateTab('security');
              } else {
                onNavigateTab(label);
              }
            }
          }}
          theme={theme}
          onToggleTheme={onToggleTheme || handleThemeToggle}
        />
      </div>
    </header>

    {/* Modals */}
    <GlobalSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      onSelectResult={handleSearchResultSelect}
      theme={theme}
      role={role}
    />

    <SecurityModal
      isOpen={isSecurityOpen}
      onClose={() => setIsSecurityOpen(false)}
      theme={theme}
    />

    <ProfileCenterModal
      isOpen={profileCenterOpen}
      onClose={() => setProfileCenterOpen(false)}
      initialSection={profileCenterSection}
      theme={theme}
    />
    </>
  );
}


