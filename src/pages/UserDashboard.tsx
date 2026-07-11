import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Search, Activity, LogOut, BarChart2, ArrowRight, Clock, Bell, TrendingUp, TrendingDown, Layers, Shield, Zap, RefreshCw, Database, PieChart, Columns, Sun, Moon, User, Menu, X } from 'lucide-react';
import type { IndexedStock } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { INDEXED_STOCKS, performIntelligentSearch, saveRecentSearch, getRecentSearches, type IntelligentSearchResult } from '../search';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRealtimeSnapshot } from '../hooks/useRealtimeSnapshot';

import StockView from '../components/StockView';
import LiveTickerTape from '../components/LiveTickerTape';
import SectorIndexes from '../components/SectorIndexes';
import MultiStockGrid, { StockLogo } from '../components/MultiStockGrid';
import SystemMonitoringSidebar from '../components/SystemMonitoringSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import WalletView from '../components/user/WalletView';
import PortfolioView from '../components/user/PortfolioView';
import WatchlistsView from '../components/user/WatchlistsView';
import UserProfileView from '../components/user/UserProfileView';
import CompareStocksView from '../components/CompareStocksView';

const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BRK.A'];

export default function UserDashboard() {
  const { logout, confirmLogout, role } = useAuth();
  const navigate = useNavigate();
  
  // Theme Management - Default to Luminous White Theme as requested
  
  useEffect(() => {
    // Show some example notifications popping up on initial load
    const timer1 = setTimeout(() => {
      toast.success('TSLA order filled at $180.20', { description: '100 shares bought successfully' });
    }, 1000);
    const timer2 = setTimeout(() => {
      toast.info('Price Alert: NVDA', { description: 'NVIDIA has hit your target of $900.00' });
    }, 2500);
    const timer3 = setTimeout(() => {
      toast.warning('Margin Call Warning', { description: 'Your account margin is approaching limits.' });
    }, 4500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'trade' | 'compare' | 'watchlists' | 'wallet' | 'profile' | 'alerts'>('portfolio');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['portfolio']));
  const [compareSymbols, setCompareSymbols] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'TSLA']);

  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);
  const [dismissedAlertBanner, setDismissedAlertBanner] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOutcome, setSearchOutcome] = useState<IntelligentSearchResult>({ results: [], isTrendingOrRecent: true, totalMatches: 0 });
  const [autocompleteResults, setAutocompleteResults] = useState<IndexedStock[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [selectedStock, setSelectedStock] = useState<IndexedStock | null>(null);
  const { liveStocks, alerts: snapshotAlerts } = useRealtimeSnapshot();
  const alerts = snapshotAlerts.triggered || [];
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLiveQuotes = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/snapshot');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleRefreshEvent = () => {
      fetchLiveQuotes();
      toast.success('Live market quotes, portfolio, and feeds synchronized!');
    };
    window.addEventListener('app:refresh-live-data', handleRefreshEvent);
    return () => window.removeEventListener('app:refresh-live-data', handleRefreshEvent);
  }, []);

  useEffect(() => {
    const outcome = performIntelligentSearch(query, getRecentSearches());
    setSearchOutcome(outcome);
    setAutocompleteResults(outcome.results);
  }, [query, showAutocomplete]);

  const handleSearchSubmit = (symbolOrQuery: string) => {
    if (!symbolOrQuery.trim()) return;
    
    setShowAutocomplete(false);
    const symbol = symbolOrQuery.toUpperCase();
    saveRecentSearch(symbol);
    const stock = INDEXED_STOCKS.find(s => s.symbol === symbol);
    
    if (stock) {
      setSelectedStock(stock);
      setQuery(stock.symbol);
      setActiveTab('trade');
    } else if (autocompleteResults.length > 0) {
      const firstMatch = autocompleteResults[0];
      saveRecentSearch(firstMatch.symbol);
      setSelectedStock(firstMatch);
      setQuery(firstMatch.symbol);
      setActiveTab('trade');
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(query);
  };

  const handleLogout = () => {
    confirmLogout(() => {
      logout();
      navigate('/');
    });
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'PRICE_JUMP':
      case 'NEW_HIGH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PRICE_DROP':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'VOLUME_SPIKE':
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#080a0e] text-slate-300'} font-sans selection:bg-slate-700/30 flex overflow-x-hidden`}>
      {/* Main Right Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Returned Feature 2: Live Market Ticker Feed across top */}
        <LiveTickerTape
          liveStocks={liveStocks}
          onSelectStock={(sym) => handleSearchSubmit(sym)}
        />

        {/* Top Header */}
        <div className="sticky top-0 z-40">
          <AdminHeader
            role="user"
            activeTab={activeTab}
            onToggleSidebar={() => setIsNavOpen(!isNavOpen)}
            isSidebarOpen={isNavOpen}
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            onRefresh={fetchLiveQuotes}
            onNavigateTab={(tab) => {
              const t = tab as any;
              if (['trade', 'watchlists', 'compare', 'portfolio', 'wallet', 'alerts', 'news', 'profile'].includes(t)) {
                setActiveTab(t);
              }
            }}
          />
          {/* Smooth Slide-Down Navigation Panel inside active page */}
          <SystemMonitoringSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            setTheme={setTheme}
            isOpen={isNavOpen}
            onClose={() => setIsNavOpen(false)}
          />
        </div>

        {/* Main Dashboard Content */}
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
          {/* Real-time Alert Banner */}
          {alerts.length > 0 && activeTab !== 'alerts' && !dismissedAlertBanner && (
            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider shrink-0 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                  <Zap className="w-3 h-3 animate-pulse text-blue-400" /> Live Signal
                </span>
                <span className="text-xs font-mono font-bold text-white shrink-0">{alerts[0].symbol}:</span>
                <span className="text-xs text-slate-300 truncate">{alerts[0].reason}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <button 
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All ({alerts.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setDismissedAlertBanner(true)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Dismiss alert banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* NS Search Bar Section */}
          <section className="bg-white dark:bg-[#0b0e14] rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-2xl relative z-30 transition-all" ref={searchRef}>
            <form onSubmit={handleAnalyze} className="relative">
              <input
                type="text"
                placeholder="Search stocks (e.g., AAPL, TSLA, MSFT, GOOG, META, SPY, QQQ)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                className="w-full bg-transparent border-0 py-3.5 pl-12 pr-28 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 text-sm md:text-base font-sans outline-none"
              />
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-900 dark:disabled:text-slate-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <AnimatePresence>
              {showAutocomplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800/60"
                >
                  {searchOutcome.isTrendingOrRecent && (
                    <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{query.trim().length === 1 ? 'Start typing 2-3 chars for search • Trending & Recent' : '🔥 Trending & Recent Searches'}</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Ranked by Popularity</span>
                    </div>
                  )}
                  {searchOutcome.results.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 font-mono">
                      No matching tickers or company names found for "{query}".
                    </div>
                  ) : (
                    searchOutcome.results.map((item) => {
                      const isRecent = getRecentSearches().includes(item.symbol);
                      return (
                        <div
                          key={item.symbol}
                          onClick={() => handleSearchSubmit(item.symbol)}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded text-xs border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                              {item.symbol}
                              {isRecent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Recent Search" />}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                {item.name}
                                {item.trending && <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">HOT</span>}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{item.sector}</span>
                                <span>•</span>
                                <span>{item.marketCap}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-slate-300 font-mono font-bold flex items-center gap-1">
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      );
                    })
                  )}
                  {!searchOutcome.isTrendingOrRecent && searchOutcome.totalMatches > searchOutcome.results.length && (
                    <div 
                      onClick={() => {
                        setShowAutocomplete(false);
                        setActiveTab('trade');
                      }}
                      className="p-3 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-center text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View all {searchOutcome.totalMatches} results for "{query}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Tab: Portfolio */}
          {visitedTabs.has('portfolio') && (
            <div className={activeTab === 'portfolio' ? 'space-y-6 block' : 'hidden'}>
              <PortfolioView theme={theme} onSelectStock={(sym) => handleSearchSubmit(sym)} onNavigateTab={(tab) => setActiveTab(tab as any)} />
            </div>
          )}

          {/* Tab: Wallet */}
          {visitedTabs.has('wallet') && (
            <div className={activeTab === 'wallet' ? 'space-y-6 block' : 'hidden'}>
              <WalletView theme={theme} />
            </div>
          )}

          {/* Tab: Compare */}
          {visitedTabs.has('compare') && (
            <div className={activeTab === 'compare' ? 'space-y-6 block' : 'hidden'}>
              <CompareStocksView 
                theme={theme} 
                onSelectStock={(sym) => handleSearchSubmit(sym)} 
                selectedSymbols={compareSymbols}
                onUpdateSymbols={setCompareSymbols}
              />
            </div>
          )}

          {/* Tab: Watchlists */}
          {visitedTabs.has('watchlists') && (
            <div className={activeTab === 'watchlists' ? 'space-y-6 block' : 'hidden'}>
              <WatchlistsView theme={theme} onSelectStock={(sym) => handleSearchSubmit(sym)} />
            </div>
          )}

          {/* Tab: Profile */}
          {visitedTabs.has('profile') && (
            <div className={activeTab === 'profile' ? 'space-y-6 block' : 'hidden'}>
              <UserProfileView theme={theme} />
            </div>
          )}

          {/* Tab: Trade & Search */}
          {(visitedTabs.has('trade') || selectedStock) && (
            <div className={activeTab === 'trade' ? 'space-y-6 block' : 'hidden'}>
              {selectedStock ? (
                <div key={selectedStock.symbol} className="space-y-6">
                  <StockView 
                    stock={selectedStock} 
                    liveData={liveStocks[selectedStock.symbol]} 
                    theme={theme} 
                    onOpenCompare={() => {
                      if (!compareSymbols.includes(selectedStock.symbol)) {
                        setCompareSymbols(prev => [selectedStock.symbol, ...prev.slice(0, 3)]);
                      }
                      setActiveTab('compare');
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`flex-1 flex flex-col items-center justify-center min-h-[480px] rounded-2xl p-8 text-center shadow-sm border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                    <BarChart2 className="w-8 h-8" />
                  </div>
                  <h2 className={`text-2xl font-bold tracking-tight mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Trade & Analyze Assets
                  </h2>
                  <p className={`text-sm max-w-md mb-8 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Search for a stock symbol or company name using the search bar above to view charts, metrics, and execute trades.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                    <span className={`text-xs font-mono mr-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Quick Select:</span>
                    {WATCHLIST_SYMBOLS.slice(0, 6).map(ticker => (
                      <button
                        key={ticker}
                        onClick={() => handleSearchSubmit(ticker)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          theme === 'light' 
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Alerts */}
          {visitedTabs.has('alerts') && (
            <div className={activeTab === 'alerts' ? 'space-y-6 block' : 'hidden'}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Notification Feed & Alerts</h2>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Live alerts for price volatility, volume surges, and technical breakouts</p>
                </div>
                <span className={`text-xs font-mono flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
                  SSE Stream Active
                </span>
              </div>

              <div className={`rounded-2xl p-6 shadow-sm border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
                {alerts.length === 0 ? (
                  <div className={`py-16 text-center font-mono text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Listening for incoming real-time market anomalies via SSE channel...
                  </div>
                ) : (
                  <div className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                    {alerts.map((alt, idx) => {
                      const stock = INDEXED_STOCKS.find(s => s.symbol === alt.symbol);
                      return (
                        <div key={alt.id || `${alt.symbol}-${alt.time}-${idx}`} className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 px-3 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}`}>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${getAlertBadgeColor(alt.type)}`}>
                              {alt.type}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span 
                                  onClick={() => handleSearchSubmit(alt.symbol)}
                                  className={`font-mono font-bold text-base cursor-pointer transition-colors ${theme === 'light' ? 'text-slate-900 hover:text-blue-600' : 'text-white hover:text-slate-300'}`}
                                >
                                  {alt.symbol}
                                </span>
                                <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>({stock?.name || 'Stock Asset'})</span>
                              </div>
                              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{alt.reason}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                            <span className="font-mono font-bold text-sm text-blue-500 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20">
                              {alt.change}
                            </span>
                            <button
                              onClick={() => handleSearchSubmit(alt.symbol)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${
                                theme === 'light'
                                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              Analyze →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
