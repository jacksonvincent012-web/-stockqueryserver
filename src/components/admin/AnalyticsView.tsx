import React, { useState } from 'react';
import { BarChart3, TrendingUp, Search, FileText, PieChart, ArrowUpRight, Activity, Users, Globe } from 'lucide-react';

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stocks' | 'searches'>('overview');

  const metricCards = [
    { title: 'Most Active Sector', value: 'Technology', desc: '42.5% of all platform queries', icon: PieChart, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { title: 'Daily Searches', value: '1,248,920', desc: '+14.2% compared to yesterday', icon: Search, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Reports Generated', value: '4,180', desc: 'PDF and Excel export downloads', icon: FileText, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { title: 'Weekly Growth', value: '+18.4%', desc: 'Increase in user data queries', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  const mostViewedStocks = [
    { rank: 1, symbol: 'NVDA', company: 'NVIDIA Corporation', views: '342,150 views', share: '18.4%', trend: '+24%' },
    { rank: 2, symbol: 'AAPL', company: 'Apple Inc.', views: '298,400 views', share: '16.1%', trend: '+12%' },
    { rank: 3, symbol: 'TSLA', company: 'Tesla, Inc.', views: '245,800 views', share: '13.2%', trend: '-4%' },
    { rank: 4, symbol: 'MSFT', company: 'Microsoft Corporation', views: '210,500 views', share: '11.3%', trend: '+8%' },
    { rank: 5, symbol: 'AMD', company: 'Advanced Micro Devices', views: '185,200 views', share: '10.0%', trend: '+19%' },
  ];

  const mostSearchedCompanies = [
    { query: 'artificial intelligence chips', searches: '84,200', topMatch: 'NVDA, AMD, TSM' },
    { query: 'electric vehicle market share', searches: '62,150', topMatch: 'TSLA, BYD, RIVN' },
    { query: 'cloud computing growth', searches: '58,900', topMatch: 'MSFT, AMZN, GOOGL' },
    { query: 'high dividend yields', searches: '49,300', topMatch: 'XOM, CVX, T, VZ' },
    { query: 'semiconductor supply chain', searches: '41,800', topMatch: 'ASML, AMAT, KLAC' },
  ];

  const weeklyTrendData = [
    { day: 'Mon', searches: 110, reports: 32 },
    { day: 'Tue', searches: 125, reports: 38 },
    { day: 'Wed', searches: 142, reports: 45 },
    { day: 'Thu', searches: 138, reports: 41 },
    { day: 'Fri', searches: 160, reports: 52 },
    { day: 'Sat', searches: 85, reports: 18 },
    { day: 'Sun', searches: 92, reports: 22 },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>PLATFORM INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Understand platform and market trends in plain English.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold">
            TIME RANGE: <strong className="text-blue-400">LAST 7 DAYS</strong>
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#111827] rounded-2xl p-5 border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 truncate">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight mb-1">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Charts Section (Plain English) */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Trend Charts: Weekly Search & Activity Volume</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shows how many stock searches and financial reports users generated each day over the past week.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-300">Daily Searches (in Thousands)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-slate-300">Reports Generated (in Tens)</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Visualization */}
        <div className="grid grid-cols-7 gap-3 pt-4 h-48 items-end">
          {weeklyTrendData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.searches}k
              </div>
              <div className="w-full flex gap-1.5 items-end justify-center h-full pb-2">
                <div 
                  className="w-1/2 bg-blue-500 hover:bg-blue-400 rounded-t transition-all duration-500" 
                  style={{ height: `${(d.searches / 160) * 100}%` }}
                />
                <div 
                  className="w-1/2 bg-purple-500 hover:bg-purple-400 rounded-t transition-all duration-500" 
                  style={{ height: `${(d.reports / 60) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Viewed Stocks & Most Searched Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Viewed Stocks */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Most Viewed Stocks</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">By user click volume</span>
          </div>
          <div className="space-y-3">
            {mostViewedStocks.map((stock) => (
              <div key={stock.symbol} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                    #{stock.rank}
                  </span>
                  <div>
                    <div className="font-bold text-white font-mono">{stock.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{stock.company}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">{stock.views}</div>
                  <div className="text-xs text-emerald-400">{stock.trend} this week</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Searched Companies */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              <span>Most Searched Companies</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Popular search terms</span>
          </div>
          <div className="space-y-3">
            {mostSearchedCompanies.map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">"{item.query}"</div>
                  <div className="text-xs font-mono text-blue-400 mt-0.5">Top results: {item.topMatch}</div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-sm font-bold text-slate-200">{item.searches}</div>
                  <div className="text-[10px] text-slate-500">searches</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
