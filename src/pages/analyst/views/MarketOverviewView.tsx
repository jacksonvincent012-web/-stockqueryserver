import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Layers, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  PieChart 
} from 'lucide-react';
import { INDEXED_STOCKS, SECTORS } from '../../../search';
import { AnalystTab } from '../AnalystSidebar';

interface MarketOverviewViewProps {
  onNavigateTab: (tab: AnalystTab) => void;
  liveStocks: Record<string, any>;
  theme?: 'light' | 'dark';
}

export default function MarketOverviewView({
  onNavigateTab,
  liveStocks,
  theme = 'dark'
}: MarketOverviewViewProps) {

  // Sort stocks into Top Gainers, Top Losers, Most Active based on simulated live stocks or static fallbacks
  const { gainers, losers, active } = useMemo(() => {
    const list = INDEXED_STOCKS.map(stock => {
      const live = liveStocks[stock.symbol] || {};
      const price = parseFloat(live.price || '150.00');
      const changeNum = parseFloat(live.change || live.change_percent || 0);
      const volume = live.volume || 10000000;
      return {
        ...stock,
        price: price.toFixed(2),
        changeNum,
        changeStr: `${changeNum >= 0 ? '+' : ''}${changeNum}%`,
        volumeFormatted: `${(volume / 1000000).toFixed(1)}M shares`
      };
    });

    const sortedByChange = [...list].sort((a, b) => b.changeNum - a.changeNum);
    const sortedByVolume = [...list].sort((a, b) => parseFloat(b.volumeFormatted) - parseFloat(a.volumeFormatted));

    return {
      gainers: sortedByChange.slice(0, 5),
      losers: sortedByChange.slice(-5).reverse(),
      active: sortedByVolume.slice(0, 5)
    };
  }, [liveStocks]);

  // Sector performance visual
  const sectorPerfs = [
    { name: 'Technology', change: '+2.4%', isPositive: true, width: '85%' },
    { name: 'Healthcare', change: '+1.1%', isPositive: true, width: '60%' },
    { name: 'Banking & Finance', change: '+0.6%', isPositive: true, width: '45%' },
    { name: 'Crypto', change: '+3.8%', isPositive: true, width: '95%' },
    { name: 'Energy', change: '-0.8%', isPositive: false, width: '35%' },
    { name: 'ETFs & Index Funds', change: '+0.9%', isPositive: true, width: '50%' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Market Overview & Trend Analysis</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review daily market leaders, sector performance breakdowns, and high-volume stock activity in plain English.
        </p>
      </div>

      {/* Top Gainers & Top Losers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Gaining Stocks */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Top Gaining Stocks</h3>
                <p className="text-xs text-slate-400">Companies with the highest price jumps today</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
              Bullish Trend
            </span>
          </div>

          <div className="space-y-3">
            {gainers.map((stock, idx) => (
              <div 
                key={stock.symbol}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">#{idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{stock.symbol}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm block">${stock.price}</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {stock.changeStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losing Stocks */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Top Losing Stocks</h3>
                <p className="text-xs text-slate-400">Companies with the biggest daily price drops</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold">
              Bearish Trend
            </span>
          </div>

          <div className="space-y-3">
            {losers.map((stock, idx) => (
              <div 
                key={stock.symbol}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b0f19] border border-slate-800 hover:border-rose-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">#{idx + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{stock.symbol}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm block">${stock.price}</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-400">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {stock.changeStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Most Active Stocks & Sector Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Active Stocks */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Most Active Stocks</h3>
                <p className="text-xs text-slate-400">Highest number of shares bought and sold today</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {active.map((stock, idx) => (
              <div 
                key={stock.symbol}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0b0f19] border border-slate-800 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{stock.symbol}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-blue-400 text-sm block">{stock.volumeFormatted}</span>
                  <span className="text-xs text-slate-400">${stock.price} ({stock.changeStr})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Performance Map */}
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Sector Performance</h3>
                  <p className="text-xs text-slate-400">Average daily momentum across industry groups</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigateTab('screeners')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Explore Sectors →
              </button>
            </div>

            <div className="space-y-4">
              {sectorPerfs.map((sec) => (
                <div key={sec.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{sec.name}</span>
                    <span className={`font-mono font-bold ${sec.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sec.change}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#0b0f19] rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className={`h-full rounded-full ${
                        sec.isPositive ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                      }`}
                      style={{ width: sec.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Sector Sentiment:</span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">Strong Growth Day</span>
          </div>
        </div>

      </div>

      {/* Market Summary Chart Section */}
      <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Market Summary Benchmark (S&P Index)</h3>
              <p className="text-xs text-slate-400">Visualizing average overall stock exchange momentum throughout today's session</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Session Status:</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">+1.65% Total Index Gain</span>
          </div>
        </div>

        {/* Clean SVG Area Chart Representation */}
        <div className="h-64 w-full bg-[#0b0f19] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between text-xs text-slate-500 font-mono z-10">
            <span>5,020.10 (Open)</span>
            <span className="text-emerald-400 font-bold">5,102.85 (Current High)</span>
          </div>

          {/* SVG Area Line Chart */}
          <div className="absolute inset-0 pt-8 pb-6 px-4 flex items-end justify-center pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="marketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 120 Q 50 110, 100 80 T 200 70 T 300 40 T 400 50 T 500 20 L 500 150 L 0 150 Z" 
                fill="url(#marketGrad)" 
              />
              <path 
                d="M 0 120 Q 50 110, 100 80 T 200 70 T 300 40 T 400 50 T 500 20" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
              />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-mono z-10 pt-2 border-t border-slate-800/60 mt-auto">
            <span>9:30 AM EST</span>
            <span>11:30 AM EST</span>
            <span>1:30 PM EST</span>
            <span>3:30 PM EST</span>
            <span>4:00 PM EST (Close)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
