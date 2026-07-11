import React from 'react';
import { TrendingUp, TrendingDown, Activity, Play, Pause, Zap } from 'lucide-react';

interface LiveTickerTapeProps {
  liveStocks: Record<string, any>;
  onSelectStock: (symbol: string) => void;
}

const DEFAULT_TICKERS = [
  { symbol: 'SPY', price: '548.20', change: '+0.84', pe: '22.4' },
  { symbol: 'QQQ', price: '482.15', change: '+1.42', pe: '28.1' },
  { symbol: 'SMH', price: '264.80', change: '+3.15', pe: '31.5' },
  { symbol: 'AAPL', price: '195.40', change: '+1.24', pe: '29.2' },
  { symbol: 'MSFT', price: '442.80', change: '+0.85', pe: '35.1' },
  { symbol: 'NVDA', price: '128.50', change: '+3.42', pe: '42.8' },
  { symbol: 'TSLA', price: '215.30', change: '-1.85', pe: '64.2' },
  { symbol: 'GOOGL', price: '178.90', change: '+0.64', pe: '25.3' },
  { symbol: 'AMZN', price: '188.40', change: '+1.15', pe: '40.1' },
  { symbol: 'META', price: '498.20', change: '+2.10', pe: '28.7' },
  { symbol: 'BRK.A', price: '615400.00', change: '+0.15', pe: '19.8' },
  { symbol: 'BTC', price: '64200.00', change: '+4.10', pe: 'N/A' },
  { symbol: 'ETH', price: '3480.00', change: '+2.80', pe: 'N/A' },
  { symbol: 'XLE', price: '91.30', change: '-0.64', pe: '11.2' },
  { symbol: 'XLF', price: '41.90', change: '-0.21', pe: '14.5' }
];

export default function LiveTickerTape({ liveStocks, onSelectStock }: LiveTickerTapeProps) {
  const [isPaused, setIsPaused] = React.useState(false);

  // Combine live quote data with default fallback values
  const tapeItems = DEFAULT_TICKERS.map(item => {
    const live = liveStocks[item.symbol];
    if (live) {
      return {
        symbol: item.symbol,
        price: live.price || item.price,
        change: live.change || item.change
      };
    }
    return item;
  });

  // Duplicate items for seamless continuous marquee loop
  const displayList = [...tapeItems, ...tapeItems, ...tapeItems];

  return (
    <div className="bg-[#0b0e14] border-b border-slate-800/80 px-4 py-2 flex items-center gap-3 overflow-hidden select-none shadow-sm z-30 relative">
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-800/80">
        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800/80">
          <Zap className="w-3 h-3 animate-pulse text-blue-400" />
          <span>LIVE MARKET TAPE</span>
        </span>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          title={isPaused ? "Resume Ticker" : "Pause Ticker"}
        >
          {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div 
          className={`flex items-center gap-6 whitespace-nowrap transition-all ${isPaused ? '' : 'animate-marquee'}`}
          style={{
            animation: isPaused ? 'none' : 'marquee 45s linear infinite'
          }}
        >
          {displayList.map((item, idx) => {
            const numChange = parseFloat(item.change);
            const isPositive = numChange >= 0;
            return (
              <div
                key={`${item.symbol}-${idx}`}
                onClick={() => onSelectStock(item.symbol)}
                className="inline-flex items-center gap-2 cursor-pointer hover:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-800 transition-all font-mono text-xs shrink-0 group"
              >
                <span className="font-bold text-white group-hover:text-slate-300 transition-colors">{item.symbol}</span>
                <span className="text-slate-300 font-semibold">${item.price}</span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? `+${item.change}%` : `${item.change}%`}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
