import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, TrendingUp, User, FileText, DollarSign, Bookmark, Settings, HelpCircle, ArrowRight, CornerDownLeft, Shield, Cpu, Activity, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Stocks' | 'Crypto' | 'Statements' | 'Watchlists' | 'Settings' | 'Support';
  badge?: string;
  urlOrAction?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: GlobalSearchResult) => void;
  theme?: 'light' | 'dark';
  role?: 'admin' | 'analyst' | 'user';
}

const SEARCH_DATA: GlobalSearchResult[] = [
  // Stocks & ETFs
  { id: 's-1', title: 'NVDA - NVIDIA Corporation', subtitle: 'Stock • Technology / Semiconductors • $1,280.40 (+4.2%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-2', title: 'AAPL - Apple Inc.', subtitle: 'Stock • Consumer Electronics • $192.50 (+1.1%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-3', title: 'TSLA - Tesla, Inc.', subtitle: 'Stock • Automotive & Clean Energy • $180.20 (-0.8%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-4', title: 'MSFT - Microsoft Corporation', subtitle: 'Stock • Software & Cloud Infrastructure • $425.10 (+2.1%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-5', title: 'SPY - SPDR S&P 500 ETF Trust', subtitle: 'ETF • Broad Market Index • $532.80 (+0.5%)', category: 'Stocks', badge: 'NYSE' },
  { id: 's-6', title: 'QQQ - Invesco QQQ Trust', subtitle: 'ETF • Tech Heavy Index • $458.20 (+1.4%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-7', title: 'AMD - Advanced Micro Devices', subtitle: 'Stock • Semiconductors • $164.80 (+3.5%)', category: 'Stocks', badge: 'NASDAQ' },
  { id: 's-8', title: 'AMZN - Amazon.com, Inc.', subtitle: 'Stock • E-Commerce & AWS Cloud • $185.60 (+0.9%)', category: 'Stocks', badge: 'NASDAQ' },

  // Crypto
  { id: 'c-1', title: 'BTC - Bitcoin', subtitle: 'Cryptocurrency • Decentralized Store of Value • $68,450.00 (+5.4%)', category: 'Crypto', badge: '24/7 LIVE' },
  { id: 'c-2', title: 'ETH - Ethereum', subtitle: 'Cryptocurrency • Smart Contract Layer 1 • $3,840.00 (+3.2%)', category: 'Crypto', badge: '24/7 LIVE' },
  { id: 'c-3', title: 'SOL - Solana', subtitle: 'Cryptocurrency • High Throughput L1 • $174.20 (+8.1%)', category: 'Crypto', badge: '24/7 LIVE' },
  { id: 'c-4', title: 'BNB - Binance Coin', subtitle: 'Cryptocurrency • Exchange Ecosystem • $590.00 (+1.2%)', category: 'Crypto', badge: '24/7 LIVE' },

  // Statements
  { id: 'r-1', title: 'Q2 Institutional Alpha Report', subtitle: 'Statement • Semiconductor Sector Risk & Supercycle Valuation Analysis', category: 'Statements', badge: 'PDF EXPORT' },
  { id: 'r-2', title: 'Macro Economic Outlook 2026', subtitle: 'Statement • Federal Reserve Interest Rate Projections & Bond Yield Curve', category: 'Statements', badge: 'RESEARCH' },
  { id: 'r-3', title: 'DeFi Yield & Liquidity Audit', subtitle: 'Statement • Cross-Chain Protocol Risk Assessment for Treasury Assets', category: 'Statements', badge: 'CRYPTO AUDIT' },
  { id: 'r-4', title: 'High Dividend Aristocrats Summary', subtitle: 'Statement • 25-Year Dividend Growth Stocks Yielding >4.5%', category: 'Statements', badge: 'EQUITIES' },

  // Watchlists
  { id: 'w-1', title: 'Tech Titans & Cloud Leaders', subtitle: 'Watchlist • 12 Symbols (NVDA, AAPL, MSFT, GOOGL, AMZN...) • Daily +2.4%', category: 'Watchlists', badge: 'ACTIVE' },
  { id: 'w-2', title: 'High Yield Dividend Aristocrats', subtitle: 'Watchlist • 18 Symbols (JNJ, PG, KO, PEP, XOM...) • Yield 4.8%', category: 'Watchlists', badge: 'CUSTOM' },
  { id: 'w-3', title: 'DeFi & L1 Ecosystem Bluechips', subtitle: 'Watchlist • 8 Cryptocurrencies (BTC, ETH, SOL, LINK...) • Volatile', category: 'Watchlists', badge: 'CRYPTO' },
  { id: 'w-4', title: 'AI & Semiconductor Supercycle', subtitle: 'Watchlist • 10 Symbols (NVDA, AMD, TSM, ASML, AVGO...) • Daily +4.1%', category: 'Watchlists', badge: 'TOP PERFORMER' },

  // Settings
  { id: 'set-1', title: 'Security & 2FA Settings', subtitle: 'Settings • Manage Two-Factor Authentication, Google Authenticator & Passwords', category: 'Settings', badge: 'SECURITY' },
  { id: 'set-2', title: 'Display Theme & Interface Mode', subtitle: 'Settings • Toggle between Light Slate and Dark Obsidian institutional themes', category: 'Settings', badge: 'PREFERENCES' },
  { id: 'set-3', title: 'API Key Management & Webhooks', subtitle: 'Settings • Generate institutional REST API tokens and FIX protocol feeds', category: 'Settings', badge: 'DEVELOPER' },
  { id: 'set-4', title: 'Market Data Ingestion Queue', subtitle: 'Settings • Configure WebSocket streaming buffer and throttle parameters', category: 'Settings', badge: 'ADMIN' },

  // Support
  { id: 'sup-1', title: 'TICK-402: WebSocket Latency Spike', subtitle: 'Support Ticket • Investigating intermittent +15ms jitter on US-E1 edge node', category: 'Support', badge: 'IN PROGRESS' },
  { id: 'sup-2', title: 'TICK-391: Institutional KYC Level 3 Review', subtitle: 'Support Ticket • Verification documentation approved for Christian Alexander', category: 'Support', badge: 'RESOLVED' },
  { id: 'sup-3', title: 'TICK-388: FIX API Rate Limit Increase', subtitle: 'Support Ticket • Requesting 50,000 req/sec quota for algorithmic execution', category: 'Support', badge: 'APPROVED' },
];

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectResult,
  theme = 'light',
  role = 'user'
}: GlobalSearchModalProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<GlobalSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  // Keyboard listener for opening search modal via Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Parent handles opening usually, but let's dispatch event if needed
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveCategory('All');
      setSelectedIndex(0);
      try {
        const saved = JSON.parse(localStorage.getItem('global_recent_searches') || '[]');
        setRecentSearches(saved);
      } catch (e) {}
    }
  }, [isOpen]);

  // Filter & prioritize search results
  const filteredResults = React.useMemo(() => {
    let results = SEARCH_DATA;

    if (user) {
      const name = user.displayName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) || user.name || user.username || 'Christian Alexander';
      const email = user.email || 'sirlilchristian@gmail.com';
      const accountId = user.accountId || user.id || 'ACC-8924-X9';
      results = results.map(r => r);
    }

    // Category filter
    if (activeCategory !== 'All') {
      results = results.filter(r => r.category === activeCategory);
    }

    // Role filtering: hide root admin internal queue settings from non-admins if desired, or keep all searchable
    if (role !== 'admin') {
      results = results.filter(r => r.badge !== 'ROOT ADMIN' && r.badge !== 'ADMIN');
    }

    if (!query.trim()) {
      if (!showSuggestions) return [];
      let filteredRecent = recentSearches;
      if (activeCategory !== 'All') {
        filteredRecent = recentSearches.filter(r => r.category === activeCategory);
      }
      const recentIds = new Set(filteredRecent.map(r => r.id));
      const suggested = results.filter(r => !recentIds.has(r.id)).slice(0, 8);
      return [...filteredRecent, ...suggested];
    }

    const q = query.toLowerCase().trim();

    // Prioritize exact matches before partial matches
    const exactMatches: GlobalSearchResult[] = [];
    const prefixMatches: GlobalSearchResult[] = [];
    const partialMatches: GlobalSearchResult[] = [];

    results.forEach(item => {
      const titleLower = item.title.toLowerCase();
      const subLower = item.subtitle.toLowerCase();

      // Check exact symbol match or word match
      const titleWords = titleLower.split(/[\s-]+/);
      if (titleLower === q || titleWords.includes(q)) {
        exactMatches.push(item);
      } else if (titleLower.startsWith(q) || item.id.toLowerCase().startsWith(q)) {
        prefixMatches.push(item);
      } else if (titleLower.includes(q) || subLower.includes(q)) {
        partialMatches.push(item);
      }
    });

    return [...exactMatches, ...prefixMatches, ...partialMatches];
  }, [query, activeCategory, role, recentSearches]);

  // Handle keyboard navigation (Up, Down, Enter, Esc)
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(1, filteredResults.length)) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  };

  const handleSelect = (result: GlobalSearchResult) => {
    try {
      const existing = JSON.parse(localStorage.getItem('global_recent_searches') || '[]');
      const updated = [result, ...existing.filter((r: any) => r.id !== result.id)].slice(0, 5);
      localStorage.setItem('global_recent_searches', JSON.stringify(updated));
    } catch (e) {}

    if (onSelectResult) {
      onSelectResult(result);
    }
    onClose();
  };

  const categories = ['All', 'Stocks', 'Crypto', 'Statements', 'Watchlists', 'Settings', 'Support'];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Stocks': return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />;
      case 'Crypto': return <Coins className="w-3.5 h-3.5 text-amber-500" />;
      case 'Statements': return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case 'Watchlists': return <Bookmark className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Settings': return <Settings className="w-3.5 h-3.5 text-slate-500" />;
      case 'Support': return <HelpCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Search className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const [showStatementPopup, setShowStatementPopup] = useState(false);
  const [statementType, setStatementType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStatementPopup) {
          setShowStatementPopup(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showStatementPopup]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          onKeyDown={handleModalKeyDown}
          id="global-search-modal"
          className={`w-full max-w-4xl sm:max-w-5xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[88vh] my-auto relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e1420] border-slate-800 text-slate-100'
          }`}
        >
          {showStatementPopup && (
            <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm`}>
              <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#151b2b] border-slate-700'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Generate Statement</h3>
                  <button onClick={() => setShowStatementPopup(false)} className={`p-1 rounded-md ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Statement Type</label>
                    <select 
                      value={statementType}
                      onChange={(e) => setStatementType(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e1420] border-slate-700 text-white'
                      }`}
                    >
                      <option value="All">All Transactions</option>
                      <option value="Deposits">Deposits</option>
                      <option value="Withdrawals">Withdrawals</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>From Period</label>
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e1420] border-slate-700 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>To Period</label>
                      <input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0e1420] border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setShowStatementPopup(false);
                        // Optional: Show toast or handle generation
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                    >
                      Generate Statement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Search Input Bar */}
          <div className={`p-4 border-b flex items-center gap-3 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-900/50'}`}>
            <Search className="w-5 h-5 text-blue-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search stocks, tickers, crypto, users, reports, transactions, watchlists..."
              className="w-full bg-transparent border-none text-base font-medium focus:outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className={`p-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  isLight ? 'text-slate-400 hover:bg-slate-200' : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                CLEAR
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <span>ESC</span>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className={`px-4 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
            isLight ? 'border-slate-100 bg-white' : 'border-slate-800/80 bg-[#0e1420]'
          }`}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === 'Statements') {
                    setShowStatementPopup(true);
                  } else {
                    setActiveCategory(cat);
                    setSelectedIndex(0);
                  }
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No matching enterprise results found for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try searching by company name, stock ticker, user email, transaction ID, or report title.</p>
              </div>
            ) : (
              <>
                {!query && (
                  <div className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>
                      {showSuggestions 
                        ? (recentSearches.length > 0 ? 'Recent Searches & Suggested Access' : 'Suggested & Institutional Quick Access')
                        : 'Suggestions Hidden'}
                    </span>
                    <div className="flex items-center gap-3">
                      {showSuggestions && recentSearches.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.removeItem('global_recent_searches');
                            setRecentSearches([]);
                          }}
                          className="text-[10px] text-blue-500 hover:underline cursor-pointer"
                        >
                          Clear Recent
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSuggestions(!showSuggestions);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showSuggestions ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}
                {filteredResults.map((res, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelect(res)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                        isSelected
                          ? isLight
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs'
                            : 'bg-blue-600/15 border border-blue-500/30 text-white shadow-2xs'
                          : isLight
                          ? 'hover:bg-slate-50 border border-transparent text-slate-800'
                          : 'hover:bg-slate-800/50 border border-transparent text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-md'
                            : isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {getCategoryIcon(res.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-sm sm:text-base truncate">{res.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-400/30'
                                : isLight
                                ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {res.category}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm truncate mt-1 ${
                            isSelected ? (isLight ? 'text-blue-700' : 'text-blue-200') : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {res.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {res.badge && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold hidden sm:inline-block ${
                            res.badge.includes('VERIFIED') || res.badge.includes('FILLED') || res.badge.includes('SETTLED') || res.badge.includes('ACTIVE') || res.badge.includes('LIVE')
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20'
                          }`}>
                            {res.badge}
                          </span>
                        )}
                        <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-blue-500 opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className={`px-4 py-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}>
            <div className="flex items-center gap-3">
              <span><strong className="font-bold">↑↓</strong> Navigate</span>
              <span><strong className="font-bold">Enter</strong> Select</span>
              <span><strong className="font-bold">Esc</strong> Close</span>
            </div>
            <div className="hidden sm:block">
              <span>Global Search v3.2 • Institutional Engine</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
