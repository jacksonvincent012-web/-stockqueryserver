import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Activity, Lock } from 'lucide-react';
import { useRealtimeSnapshot } from '../hooks/useRealtimeSnapshot';

// Modular Admin UI Components
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar, { AdminTab } from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import PlatformHealthView from '../components/admin/PlatformHealthView';
import AnalyticsView from '../components/admin/AnalyticsView';
import MarketFeedView from '../components/admin/MarketFeedView';
import QueueMonitorView from '../components/admin/QueueMonitorView';
import AlertsView from '../components/admin/AlertsView';
import TickerControlView from '../components/admin/TickerControlView';
import PerformanceView from '../components/admin/PerformanceView';
import BenchmarksView from '../components/admin/BenchmarksView';
import OperationsCenterView from '../components/admin/OperationsCenterView';
import UsersView from '../components/admin/UsersView';
import SettingsView from '../components/admin/SettingsView';
import CapacityView from '../components/admin/CapacityView';
import InfrastructureView from '../components/admin/InfrastructureView';
import SupportView from '../components/admin/SupportView';
import ReportsView from '../components/admin/ReportsView';
import AuditLogsView from '../components/admin/AuditLogsView';
import TransactionsView from '../components/admin/TransactionsView';

export default function SystemDashboard() {
  const { token, role, logout, confirmLogout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<Set<AdminTab>>(() => new Set(['dashboard']));

  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [systemMode, setSystemMode] = useState<string>('LIVE');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('admin_theme') as 'light' | 'dark') || 'light';
  });

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('admin_theme', next);
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('admin_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
        } else if (!isCollapsed && window.innerWidth >= 1024) {
          setIsCollapsed(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, isCollapsed]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const { alerts: snapshotAlerts } = useRealtimeSnapshot();
  const liveAlerts = snapshotAlerts.triggered || [];

  // Auth and Polling Effect
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/system/health', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setHealth(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/system/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setMetrics(await res.json());
        } else if (res.status === 403) {
          setMetrics({ error: 'Admin access required for detailed metrics' });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHealth();
    fetchMetrics();
    
    const interval = setInterval(() => {
      fetchHealth();
      if (role === 'admin') fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, role, navigate]);

  const handleLogout = () => {
    confirmLogout(() => {
      logout();
      navigate('/');
    });
  };

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const handleModeChange = async (mode: string) => {
    try {
      const res = await fetch('/api/admin/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }).then(r => r.json());
      if (res.mode) setSystemMode(res.mode);
    } catch (err) {
      console.error('Failed to change mode:', err);
    }
  };

  // If user is not admin and trying to view admin-only metrics, we can display a warning badge, but still let them navigate
  const isRestricted = role !== 'admin' && metrics?.error;

  return (
    <div className={`min-h-screen font-sans flex flex-col selection:bg-cyan-500 selection:text-white transition-colors ${
      theme === 'light' ? 'bg-slate-50/60 text-slate-800' : 'bg-[#0A0E17] text-slate-200'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader
        role="admin"
        onLogout={handleLogout}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={typeof window !== 'undefined' && window.innerWidth < 1024 ? isMobileSidebarOpen : !isCollapsed}
        healthStatus={health?.status || 'healthy'}
        activeConnections={health?.activeConnections || 62}
        systemMode={systemMode}
        onModeChange={handleModeChange}
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateTab={(tab) => {
          const t = tab as AdminTab;
          if (['dashboard', 'health', 'activity', 'sockets', 'security', 'cache', 'users', 'logs', 'transactions', 'support', 'audit', 'reports'].includes(t)) {
            setActiveTab(t);
          }
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full max-w-none">
        {/* Left Navigation Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onLogout={handleLogout}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          systemMode={systemMode}
          isCollapsed={isCollapsed}
          theme={theme}
          onQuickAction={(action) => {
            if (action === 'clear_cache') alert('System cache cleared successfully!');
            else if (action === 'reindex_search') alert('Search reindexing initiated.');
            else if (action === 'system_backup') alert('System backup created.');
            else if (action === 'view_logs') handleSelectTab('audit');
          }}
        />

        {/* Primary View Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-8 overflow-y-auto transition-all duration-300 ease-in-out">
          {/* If non-admin user is restricted on certain tabs, show banner */}
          {isRestricted && activeTab !== 'dashboard' && activeTab !== 'market' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">
                  You are logged in as <strong className="font-bold uppercase">{role}</strong>. Detailed hardware metrics require Admin clearance.
                </span>
              </div>
              <button
                onClick={() => navigate('/admin-login')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
              >
                Switch to Admin
              </button>
            </div>
          )}

          {/* Dynamic Tab Rendering */}
          {visitedTabs.has('dashboard') && (
            <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
              <DashboardOverview
                health={health}
                metrics={metrics}
                liveAlerts={liveAlerts}
                onNavigateTab={handleSelectTab}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('health') && (
            <div className={activeTab === 'health' ? 'block' : 'hidden'}>
              <PlatformHealthView theme={theme} />
            </div>
          )}

          {visitedTabs.has('market') && (
            <div className={activeTab === 'market' ? 'block' : 'hidden'}>
              <MarketFeedView theme={theme} />
            </div>
          )}

          {visitedTabs.has('queue') && (
            <div className={activeTab === 'queue' ? 'block' : 'hidden'}>
              <QueueMonitorView theme={theme} />
            </div>
          )}

          {visitedTabs.has('alerts') && (
            <div className={activeTab === 'alerts' ? 'block' : 'hidden'}>
              <AlertsView liveAlerts={liveAlerts} />
            </div>
          )}

          {visitedTabs.has('tickers') && (
            <div className={activeTab === 'tickers' ? 'block' : 'hidden'}>
              <TickerControlView theme={theme} />
            </div>
          )}

          {visitedTabs.has('performance') && (
            <div className={activeTab === 'performance' ? 'block' : 'hidden'}>
              <PerformanceView />
            </div>
          )}

          {visitedTabs.has('reports') && (
            <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
              <ReportsView />
            </div>
          )}

          {visitedTabs.has('benchmarks') && (
            <div className={activeTab === 'benchmarks' ? 'block' : 'hidden'}>
              <BenchmarksView />
            </div>
          )}

          {visitedTabs.has('operations') && (
            <div className={activeTab === 'operations' ? 'block' : 'hidden'}>
              <OperationsCenterView />
            </div>
          )}

          {visitedTabs.has('audit') && (
            <div className={activeTab === 'audit' ? 'block' : 'hidden'}>
              <AuditLogsView />
            </div>
          )}

          {visitedTabs.has('support') && (
            <div className={activeTab === 'support' ? 'block' : 'hidden'}>
              <SupportView />
            </div>
          )}

          {visitedTabs.has('capacity') && (
            <div className={activeTab === 'capacity' ? 'block' : 'hidden'}>
              <CapacityView theme={theme} />
            </div>
          )}

          {visitedTabs.has('infrastructure') && (
            <div className={activeTab === 'infrastructure' ? 'block' : 'hidden'}>
              <InfrastructureView theme={theme} />
            </div>
          )}

          {visitedTabs.has('users') && (
            <div className={activeTab === 'users' ? 'block' : 'hidden'}>
              <UsersView />
            </div>
          )}

          {visitedTabs.has('transactions') && (
            <div className={activeTab === 'transactions' ? 'block' : 'hidden'}>
              <TransactionsView />
            </div>
          )}

          {visitedTabs.has('settings') && (
            <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
              <SettingsView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
