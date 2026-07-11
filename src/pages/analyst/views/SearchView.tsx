import React, { useState, useMemo } from 'react';
import { Search, Star, Bell, TrendingUp, ArrowRight, Layers, DollarSign } from 'lucide-react';
import { INDEXED_STOCKS } from '../../../search';
import { IndexedStock } from '../../../types';
import { AnalystTab } from '../AnalystSidebar';

interface SearchViewProps {
  onNavigateTab: (tab: AnalystTab, stock?: IndexedStock) => void;
  onAddToWatchlist: (stock: IndexedStock) => void;
  watchlistSymbols: string[];
  liveStocks: Record<string, any>;
  theme?: 'light' | 'dark';
}

export default function SearchView({
  onNavigateTab,
  onAddToWatchlist,
  watchlistSymbols,
  liveStocks,
  theme = 'dark'
}: SearchViewProps) {
  const [query, setQuery] = useState('');

  // Filter stocks instantly based on query only
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    
    return INDEXED_STOCKS.filter(stock => {
      return stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
             stock.name.toLowerCase().includes(query.toLowerCase());
    }).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [query]);

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Search & Explore Stocks</h1>
        <p className="text-sm text-slate-400 mt-1">
          Find companies by ticker symbol or company name with instant suggestions.
        </p>
      </div>

      {/* Search Input and Filters Bar */}
      <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        
        {/* Instant Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a symbol (e.g., AAPL, NVDA) or company name (e.g., Apple, Tesla)..."
            className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium shadow-inner"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

</div>
      {/* Grid of Results */}
      {(!query.trim()) ? (
        <div className="bg-[#131b2e] p-12 rounded-3xl border border-slate-800/80 text-center space-y-3">
          <Search className="w-10 h-10 text-blue-500/50 mx-auto" />
          <h3 className="text-lg font-bold text-white">Start searching</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Type a stock symbol or company name in the search bar above to begin exploring the market.
          </p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="bg-[#131b2e] p-12 rounded-3xl border border-slate-800/80 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No companies found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            We couldn't find any stocks matching your search terms Try searching for another symbol.
          </p>
          <button
            onClick={() => setQuery('')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => {
            const isWatched = watchlistSymbols.includes(stock.symbol);
            const liveData = liveStocks[stock.symbol] || { price: '165.40', change: '+1.25' };
            const changeNum = parseFloat(liveData.change);
            const isPositive = changeNum >= 0;

            return (
              <div 
                key={stock.symbol}
                className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Symbol & Sector Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0b0f19] border border-slate-700/80 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:border-blue-500/50 transition-all">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{stock.symbol}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold tracking-wide uppercase border border-slate-700/50">
                      {stock.sector}
                    </span>
                  </div>

                  {/* Price & Market Cap Info */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Simulated Price</span>
                      <span className="text-2xl font-bold text-white font-mono">${liveData.price}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block mb-0.5">Daily Change</span>
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {isPositive ? '+' : ''}{liveData.change}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex justify-between">
                    <span>Company Valuation:</span>
                    <span className="text-slate-300 font-medium">${stock.marketCap} Market Cap</span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddToWatchlist(stock)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isWatched
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#0b0f19] hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-emerald-400' : ''}`} />
                    <span>{isWatched ? 'In Watchlist' : 'Watch'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('analysis', stock)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
