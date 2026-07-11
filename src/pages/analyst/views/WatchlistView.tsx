import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, TrendingUp, Search, ArrowUpRight, ArrowDownRight, Layers, DollarSign, BarChart2, GitCompare } from 'lucide-react';
import { INDEXED_STOCKS } from '../../../search';
import { IndexedStock } from '../../../types';
import { AnalystTab } from '../AnalystSidebar';
import CompareStocksView from '../../../components/CompareStocksView';
import { StockLogo } from '../../../components/MultiStockGrid';

interface WatchlistViewProps {
  activeTab?: AnalystTab;
  watchlistSymbols: string[];
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  onNavigateTab: (tab: AnalystTab, stock?: IndexedStock) => void;
  liveStocks: Record<string, any>;
  theme?: 'light' | 'dark';
  workspaceCompareSymbols?: string[];
  onUpdateWorkspaceCompare?: (symbols: string[]) => void;
}

export default function WatchlistView({
  activeTab,
  watchlistSymbols,
  onAddSymbol,
  onRemoveSymbol,
  onNavigateTab,
  liveStocks,
  theme = 'dark',
  workspaceCompareSymbols,
  onUpdateWorkspaceCompare
}: WatchlistViewProps) {
  const [subTab, setSubTab] = useState<'watchlist' | 'compare'>(() => activeTab === 'compare' ? 'compare' : 'watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  useEffect(() => {
    if (activeTab === 'compare' || activeTab === 'watchlist') {
      setSubTab(activeTab === 'compare' ? 'compare' : 'watchlist');
    }
  }, [activeTab]);

  const watchedStocks = INDEXED_STOCKS.filter(s => 
    watchlistSymbols.includes(s.symbol) && (
      !watchlistSearchQuery ||
      s.symbol.toLowerCase().includes(watchlistSearchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(watchlistSearchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(watchlistSearchQuery.toLowerCase())
    )
  );
  const unwatchedStocks = INDEXED_STOCKS.filter(s => !watchlistSymbols.includes(s.symbol) && (
    !searchQuery || 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="space-y-8">
      
      {/* Page Header with Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-purple-400 fill-purple-400" />
            <span>Watchlist & Stock Comparison Portal</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal favourite stocks and run deep side-by-side SQ Platform comparisons linked to your analysis workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e131f] border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => {
              setSubTab('watchlist');
              onNavigateTab('watchlist');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'watchlist'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Watchlist ({watchlistSymbols.length})</span>
          </button>

          <button
            onClick={() => {
              setSubTab('compare');
              onNavigateTab('compare');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'compare'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Compare Stocks Tab</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: WATCHLIST */}
      {subTab === 'watchlist' && (
        <div className="space-y-8">
          {/* Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">My Favourite Stocks Watchlist</h2>
              <p className="text-xs text-slate-400 mt-1">
                Save your favourite stocks and monitor their latest prices and daily momentum in real time.
              </p>
            </div>

            {/* Quick Add Stock Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stock to Watchlist</span>
              </button>

              {showAddDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#131b2e] border border-slate-700 rounded-2xl shadow-2xl z-50 p-3">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search symbols..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {unwatchedStocks.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No remaining stocks found</p>
                    ) : (
                      unwatchedStocks.map(stock => (
                        <div
                          key={stock.symbol}
                          onClick={() => {
                            onAddSymbol(stock.symbol);
                            setShowAddDropdown(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer text-xs transition-colors group"
                        >
                          <div>
                            <span className="font-bold text-white">{stock.symbol}</span>
                            <span className="text-slate-400 block text-[10px]">{stock.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">+ Add</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar for Watchlist */}
          {watchlistSymbols.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={watchlistSearchQuery}
                onChange={(e) => setWatchlistSearchQuery(e.target.value)}
                placeholder="Search your favourite stocks by ticker symbol, company name, or sector..."
                className="w-full bg-[#131b2e] border border-slate-800 rounded-2xl pl-11 pr-10 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md"
              />
              {watchlistSearchQuery && (
                <button
                  onClick={() => setWatchlistSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Watchlist Grid */}
          {watchlistSymbols.length === 0 ? (
            <div className="bg-[#131b2e] p-16 rounded-3xl border border-slate-800/80 text-center space-y-4">
              <Star className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Add favourite companies using the button above to start tracking real-time prices and price histories.
              </p>
              <button
                onClick={() => setShowAddDropdown(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Add Your First Stock
              </button>
            </div>
          ) : watchedStocks.length === 0 ? (
            <div className="bg-[#131b2e] p-12 rounded-3xl border border-slate-800/80 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No favourite stocks found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                No stocks in your favourites match "{watchlistSearchQuery}". Try clearing your search filter.
              </p>
              <button
                onClick={() => setWatchlistSearchQuery('')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchedStocks.map((stock) => {
                const liveData = liveStocks[stock.symbol] || { price: '185.00', change: '+1.80' };
                const changeNum = parseFloat(liveData.change);
                const isPositive = changeNum >= 0;

                return (
                  <div
                    key={stock.symbol}
                    className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-lg hover:border-blue-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-4">
                          <StockLogo symbol={stock.symbol} className="w-12 h-12" />
                          <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{stock.symbol}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1">{stock.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://finance.yahoo.com/quote/${stock.symbol}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title="Open Market (Yahoo Finance)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => onRemoveSymbol(stock.symbol)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 py-4 border-y border-slate-800/80">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Latest Monitored Price:</span>
                          <span className="text-2xl font-bold text-white font-mono">${liveData.price}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Daily Momentum:</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {isPositive ? '+' : ''}{liveData.change}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Company Sector:</span>
                          <span className="text-xs font-semibold text-slate-300">{stock.sector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => onNavigateTab('analysis', stock)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-white" />
                        <span>Analyze Price History</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: COMPARE STOCKS TAB */}
      {subTab === 'compare' && (
        <div className="space-y-6">
          <CompareStocksView
            theme={theme}
            onSelectStock={(symbol) => {
              const stock = INDEXED_STOCKS.find(s => s.symbol === symbol) || INDEXED_STOCKS[0];
              onNavigateTab('analysis', stock);
            }}
            selectedSymbols={workspaceCompareSymbols || ['AAPL', 'MSFT', 'NVDA', 'TSLA']}
            onUpdateSymbols={(symbols) => {
              if (onUpdateWorkspaceCompare) onUpdateWorkspaceCompare(symbols);
            }}
            watchlistSymbols={watchlistSymbols}
            onLaunchWorkspaceCompare={(symbols) => {
              if (onUpdateWorkspaceCompare) onUpdateWorkspaceCompare(symbols);
              const firstStock = INDEXED_STOCKS.find(s => symbols[0] === s.symbol) || INDEXED_STOCKS[0];
              onNavigateTab('analysis', firstStock);
            }}
          />
        </div>
      )}

    </div>
  );
}
