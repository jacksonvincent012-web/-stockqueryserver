import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  Bell, 
  Star, 
  BarChart2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowRight, 
  Clock, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { AnalystTab } from '../AnalystSidebar';

interface DashboardViewProps {
  watchlistCount: number;
  alertsCount: number;
  onNavigateTab: (tab: AnalystTab) => void;
  liveStocks: Record<string, any>;
  theme?: 'light' | 'dark';
}

export default function DashboardView({
  watchlistCount,
  alertsCount,
  onNavigateTab,
  liveStocks,
  theme = 'dark'
}: DashboardViewProps) {
  
  // Calculate simulated biggest gainer or use default high performer
  let biggestGainer = { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '895.40', change: '+4.2%', gain: '+$36.10' };
  let mostActive = { symbol: 'AAPL', name: 'Apple Inc.', volume: '48.5M shares', price: '189.20', change: '+1.4%' };

  if (liveStocks['NVDA'] && liveStocks['NVDA'].price) {
    biggestGainer.price = liveStocks['NVDA'].price;
    biggestGainer.change = `${liveStocks['NVDA'].change > 0 ? '+' : ''}${liveStocks['NVDA'].change}%`;
  }
  if (liveStocks['AAPL'] && liveStocks['AAPL'].price) {
    mostActive.price = liveStocks['AAPL'].price;
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome & Market Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, Senior Analyst</h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your daily market summary and stock monitoring overview.
          </p>
        </div>

        {/* Market Status Card */}
        <div className="flex items-center gap-4 bg-[#0b0f19] px-5 py-3 rounded-2xl border border-emerald-500/30">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400">Market Status: Open</span>
            <span className="text-[11px] text-slate-400">Regular Trading Hours • All Systems Live</span>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards required by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Market Status Summary */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Market Status</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">Active & Trading</h3>
            <p className="text-xs text-slate-400">NYSE, NASDAQ & LSE operating normally</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400">
            <span>Next close in 5h 30m</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Stocks Being Watched */}
        <div 
          onClick={() => onNavigateTab('management')}
          className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Stocks Being Watched</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{watchlistCount} Stocks</h3>
            <p className="text-xs text-slate-400">In your active favourite list</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold">
            <span>Open Watchlist</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div 
          onClick={() => onNavigateTab('management')}
          className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Active Alerts</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{alertsCount} Conditions</h3>
            <p className="text-xs text-slate-400">Monitoring price & volume triggers</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Manage Alerts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Biggest Gainer Today */}
        <div 
          onClick={() => onNavigateTab('fundamental')}
          className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Biggest Gainer Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white">{biggestGainer.symbol}</h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                {biggestGainer.change}
              </span>
            </div>
            <p className="text-xs text-slate-400">{biggestGainer.name} • ${biggestGainer.price}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>View Market Overview</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Most Active Stock */}
        <div 
          onClick={() => onNavigateTab('fundamental')}
          className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Most Active Stock</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white">{mostActive.symbol}</h3>
              <span className="text-xs font-mono font-semibold text-blue-400">{mostActive.volume}</span>
            </div>
            <p className="text-xs text-slate-400">{mostActive.name} • ${mostActive.price}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold">
            <span>See Volume Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 6: Total Market Volume */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Total Market Volume</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">4.82 Billion</h3>
            <p className="text-xs text-slate-400">Total shares traded today across exchanges</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400">
            <span>+12.4% higher than 30-day average</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border border-blue-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Ready to analyze stocks?</h3>
          <p className="text-sm text-slate-300">
            Use our plain English tools to explore price histories, set up custom alerts, or generate client reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('research')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            Search Stocks
          </button>
          <button
            onClick={() => onNavigateTab('analysis')}
            className="px-5 py-2.5 bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            Price History
          </button>
          <button
            onClick={() => onNavigateTab('report_crafting')}
            className="px-5 py-2.5 bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            Create Report
          </button>
        </div>
      </div>

    </div>
  );
}
