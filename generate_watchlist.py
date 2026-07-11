import sys

code = """
import React from 'react';
import { 
  Monitor, Landmark, HeartPulse, Flame, ShoppingCart, 
  MessageSquare, Factory, Zap, TrendingUp, TrendingDown 
} from 'lucide-react';

interface WatchlistsViewProps {
  theme?: 'light' | 'dark';
  onSelectStock: (symbol: string) => void;
}

const CATEGORIES = [
  {
    title: 'Technology',
    icon: Monitor,
    price: 228.40,
    change: 3.70,
    changePct: 1.65,
    topCompanies: ['AAPL', 'MSFT', 'NVDA', 'TSLA'],
    tradingVolume: '14.8M',
    bestPerformer: 'AAPL',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'Banks & Finance',
    icon: Landmark,
    price: 41.90,
    change: -0.09,
    changePct: -0.21,
    topCompanies: ['JPM', 'BAC', 'V', 'MA'],
    tradingVolume: '34.5M',
    bestPerformer: 'JPM',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-900/20'
  },
  {
    title: 'Healthcare',
    icon: HeartPulse,
    price: 144.50,
    change: 0.46,
    changePct: 0.32,
    topCompanies: ['UNH', 'JNJ', 'ABBV', 'PFE'],
    tradingVolume: '15.2M',
    bestPerformer: 'UNH',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    title: 'Energy',
    icon: Flame,
    price: 91.30,
    change: -0.58,
    changePct: -0.64,
    topCompanies: ['XOM', 'CVX'],
    tradingVolume: '22.1M',
    bestPerformer: 'XOM',
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    title: 'Shopping & Retail',
    icon: ShoppingCart,
    price: 182.10,
    change: 2.08,
    changePct: 1.15,
    topCompanies: ['AMZN', 'TSLA'],
    tradingVolume: '11.4M',
    bestPerformer: 'AMZN',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    title: 'Media & Communication',
    icon: MessageSquare,
    price: 84.60,
    change: 0.77,
    changePct: 0.92,
    topCompanies: ['GOOGL', 'META'],
    tradingVolume: '13.2M',
    bestPerformer: 'GOOGL',
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50 dark:bg-sky-900/20'
  },
  {
    title: 'Manufacturing & Transport',
    icon: Factory,
    price: 124.80,
    change: 0.56,
    changePct: 0.45,
    topCompanies: ['CAT', 'GE', 'UPS'],
    tradingVolume: '9.8M',
    bestPerformer: 'CAT',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    title: 'Utilities',
    icon: Zap,
    price: 68.40,
    change: 0.10,
    changePct: 0.15,
    topCompanies: ['NEE', 'DUK', 'SO'],
    tradingVolume: '18.1M',
    bestPerformer: 'NEE',
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/20'
  }
];

export default function WatchlistsView({ theme = 'light', onSelectStock }: WatchlistsViewProps) {
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Market Sectors
        </h2>
        <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Real-time performance, quotes, and popular companies in each market category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => {
          const isUp = cat.changePct >= 0;
          return (
            <div 
              key={idx}
              className={`rounded-2xl p-5 border flex flex-col transition-all hover:shadow-md ${
                isLight 
                  ? 'bg-white border-blue-200/80 shadow-sm' 
                  : 'bg-[#0b0e14] border-blue-900/30'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  isUp 
                    ? (isLight ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-400 bg-emerald-500/10')
                    : (isLight ? 'text-rose-600 bg-rose-50' : 'text-rose-400 bg-rose-500/10')
                }`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? '+' : ''}{cat.changePct.toFixed(2)}%
                </div>
              </div>

              {/* Title & Price */}
              <div className="mb-4">
                <h3 className={`font-bold text-sm mb-1 ${cat.iconColor}`}>
                  {cat.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    ${cat.price.toFixed(2)}
                  </span>
                  <span className={`text-sm font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isUp ? '+' : ''}{cat.change.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Top Companies */}
              <div className="mb-6">
                <div className={`text-[10px] uppercase font-bold mb-2 tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Top Companies
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.topCompanies.map(comp => (
                    <button
                      key={comp}
                      onClick={() => onSelectStock(comp)}
                      className={`px-2 py-1 rounded-md text-xs font-bold border transition-colors ${
                        isLight 
                          ? 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50' 
                          : 'bg-[#0b0e14] border-blue-900/50 text-blue-400 hover:bg-blue-900/20'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer: Volume & Best Performer */}
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      Trading Volume
                    </div>
                    <div className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {cat.tradingVolume}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      Best Performer
                    </div>
                    <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cat.bestPerformer}
                    </div>
                  </div>
                </div>
                
                {/* Visual Bar */}
                <div className="flex gap-1 h-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full ${
                        i === 4 
                          ? (isUp ? 'bg-emerald-500' : 'bg-rose-500')
                          : (isLight ? 'bg-slate-100' : 'bg-slate-800')
                      }`} 
                    />
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
"""

with open('src/components/user/WatchlistsView.tsx', 'w') as f:
    f.write(code)
