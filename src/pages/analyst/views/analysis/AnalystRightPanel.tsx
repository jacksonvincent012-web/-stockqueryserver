import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  List,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Trash2
} from 'lucide-react';

interface AnalystRightPanelProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  watchlistSymbols?: string[];
  onAddToWatchlist?: (symbol: string) => void;
  onRemoveFromWatchlist?: (symbol: string) => void;
  onNavigateTab?: (tab: any) => void;
  liveStocks?: Record<string, any>;
  theme?: 'light' | 'dark';
}

export default function AnalystRightPanel({
  currentSymbol,
  onSelectSymbol,
  watchlistSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BTCUSD'],
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onNavigateTab,
  liveStocks = {},
  theme = 'dark'
}: AnalystRightPanelProps) {
  const isLight = theme === 'light';
  const [newWatchSym, setNewWatchSym] = useState('');

  // Dynamic values based on symbol
  const stockInfo = useMemo(() => {
    const live = liveStocks[currentSymbol] || {};
    const price = live.price || (currentSymbol === 'NVDA' ? 128.76 : currentSymbol === 'MSFT' ? 442.53 : 163.88);
    const change = live.change || 2.34;
    const changePercent = live.changePercent || 1.45;
    return {
      price: typeof price === 'number' ? price.toFixed(2) : price,
      change: typeof change === 'number' ? change.toFixed(2) : change,
      changePercent: typeof changePercent === 'number' ? changePercent.toFixed(2) : changePercent,
      isUp: (typeof change === 'number' && change >= 0) || (typeof change === 'string' && !change.startsWith('-'))
    };
  }, [currentSymbol, liveStocks]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Watchlist Switcher Card */}
      <div className={`p-4 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-800/60">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-xs uppercase tracking-wider">Watchlist Switcher</span>
          </div>
          {onNavigateTab ? (
            <button
              onClick={() => onNavigateTab('watchlist')}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-bold font-sans cursor-pointer hover:underline"
            >
              Open Full Watchlist &rarr;
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">Click to Load</span>
          )}
        </div>

        {onAddToWatchlist && (
          <div className="flex gap-2 mb-2.5">
            <input
              type="text"
              placeholder="Add ticker..."
              value={newWatchSym}
              onChange={(e) => setNewWatchSym(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newWatchSym.trim()) {
                  onAddToWatchlist(newWatchSym.trim().toUpperCase());
                  setNewWatchSym('');
                }
              }}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-white outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (newWatchSym.trim()) {
                  onAddToWatchlist(newWatchSym.trim().toUpperCase());
                  setNewWatchSym('');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {watchlistSymbols.map((sym) => {
            const isSelected = sym === currentSymbol;
            const live = liveStocks[sym] || {};
            const pr = live.price || (sym === 'NVDA' ? 128.76 : sym === 'MSFT' ? 442.53 : sym === 'BTCUSD' ? 67245.80 : 163.88);
            const chgPercent = live.changePercent || (sym === 'AMZN' ? -0.65 : 1.45);
            const isUp = chgPercent >= 0;

            return (
              <div
                key={sym}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all group ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div
                  onClick={() => onSelectSymbol(sym)}
                  className="flex items-center gap-2 flex-1 cursor-pointer py-0.5"
                >
                  <span>{sym}</span>
                  {isSelected && <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 text-white">Active</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onSelectSymbol(sym)}
                    className="flex items-center gap-3 cursor-pointer py-0.5"
                  >
                    <span>${typeof pr === 'number' ? pr.toFixed(2) : pr}</span>
                    <span className={`flex items-center gap-0.5 font-bold ${
                      isSelected ? 'text-white' : isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isUp ? '+' : ''}{typeof chgPercent === 'number' ? chgPercent.toFixed(2) : chgPercent}%
                    </span>
                  </div>
                  {onRemoveFromWatchlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(sym);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Key Statistics Card */}
      <div className={`p-4 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-800/60">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs uppercase tracking-wider">Key Statistics</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SQ Platform Feed</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Open</span>
            <span className="font-bold">$161.50</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Day High</span>
            <span className="font-bold text-emerald-400">$164.10</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Day Low</span>
            <span className="font-bold text-rose-400">$161.00</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">52W High</span>
            <span className="font-bold">$199.62</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">52W Low</span>
            <span className="font-bold">$124.17</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Avg Volume</span>
            <span className="font-bold">48.32M</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Beta (5Y)</span>
            <span className="font-bold">1.25</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">EPS (TTM)</span>
            <span className="font-bold">$6.19</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">P/E Ratio</span>
            <span className="font-bold">26.42</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span className="text-slate-400">Div Yield</span>
            <span className="font-bold">0.51%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
