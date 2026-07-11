import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Bookmark, 
  ShieldCheck, Plus, ArrowDown, ArrowRightLeft, Eye, MoreVertical, 
  ChevronRight, Target, Award, Clock, ArrowUpRight, ArrowDownLeft, 
  Coins, Building, CheckCircle2, Sparkles, RefreshCw, Search,
  ArrowUp, ArrowRight, Check, AlertCircle, Info
} from 'lucide-react';
import { StockLogo } from '../MultiStockGrid';

interface PortfolioViewProps {
  theme?: 'light' | 'dark';
  onSelectStock: (symbol: string) => void;
  onNavigateTab?: (tab: 'portfolio' | 'trade' | 'watchlists' | 'wallet' | 'profile' | 'alerts') => void;
}

interface HoldingItem {
  id: string;
  symbol: string;
  name: string;
  type: 'Stock' | 'Crypto' | 'ETF' | 'Cash';
  shares: number | string;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  gainValue: number;
  gainPercent: number;
  allocation?: number;
}

interface ActivityItem {
  id: string;
  type: 'trade' | 'deposit' | 'dividend' | 'transfer';
  title: string;
  subtitle: string;
  amount: string;
  isPositive: boolean;
  status: string;
}

export default function PortfolioView({ theme = 'light', onSelectStock, onNavigateTab }: PortfolioViewProps) {
  const [activeHoldingTab, setActiveHoldingTab] = useState<'All' | 'Stocks' | 'Crypto' | 'ETFs' | 'Cash'>('All');
  const [activeActivityTab, setActiveActivityTab] = useState<'All' | 'Trades' | 'Deposits' | 'Dividends' | 'Transfers'>('All');
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const isLight = theme === 'light';

  // Helper for tab navigation
  const handleAction = (tab: 'portfolio' | 'trade' | 'watchlists' | 'wallet' | 'profile' | 'alerts', symbol?: string) => {
    if (symbol && onSelectStock) onSelectStock(symbol);
    if (onNavigateTab) onNavigateTab(tab);
  };

  const holdingsData: HoldingItem[] = useMemo(() => [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'Stock',
      shares: 45,
      avgPrice: 175.50,
      currentPrice: 209.89,
      marketValue: 9445.05,
      gainValue: 1547.03,
      gainPercent: 19.6,
      allocation: 24.7
    },
    {
      id: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      type: 'Stock',
      shares: 30,
      avgPrice: 410.20,
      currentPrice: 445.70,
      marketValue: 13371.00,
      gainValue: 1065.00,
      gainPercent: 8.6,
      allocation: 35.0
    },
    {
      id: '3',
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      type: 'Stock',
      shares: 120,
      avgPrice: 110.00,
      currentPrice: 128.50,
      marketValue: 15420.00,
      gainValue: 2220.00,
      gainPercent: 16.8,
      allocation: 40.3
    },
    {
      id: '4',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'Crypto',
      shares: 0.45,
      avgPrice: 61200.00,
      currentPrice: 66450.00,
      marketValue: 29902.50,
      gainValue: 2362.50,
      gainPercent: 8.6
    },
    {
      id: '5',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'Crypto',
      shares: 2.50,
      avgPrice: 3200.00,
      currentPrice: 3450.00,
      marketValue: 8625.00,
      gainValue: 625.00,
      gainPercent: 7.8
    },
    {
      id: '6',
      symbol: 'SOL',
      name: 'Solana',
      type: 'Crypto',
      shares: 15,
      avgPrice: 130.00,
      currentPrice: 154.20,
      marketValue: 2313.00,
      gainValue: 363.00,
      gainPercent: 18.6
    },
    {
      id: '7',
      symbol: 'USDT',
      name: 'Tether USD',
      type: 'Crypto',
      shares: 1500,
      avgPrice: 1.00,
      currentPrice: 1.00,
      marketValue: 1500.00,
      gainValue: 0.00,
      gainPercent: 0.0
    }
  ], []);

  const filteredHoldings = useMemo(() => {
    let items = holdingsData;
    if (activeHoldingTab === 'Stocks') items = holdingsData.filter(h => h.type === 'Stock');
    if (activeHoldingTab === 'Crypto') items = holdingsData.filter(h => h.type === 'Crypto');
    if (activeHoldingTab === 'ETFs') items = holdingsData.filter(h => h.type === 'ETF');
    if (activeHoldingTab === 'Cash') items = holdingsData.filter(h => h.type === 'Cash');
    return showAllHoldings ? items : items.slice(0, 4);
  }, [holdingsData, activeHoldingTab, showAllHoldings]);

  const activityData: ActivityItem[] = useMemo(() => [
    {
      id: 'a1',
      type: 'trade',
      title: 'Bought 10 NVDA',
      subtitle: 'Limit Order • Today, 10:42 AM',
      amount: '-$1,285.00',
      isPositive: false,
      status: 'Completed'
    },
    {
      id: 'a2',
      type: 'deposit',
      title: 'Deposit via M-Pesa',
      subtitle: 'Instant Credit • Yesterday, 9:00 AM',
      amount: '+$5,000.00',
      isPositive: true,
      status: 'Completed'
    },
    {
      id: 'a3',
      type: 'trade',
      title: 'Sold 5 AAPL',
      subtitle: 'Market Order • Yesterday, 3:15 PM',
      amount: '+$1,040.50',
      isPositive: true,
      status: 'Completed'
    },
    {
      id: 'a4',
      type: 'dividend',
      title: 'Dividend Received',
      subtitle: 'Apple Inc. (AAPL) • $0.26/share • June 28',
      amount: '+$11.70',
      isPositive: true,
      status: 'Completed'
    },
    {
      id: 'a5',
      type: 'transfer',
      title: 'Transfer to Cold Wallet',
      subtitle: 'Internal Withdrawal • June 25',
      amount: '-0.25 BTC',
      isPositive: false,
      status: 'Completed'
    }
  ], []);

  const filteredActivities = useMemo(() => {
    let items = activityData;
    if (activeActivityTab === 'Trades') items = activityData.filter(a => a.type === 'trade');
    if (activeActivityTab === 'Deposits') items = activityData.filter(a => a.type === 'deposit');
    if (activeActivityTab === 'Dividends') items = activityData.filter(a => a.type === 'dividend');
    if (activeActivityTab === 'Transfers') items = activityData.filter(a => a.type === 'transfer');
    return showAllActivities ? items : items.slice(0, 4);
  }, [activityData, activeActivityTab, showAllActivities]);

  return (
    <div className={`space-y-6 text-sm font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      
      {/* ================= SECTION 1: TOP SUMMARY & QUICK ACTIONS ================= */}
      <div className={`p-6 sm:p-7 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
        
        {/* Top 5 Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-center">
          
          {/* Col 1: Total Portfolio Value */}
          <div className="lg:col-span-3 flex items-center justify-between lg:pr-6 lg:border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Portfolio Value</div>
              <div className={`text-3xl font-black font-sans tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                $38,236.05
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-500">
                <span>+$4,832.55 (14.47%)</span>
                <span className="font-normal text-slate-400">All Time</span>
              </div>
            </div>
            {/* Sparkline graphic */}
            <div className="w-20 h-10 flex items-center justify-end">
              <svg className="w-18 h-8 overflow-visible" viewBox="0 0 80 30" fill="none">
                <path 
                  d="M0 25 L12 22 L22 26 L35 15 L48 18 L60 8 L70 12 L80 4" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Col 2: Available Cash */}
          <div className="lg:col-span-3 flex items-start justify-between lg:px-6 lg:border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Cash</div>
              <div className={`text-2xl font-black font-sans tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                $24,500.00
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Buying Power: <span className="font-bold text-blue-500">$49,000.00</span>
              </div>
            </div>
            <button 
              onClick={() => handleAction('wallet')}
              className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
              title="Wallet & Cash Management"
            >
              <DollarSign className="w-5 h-5" />
            </button>
          </div>

          {/* Col 3: Investments */}
          <div className="lg:col-span-2 flex items-start justify-between lg:px-6 lg:border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Investments</div>
              <div className={`text-2xl font-black font-sans tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                7
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                3 Stocks • 4 Crypto
              </div>
            </div>
            <button 
              onClick={() => handleAction('trade')}
              className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors shrink-0"
              title="View Allocations"
            >
              <PieChart className="w-5 h-5" />
            </button>
          </div>

          {/* Col 4: Watchlists */}
          <div className="lg:col-span-2 flex items-start justify-between lg:px-6 lg:border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Watchlists</div>
              <div className={`text-2xl font-black font-sans tracking-tight mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                12
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Saved Lists
              </div>
            </div>
            <button 
              onClick={() => handleAction('watchlists')}
              className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
              title="Open Watchlists"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Col 5: Portfolio Health Badge */}
          <div className="lg:col-span-2 flex items-center justify-end">
            <div className={`w-full p-3.5 rounded-2xl flex items-center justify-between border ${isLight ? 'bg-emerald-50/70 border-emerald-100' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Portfolio Health</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-snug mt-0.5">
                  Excellent
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Well Diversified
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

        {/* Quick Actions Row */}
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white mb-3">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button 
              onClick={() => handleAction('wallet')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-blue-200/80 text-blue-600 hover:bg-blue-50/60 shadow-2xs' : 'bg-slate-900/60 border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Deposit Funds</span>
            </button>

            <button 
              onClick={() => handleAction('wallet')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-amber-200/80 text-amber-600 hover:bg-amber-50/60 shadow-2xs' : 'bg-slate-900/60 border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <ArrowDown className="w-4 h-4 text-amber-500" />
              <span>Withdraw Funds</span>
            </button>

            <button 
              onClick={() => handleAction('wallet')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-purple-200/80 text-purple-600 hover:bg-purple-50/60 shadow-2xs' : 'bg-slate-900/60 border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-purple-500" />
              <span>Transfer Money</span>
            </button>

            <button 
              onClick={() => handleAction('trade')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-emerald-200/80 text-emerald-600 hover:bg-emerald-50/60 shadow-2xs' : 'bg-slate-900/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Buy Stock</span>
            </button>

            <button 
              onClick={() => handleAction('trade')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-rose-200/80 text-rose-600 hover:bg-rose-50/60 shadow-2xs' : 'bg-slate-900/60 border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Sell Stock</span>
            </button>

            <button 
              onClick={() => handleAction('watchlists')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isLight ? 'bg-white border-indigo-200/80 text-indigo-600 hover:bg-indigo-50/60 shadow-2xs' : 'bg-slate-900/60 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>View Watchlist</span>
            </button>
          </div>
        </div>

      </div>

      {/* ================= SECTION 2: MAIN 2-COLUMN WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ---- LEFT COLUMN (8 Cols): HOLDINGS & RECENT ACTIVITY ---- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. My Holdings Table Card */}
          <div className={`p-6 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                My Holdings
              </h3>
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Stocks', 'Crypto', 'ETFs', 'Cash'] as const).map(tab => {
                  const count = tab === 'All' ? ' (7)' : tab === 'Stocks' ? ' (3)' : tab === 'Crypto' ? ' (4)' : tab === 'ETFs' ? ' (0)' : ' (1)';
                  const isActive = activeHoldingTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveHoldingTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                          : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      {tab}{count}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4 -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800/80">
                    <th className="pb-3 pr-4 font-semibold">Asset</th>
                    <th className="pb-3 px-3 font-semibold">Type</th>
                    <th className="pb-3 px-3 font-semibold">Shares / Qty</th>
                    <th className="pb-3 px-3 font-semibold">Avg. Price</th>
                    <th className="pb-3 px-3 font-semibold">Current Price</th>
                    <th className="pb-3 px-3 font-semibold">Market Value</th>
                    <th className="pb-3 px-3 font-semibold">Gain / Loss</th>
                    <th className="pb-3 pl-3 font-semibold">Allocation</th>
                    <th className="pb-3 pl-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredHoldings.map((item) => {
                    const isCrypto = item.type === 'Crypto';
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => handleAction('trade', item.symbol)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group"
                      >
                        {/* Asset col */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <StockLogo symbol={item.symbol} />
                            <div>
                              <div className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {item.symbol}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type col */}
                        <td className="py-3.5 px-3">
                          <span className={`font-bold text-[11px] ${
                            isCrypto ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {item.type}
                          </span>
                        </td>

                        {/* Shares col */}
                        <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {item.shares}
                        </td>

                        {/* Avg Price col */}
                        <td className="py-3.5 px-3 font-medium text-slate-500 dark:text-slate-400">
                          ${item.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Current Price col */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Market Value col */}
                        <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">
                          ${item.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Gain / Loss col */}
                        <td className="py-3.5 px-3 font-bold">
                          <div className="text-emerald-600 dark:text-emerald-400">
                            +${item.gainValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            +{item.gainPercent.toFixed(1)}%
                          </div>
                        </td>

                        {/* Allocation col */}
                        <td className="py-3.5 pl-3 font-semibold text-slate-700 dark:text-slate-300">
                          {item.allocation ? (
                            <div className="flex items-center gap-2">
                              {/* Simple donut ring icon indicator */}
                              <svg className="w-4 h-4 -rotate-90 text-emerald-500 shrink-0" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - item.allocation / 100)} />
                              </svg>
                              <span>{item.allocation.toFixed(1)}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Action col */}
                        <td className="py-3.5 pl-2 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAction('trade', item.symbol); }}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* View All Footer Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <button 
                onClick={() => setShowAllHoldings(!showAllHoldings)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{showAllHoldings ? 'Show top holdings' : 'View all holdings'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllHoldings ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* 2. Recent Activity Card */}
          <div className={`p-6 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Recent Activity
              </h3>
              
              {/* Activity Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'Trades', 'Deposits', 'Dividends', 'Transfers'] as const).map(tab => {
                  const isActive = activeActivityTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveActivityTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                          : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {filteredActivities.map((act) => {
                let iconBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                let Icon = TrendingUp;
                if (act.type === 'deposit') {
                  iconBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  Icon = Plus;
                } else if (act.type === 'trade' && !act.isPositive) {
                  iconBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                  Icon = TrendingUp;
                } else if (act.type === 'trade' && act.isPositive) {
                  iconBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
                  Icon = TrendingDown;
                } else if (act.type === 'dividend') {
                  iconBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                  Icon = Coins;
                } else if (act.type === 'transfer') {
                  iconBg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
                  Icon = ArrowRightLeft;
                }

                return (
                  <div key={act.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {act.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {act.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-black font-mono text-xs ${act.isPositive ? 'text-emerald-600 dark:text-emerald-400' : isLight ? 'text-slate-900' : 'text-white'}`}>
                        {act.amount}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {act.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Activity Footer Link */}
            <div className="mt-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>{showAllActivities ? 'Show recent activity' : 'View all activity'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllActivities ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

        </div>

        {/* ---- RIGHT COLUMN (4 Cols): SECTOR ALLOCATION, INSIGHTS, MY GOAL ---- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Allocation by Sector Card */}
          <div className={`p-6 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
            <h3 className={`text-base font-bold mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Allocation by Sector
            </h3>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart SVG */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Technology (65%) -> Blue #3b82f6 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    strokeDasharray="65, 100"
                  />
                  {/* Financials (15%) -> Green #10b981 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-65"
                  />
                  {/* Consumer (10%) -> Orange #f59e0b */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-80"
                  />
                  {/* Crypto (10%) -> Purple #8b5cf6 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="6"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                  />
                </svg>
                {/* Center text hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">100%</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Technology</span>
                  </div>
                  <span className="font-black font-mono">65%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Financials</span>
                  </div>
                  <span className="font-black font-mono">15%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Consumer</span>
                  </div>
                  <span className="font-black font-mono">10%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Crypto</span>
                  </div>
                  <span className="font-black font-mono">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Portfolio Insights Card */}
          <div className={`p-6 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
            <h3 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Portfolio Insights
            </h3>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Best Performer */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50/40 border-emerald-100' : 'bg-emerald-950/10 border-emerald-500/10'}`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">Best Performer</span>
                </div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  NVIDIA
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +42.78%
                </div>
              </div>

              {/* Worst Performer */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-rose-50/40 border-rose-100' : 'bg-rose-950/10 border-rose-500/10'}`}>
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">Worst Performer</span>
                </div>
                <div className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                  Ethereum
                </div>
                <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  -1.20%
                </div>
              </div>

              {/* Dividend Income */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50/40 border-emerald-100' : 'bg-emerald-950/10 border-emerald-500/10'}`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">Dividend Income</span>
                </div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  This Month
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  $184.00
                </div>
              </div>

              {/* Diversification Score */}
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50/40 border-emerald-100' : 'bg-emerald-950/10 border-emerald-500/10'}`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold">Diversification</span>
                </div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                  Excellent
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  8.6 / 10
                </div>
              </div>

            </div>
          </div>

          {/* 3. My Goal Card */}
          <div className={`p-6 rounded-2xl border shadow-xs ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                My Goal
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Target</div>
                <div className={`text-2xl font-black font-sans mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  $100,000.00
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-slate-900 dark:text-white font-black">38%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '38%' }} />
                </div>
              </div>

              {/* Summary boxes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50/80 border-slate-200/60' : 'bg-slate-900/40 border-slate-800'}`}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Goal Reached In</div>
                  <div className={`text-sm font-black font-sans mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    3.4 Years
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50/80 border-slate-200/60' : 'bg-slate-900/40 border-slate-800'}`}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Monthly Investment</div>
                  <div className={`text-sm font-black font-sans mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    $1,500.00
                  </div>
                </div>
              </div>

              {/* Footer Link */}
              <div className="pt-2 text-center">
                <button 
                  onClick={() => handleAction('profile')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Update Goal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
