import React, { useState } from 'react';
import { Eye, EyeOff, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketStatsGridProps {
  theme: 'light' | 'dark';
  stats: {
    open: number | string;
    high: number | string;
    low: number | string;
    close: number | string;
    prevClose: number | string;
    volume: string;
    avgVolume: string;
    weekHigh52: number | string;
    weekLow52: number | string;
  };
}

export default function MarketStatsGrid({ theme, stats }: MarketStatsGridProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isLight = theme === 'light';

  const items = [
    { label: 'Open', value: typeof stats.open === 'number' ? `$${stats.open.toFixed(2)}` : stats.open, color: 'default' },
    { label: 'High', value: typeof stats.high === 'number' ? `$${stats.high.toFixed(2)}` : stats.high, color: 'green' },
    { label: 'Low', value: typeof stats.low === 'number' ? `$${stats.low.toFixed(2)}` : stats.low, color: 'red' },
    { label: 'Prev Close', value: typeof stats.prevClose === 'number' ? `$${stats.prevClose.toFixed(2)}` : stats.prevClose, color: 'default' },
    { label: 'Volume', value: stats.volume, color: 'default' },
    { label: 'Avg Volume', value: stats.avgVolume, color: 'default' },
    { label: '52W High', value: typeof stats.weekHigh52 === 'number' ? `$${stats.weekHigh52.toFixed(2)}` : stats.weekHigh52, color: 'default' },
    { label: '52W Low', value: typeof stats.weekLow52 === 'number' ? `$${stats.weekLow52.toFixed(2)}` : stats.weekLow52, color: 'default' },
  ];

  return (
    <div className="w-full mt-4">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Key Market Statistics & Summary
          </h4>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isVisible ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Panel</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Show Stats Grid</span>
            </>
          )}
        </button>
      </div>

      {/* Cards Grid */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.label}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors shadow-2xs ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300'
                      : 'bg-[#0e121a]/90 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  <span
                    className={`text-base font-extrabold font-mono tracking-tight mt-1.5 ${
                      item.color === 'green'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.color === 'red'
                        ? 'text-rose-600 dark:text-rose-400'
                        : isLight
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  >
                    {item.value || '---'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
