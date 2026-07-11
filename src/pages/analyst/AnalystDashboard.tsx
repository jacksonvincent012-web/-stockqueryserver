import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnalystSidebar, { AnalystTab } from './AnalystSidebar';
import { Menu, BarChart2, Bell } from 'lucide-react';
import { IndexedStock } from '../../types';
import { useRealtimeSnapshot } from '../../hooks/useRealtimeSnapshot';
import AdminHeader from '../../components/admin/AdminHeader';

import DashboardView from './views/DashboardView';
import SearchView from './views/SearchView';
import MarketOverviewView from './views/MarketOverviewView';
import PriceHistoryView from './views/PriceHistoryView';
import SectorsView from './views/SectorsView';
import AlertsView, { AnalystAlertItem } from './views/AlertsView';
import WatchlistView from './views/WatchlistView';
import ReportsView from './views/ReportsView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BRK.A'];

const DEFAULT_ALERTS: AnalystAlertItem[] = [
  {
    id: 'alert_1',
    stockSymbol: 'AAPL',
    stockName: 'Apple Inc.',
    monitorType: 'Price',
    condition: 'Goes Above',
    targetValue: '$195.00',
    priority: 'High',
    status: 'Active',
    dateCreated: 'Yesterday at 3:15 PM'
  },
  {
    id: 'alert_2',
    stockSymbol: 'NVDA',
    stockName: 'NVIDIA Corp.',
    monitorType: 'Daily Change',
    condition: 'Goes Above',
    targetValue: '3%',
    priority: 'Medium',
    status: 'Active',
    dateCreated: 'Today at 9:30 AM'
  },
  {
    id: 'alert_3',
    stockSymbol: 'TSLA',
    stockName: 'Tesla Inc.',
    monitorType: 'Trading Volume',
    condition: 'Goes Above',
    targetValue: '50000000',
    priority: 'Low',
    status: 'Triggered',
    dateCreated: '2 days ago'
  }
];

export default function AnalystDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AnalystTab>('dashboard');
  const [screenerResetKey, setScreenerResetKey] = useState<number>(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<AnalystTab>>(() => new Set(['dashboard']));

  useEffect(() => {
    setVisitedTabs(prev => {
      const next = new Set(prev);
      next.add(activeTab);
      if (activeTab === 'management' || activeTab === 'watchlist' || activeTab === 'compare') {
        next.add('management');
        next.add('watchlist');
        next.add('compare');
      }
      return next;
    });
  }, [activeTab]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('analyst_sidebar_collapsed') === 'true';
  });
  const [selectedHistoryStock, setSelectedHistoryStock] = useState<IndexedStock | null>(null);

  useEffect(() => {
    localStorage.setItem('analyst_sidebar_collapsed', String(isCollapsed));
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

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('analyst_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('analyst_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Watchlist State
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('analyst_watchlist');
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    } catch (e) {
      return DEFAULT_WATCHLIST;
    }
  });

  useEffect(() => {
    localStorage.setItem('analyst_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  // Alerts State
  const [alerts, setAlerts] = useState<AnalystAlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('analyst_alerts');
      return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
    } catch (e) {
      return DEFAULT_ALERTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('analyst_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Live Realtime Stock Quotes from Single Source of Truth
  const { liveStocks } = useRealtimeSnapshot();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Watchlist Handlers
  const handleAddToWatchlist = (stock: IndexedStock) => {
    if (!watchlistSymbols.includes(stock.symbol)) {
      setWatchlistSymbols([...watchlistSymbols, stock.symbol]);
    } else {
      setWatchlistSymbols(watchlistSymbols.filter(sym => sym !== stock.symbol));
    }
  };

  const handleAddSymbol = (sym: string) => {
    if (!watchlistSymbols.includes(sym)) {
      setWatchlistSymbols([...watchlistSymbols, sym]);
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    setWatchlistSymbols(watchlistSymbols.filter(s => s !== sym));
  };

  // Alerts Handlers
  const handleAddAlert = (newAlert: AnalystAlertItem) => {
    setAlerts([newAlert, ...alerts]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setAlerts(alerts.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'Active' ? 'Triggered' : 'Active' };
      }
      return a;
    }));
  };

  // Navigate to tab with optional stock context
  const handleNavigateTab = (tab: AnalystTab, stock?: IndexedStock) => {
    if (tab === 'screeners' && activeTab === 'screeners') {
      setScreenerResetKey(prev => prev + 1);
    }
    if (stock && tab === 'analysis') {
      setSelectedHistoryStock(stock);
    }
    setActiveTab(tab);
  };

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f19] text-slate-100'} flex flex-col font-sans selection:bg-blue-500/30`}>
      
      {/* Top Header Bar */}
      <AdminHeader
        role="analyst"
        activeTab={activeTab}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={typeof window !== 'undefined' && window.innerWidth < 1024 ? isMobileSidebarOpen : !isCollapsed}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onNavigateTab={(tab) => {
          const t = tab as any;
          if (['dashboard', 'research', 'fundamental', 'watchlist', 'compare', 'alerts', 'settings', 'reports', 'help'].includes(t)) {
            setActiveTab(t);
          }
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        <AnalystSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'screeners' && activeTab === 'screeners') {
              setScreenerResetKey(prev => prev + 1);
            }
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isCollapsed}
          theme={theme}
        />

        {/* Primary View Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-8 overflow-y-auto">
          {visitedTabs.has('dashboard') && (
            <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
              <DashboardView
                watchlistCount={watchlistSymbols.length}
                alertsCount={activeAlertsCount}
                onNavigateTab={handleNavigateTab}
                liveStocks={liveStocks}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('research') && (
            <div className={activeTab === 'research' ? 'block' : 'hidden'}>
              <SearchView
                onNavigateTab={handleNavigateTab}
                onAddToWatchlist={handleAddToWatchlist}
                watchlistSymbols={watchlistSymbols}
                liveStocks={liveStocks}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('fundamental') && (
            <div className={activeTab === 'fundamental' ? 'block' : 'hidden'}>
              <MarketOverviewView
                onNavigateTab={handleNavigateTab}
                liveStocks={liveStocks}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('analysis') && (
            <div className={activeTab === 'analysis' ? 'block' : 'hidden'}>
              <PriceHistoryView
                initialStock={selectedHistoryStock}
                watchlistSymbols={watchlistSymbols}
                liveStocks={liveStocks}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                onAddToWatchlist={handleAddSymbol}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('report_crafting') && (
            <div className={activeTab === 'report_crafting' ? 'block' : 'hidden'}>
              <ReportsView
                watchlistSymbols={watchlistSymbols}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('screeners') && (
            <div className={activeTab === 'screeners' ? 'block' : 'hidden'}>
              <SectorsView
                onNavigateTab={handleNavigateTab}
                onAddToWatchlist={handleAddToWatchlist}
                watchlistSymbols={watchlistSymbols}
                liveStocks={liveStocks}
                resetKey={screenerResetKey}
                theme={theme}
              />
            </div>
          )}

          {(visitedTabs.has('management') || visitedTabs.has('watchlist') || visitedTabs.has('compare')) && (
            <div className={(activeTab === 'management' || activeTab === 'watchlist' || activeTab === 'compare') ? 'block' : 'hidden'}>
              <WatchlistView
                activeTab={activeTab}
                watchlistSymbols={watchlistSymbols}
                onAddSymbol={handleAddSymbol}
                onRemoveSymbol={handleRemoveSymbol}
                onNavigateTab={handleNavigateTab}
                liveStocks={liveStocks}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('profile') && (
            <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
              <ProfileView
                watchlistCount={watchlistSymbols.length}
                alertsCount={activeAlertsCount}
                theme={theme}
              />
            </div>
          )}

          {visitedTabs.has('settings') && (
            <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
              <SettingsView
                theme={theme}
                onThemeChange={setTheme}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={`px-8 py-4 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors ${
          theme === 'light' ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800/80 bg-[#0b0f19] text-slate-500'
        }`}>
          <span>SQ Platform — Financial Analyst Dashboard (Plain English Interface)</span>
          <span className={theme === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-400'}>Real-Time Quotes Active • Hybrid Engine Feed</span>
        </footer>

        </div>
      </div>

    </div>
  );
}
