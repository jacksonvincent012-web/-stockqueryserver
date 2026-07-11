import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, TrendingUp, PieChart, Info, DollarSign, Activity, Star, Search } from 'lucide-react';
import { INDEXED_STOCKS, SECTORS } from '../../../search';
import { IndexedStock } from '../../../types';
import { AnalystTab } from '../AnalystSidebar';

interface SectorsViewProps {
  onNavigateTab: (tab: AnalystTab, stock?: IndexedStock) => void;
  onAddToWatchlist: (stock: IndexedStock) => void;
  watchlistSymbols: string[];
  liveStocks: Record<string, any>;
  resetKey?: number;
  theme?: 'light' | 'dark';
}

const SECTOR_INFO: Record<string, { desc: string; cap: string; color: string; bg: string }> = {
  'Technology': {
    desc: 'Companies that design microchips, software, computers, cloud servers, and artificial intelligence.',
    cap: '$14.2 Trillion',
    color: 'text-blue-400',
    bg: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30'
  },
  'Healthcare': {
    desc: 'Medical device manufacturers, pharmaceutical labs, hospitals, and biotech research firms.',
    cap: '$3.8 Trillion',
    color: 'text-emerald-400',
    bg: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30'
  },
  'Banking': {
    desc: 'Major consumer banks, lending institutions, credit providers, and investment advisors.',
    cap: '$2.9 Trillion',
    color: 'text-purple-400',
    bg: 'from-purple-600/20 to-pink-600/20 border-purple-500/30'
  },
  'Finance': {
    desc: 'Payment processors, credit card networks, insurance providers, and asset managers.',
    cap: '$2.1 Trillion',
    color: 'text-amber-400',
    bg: 'from-amber-600/20 to-orange-600/20 border-amber-500/30'
  },
  'Crypto': {
    desc: 'Digital currencies, blockchain networks, decentralized finance protocols, and tokens.',
    cap: '$1.8 Trillion',
    color: 'text-cyan-400',
    bg: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30'
  },
  'Energy': {
    desc: 'Oil exploration companies, natural gas producers, refineries, and renewable solar/wind energy.',
    cap: '$1.5 Trillion',
    color: 'text-rose-400',
    bg: 'from-rose-600/20 to-red-600/20 border-rose-500/30'
  },
  'ETFs': {
    desc: 'Exchange Traded Funds that bundle hundreds of individual stocks into a single diversified investment.',
    cap: '$4.5 Trillion',
    color: 'text-teal-400',
    bg: 'from-teal-600/20 to-emerald-600/20 border-teal-500/30'
  }
};

export default function SectorsView({
  onNavigateTab,
  onAddToWatchlist,
  watchlistSymbols,
  liveStocks,
  resetKey,
  theme = 'dark'
}: SectorsViewProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sectorSearchQuery, setSectorSearchQuery] = useState<string>('');

  useEffect(() => {
    if (resetKey !== undefined && resetKey > 0) {
      setSelectedSector(null);
      setSectorSearchQuery('');
    }
  }, [resetKey]);
  
  const activeSector = selectedSector || 'Technology';
  const allSectorStocks = INDEXED_STOCKS.filter(s => s.sector === activeSector);
  const sectorStocks = allSectorStocks.filter(s =>
    !sectorSearchQuery ||
    s.symbol.toLowerCase().includes(sectorSearchQuery.trim().toLowerCase()) ||
    s.name.toLowerCase().includes(sectorSearchQuery.trim().toLowerCase())
  );
  const currentSectorInfo = SECTOR_INFO[activeSector] || {
    desc: 'General market sector grouping related business entities.',
    cap: '$1.0 Trillion',
    color: 'text-blue-400',
    bg: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30'
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Sector Map & Exploration</h1>
          <p className="text-sm text-slate-400 mt-1">
            {selectedSector ? `Exploring ${selectedSector} Sector • Search only within ${selectedSector} items` : 'Explore how the stock market is divided into major industry groups. Select a sector to see related companies.'}
          </p>
        </div>
        {selectedSector && (
          <button
            onClick={() => { setSelectedSector(null); setSectorSearchQuery(''); }}
            className="px-4 py-2.5 rounded-2xl bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0"
          >
            <span>← Back to All Sectors</span>
          </button>
        )}
      </div>

      {/* Visual Sector Map Grid - Disappears when a sector is selected! */}
      {!selectedSector ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(SECTOR_INFO).map((secName) => {
            const info = SECTOR_INFO[secName];
            const count = INDEXED_STOCKS.filter(s => s.sector === secName).length;

            return (
              <div
                key={secName}
                onClick={() => { setSelectedSector(secName); setSectorSearchQuery(''); }}
                className={`p-5 rounded-3xl border transition-all cursor-pointer bg-gradient-to-br ${info.bg} bg-[#131b2e]/80 hover:bg-[#131b2e] opacity-90 hover:opacity-100 hover:scale-[1.02] hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-base text-white">{secName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                    {count} {count === 1 ? 'Stock' : 'Stocks'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4 h-8">{info.desc}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Total Valuation:</span>
                  <span className={`font-mono font-bold ${info.color}`}>{info.cap}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dedicated Sector Search Engine Box covering the place of sector containers */
        <div className="space-y-6">
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-blue-500/50 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-[#0b0f19] border border-slate-700 ${currentSectorInfo.color}`}>
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedSector} Sector Search Engine</span>
                    <span className="text-xs font-normal text-slate-400 font-mono">({allSectorStocks.length} stocks in sector)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentSectorInfo.desc}</p>
                </div>
              </div>
              <div className="bg-[#0b0f19] px-4 py-2 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Sector Valuation</span>
                <span className={`text-sm font-bold font-mono ${currentSectorInfo.color}`}>{currentSectorInfo.cap}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  value={sectorSearchQuery}
                  onChange={(e) => setSectorSearchQuery(e.target.value)}
                  placeholder={`Search strictly within ${selectedSector} stocks by ticker symbol or name...`}
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-2xl pl-10 pr-9 py-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-medium"
                />
                {sectorSearchQuery && (
                  <button
                    onClick={() => setSectorSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-400 shrink-0 font-medium px-2 flex items-center gap-2">
                {!sectorSearchQuery.trim() ? (
                  <span className="text-amber-400/90 font-mono text-[11px] bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Type to filter {selectedSector} items
                  </span>
                ) : (
                  <span className="bg-[#0b0f19] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
                    Showing <strong className="text-white">{sectorStocks.length}</strong> of <strong className="text-white">{allSectorStocks.length}</strong> {selectedSector} stocks
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Selected Sector Deep Dive Section */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {selectedSector} Equities Directory
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Showing {sectorStocks.length} available items
              </span>
            </div>



        {/* Company Cards inside this sector or Search Prompt */}
        {!sectorSearchQuery.trim() ? (
          <div className="bg-[#0b0f19] p-8 rounded-3xl border border-slate-800/80 text-center space-y-3 shadow-xl max-w-md mx-auto my-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Search {selectedSector} Stocks</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter a symbol or name above to search {allSectorStocks.length} available stocks.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500 font-medium mr-1">Quick Select:</span>
              {allSectorStocks.slice(0, 6).map(s => (
                <button
                  key={s.symbol}
                  onClick={() => setSectorSearchQuery(s.symbol)}
                  className="px-2.5 py-1 rounded-xl bg-[#131b2e] hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-sm hover:border-blue-500/40"
                >
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>
        ) : sectorStocks.length === 0 ? (
          <div className="bg-[#0b0f19] p-12 rounded-2xl border border-slate-800 text-center space-y-3 shadow-xl">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No stocks found in {selectedSector}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No stocks match "{sectorSearchQuery}". Try searching another symbol or name.
            </p>
            <button
              onClick={() => setSectorSearchQuery('')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <span>Showing <strong className="text-white font-mono">{sectorStocks.length}</strong> matching {sectorStocks.length === 1 ? 'stock' : 'stocks'} in <strong className="text-white">{selectedSector}</strong></span>
              {sectorSearchQuery && (
                <button
                  onClick={() => setSectorSearchQuery('')}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectorStocks.map((stock) => {
            const isWatched = watchlistSymbols.includes(stock.symbol);
            const liveData = liveStocks[stock.symbol] || { price: '175.20', change: '+1.45' };
            const changeNum = parseFloat(liveData.change);
            const isPositive = changeNum >= 0;

            return (
              <div 
                key={stock.symbol}
                className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-base shadow">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      ${stock.marketCap} Cap
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Latest Price</span>
                      <span className="text-xl font-bold text-white font-mono">${liveData.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Daily Momentum</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {isPositive ? '+' : ''}{liveData.change}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddToWatchlist(stock)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isWatched
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-emerald-400' : ''}`} />
                    <span>{isWatched ? 'Watched' : 'Watch'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('analysis', stock)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Price History</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
}
