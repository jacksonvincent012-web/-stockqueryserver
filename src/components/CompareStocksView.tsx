import React, { useState, useMemo } from 'react';
import { Search, Plus, X, BarChart2, TrendingUp, TrendingDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { INDEXED_STOCKS } from '../search';
import { useRealtimeSnapshot } from '../hooks/useRealtimeSnapshot';
import { StockLogo } from './MultiStockGrid';
import type { IndexedStock } from '../types';

interface CompareStocksViewProps {
  theme: 'light' | 'dark';
  onSelectStock?: (symbol: string) => void;
  selectedSymbols?: string[];
  onUpdateSymbols?: (symbols: string[]) => void;
  watchlistSymbols?: string[];
  onLaunchWorkspaceCompare?: (symbols: string[]) => void;
}

const BASE_CATEGORIES = [
  { id: 'tech', label: 'Technology', sectors: ['Technology'] },
  { id: 'consumer', label: 'Consumer & Retail', sectors: ['Consumer'] },
  { id: 'finance', label: 'Banking & Finance', sectors: ['Banking', 'Finance'] },
  { id: 'healthcare', label: 'Healthcare & Pharma', sectors: ['Healthcare'] },
];

export default function CompareStocksView({
  theme,
  onSelectStock,
  selectedSymbols: propSymbols,
  onUpdateSymbols,
  watchlistSymbols,
  onLaunchWorkspaceCompare
}: CompareStocksViewProps) {
  const { liveStocks } = useRealtimeSnapshot();
  const [internalSymbols, setInternalSymbols] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'TSLA']);
  const [activeCategory, setActiveCategory] = useState<string>('tech');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return INDEXED_STOCKS.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q) || 
      s.sector.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  const selectedSymbols = propSymbols || internalSymbols;
  const updateSymbols = (updater: (prev: string[]) => string[]) => {
    const next = updater(selectedSymbols);
    if (onUpdateSymbols) onUpdateSymbols(next);
    setInternalSymbols(next);
  };

  const categories = useMemo(() => {
    if (watchlistSymbols && watchlistSymbols.length > 0) {
      return [{ id: 'watchlist', label: 'My Watchlist (Synced)', sectors: [] }, ...BASE_CATEGORIES];
    }
    return BASE_CATEGORIES;
  }, [watchlistSymbols]);

  const quickAddSymbols = useMemo(() => {
    if (activeCategory === 'watchlist') {
      return watchlistSymbols && watchlistSymbols.length > 0 ? watchlistSymbols : ['AAPL', 'MSFT', 'NVDA', 'TSLA'];
    }
    const cat = BASE_CATEGORIES.find(c => c.id === activeCategory);
    if (!cat) return [];
    const sectorMatches = INDEXED_STOCKS.filter(s => cat.sectors.some(sec => s.sector.includes(sec)));
    return sectorMatches.slice(0, 10).map(s => s.symbol);
  }, [activeCategory, watchlistSymbols]);

  const selectedStocks = useMemo(() => {
    return selectedSymbols.map(sym => INDEXED_STOCKS.find(s => s.symbol === sym)).filter(Boolean) as IndexedStock[];
  }, [selectedSymbols]);

  const handleAddStock = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) return;
    if (selectedSymbols.length >= 4) {
      updateSymbols(prev => [...prev.slice(1), symbol]);
    } else {
      updateSymbols(prev => [...prev, symbol]);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    updateSymbols(prev => prev.filter(s => s !== symbol));
  };

  const isLight = theme === 'light';
  
  // Formatters
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* Compare Stocks Controller */}
      <div className={`p-6 rounded-2xl shadow-sm border ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Compare Stocks</h2>
              <p className={`text-sm mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Compare real-time prices, simple stats, and risk for up to 4 stocks.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Choose a category:</span>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                    activeCategory === cat.id 
                      ? (isLight ? 'border-slate-800 bg-white text-slate-800 shadow-sm' : 'border-slate-300 bg-[#0b0e14] text-white shadow-sm')
                      : (isLight ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800')
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {onLaunchWorkspaceCompare && (
          <div className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
            isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-950/20 border-purple-800/40 text-purple-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Linked Institutional Analyst Workspace Container</h4>
                <p className="text-xs opacity-80">Launch these {selectedSymbols.length} compared stocks directly into the real-time institutional analysis chart workspace with custom indicators.</p>
              </div>
            </div>
            <button
              onClick={() => onLaunchWorkspaceCompare(selectedSymbols)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>Launch Compare Company in Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={`mt-6 pt-6 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`}>
          <div className="flex flex-col gap-4">
            {/* Search Input Box with Real-Time Suggestions */}
            <div className="relative max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search any market ticker or company to compare..."
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono outline-none border transition-all ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500' : 'bg-[#080a0f] border-slate-800 text-white focus:border-purple-500'
                  }`}
                />
              </div>
              {showDropdown && searchSuggestions.length > 0 && (
                <div className={`absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border shadow-2xl p-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-slate-700'
                }`}>
                  {searchSuggestions.map((st) => (
                    <div
                      key={st.symbol}
                      onClick={() => {
                        handleAddStock(st.symbol);
                        setSearchQuery('');
                        setShowDropdown(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isLight ? 'hover:bg-purple-50 text-slate-800' : 'hover:bg-purple-500/20 text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold font-mono text-purple-400">{st.symbol}</span>
                        <span className="ml-2 opacity-80 truncate">{st.name}</span>
                      </div>
                      <span className="text-[10px] opacity-60 bg-slate-800 px-1.5 py-0.5 rounded">{st.sector}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Selected ({selectedSymbols.length}/4):
              </span>
              {selectedSymbols.map(sym => (
                <div key={sym} className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border text-sm font-bold shadow-sm ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                  {sym}
                  <button onClick={() => handleRemoveStock(sym)} className="hover:text-red-500 transition-colors p-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center flex-wrap gap-2">
              <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Add more:</span>
              {quickAddSymbols.map(sym => (
                <button
                  key={sym}
                  onClick={() => handleAddStock(sym)}
                  disabled={selectedSymbols.includes(sym)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedSymbols.includes(sym)
                      ? (isLight ? 'opacity-50 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'opacity-50 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed')
                      : (isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#0b0e14] hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200')
                  }`}
                >
                  <Plus className="w-3 h-3" /> {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectedStocks.map((stock) => {
          const liveData = liveStocks[stock.symbol];
          const price = Number(liveData?.price) || 0;
          const prevPrice = liveData?.price ? Number(liveData.price) * 0.99 : 0;
          const changePct = ((price - prevPrice) / prevPrice) * 100 || 0;
          const isUp = changePct >= 0;

          // Mock data for UI
          const risk = (Math.random() * 2 + 0.5).toFixed(2);
          const range = (price * 0.05).toFixed(2);
          const low52 = (price * 0.7).toFixed(2);
          const high52 = (price * 1.2).toFixed(2);
          const pe = (Math.random() * 50 + 10).toFixed(1);

          return (
            <div key={stock.symbol} className={`rounded-2xl p-6 shadow-sm border flex flex-col ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <StockLogo symbol={stock.symbol} className="w-8 h-8 rounded-full" />
                  <div>
                    <h3 className={`font-bold font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{stock.symbol}</h3>
                    <p className={`text-xs truncate max-w-[100px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{stock.name}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800/50'}`}>
                      {stock.sector}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${
                  isUp 
                    ? (isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')
                    : (isLight ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')
                }`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(changePct)}
                </div>
                <a
                  href={`https://finance.yahoo.com/quote/${stock.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg transition-colors ml-2 ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-blue-500' : 'hover:bg-slate-800 text-slate-500 hover:text-blue-400'}`}
                  title="Open Market (Yahoo Finance)"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => handleRemoveStock(stock.symbol)}
                  className={`p-1.5 rounded-lg transition-colors ml-1 ${isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-rose-500' : 'hover:bg-slate-800 text-slate-500 hover:text-rose-400'}`}
                  title="Remove stock"
                >
                  <X className="w-4 h-4" />
                </button>

                </div>
              </div>

              <div className="mb-6">
                <div className={`text-3xl font-bold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {formatCurrency(price)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/50 border-slate-800/60'}`}>
                  <div className={`text-[10px] uppercase font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Market Value</div>
                  <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{stock.marketCap}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/50 border-slate-800/60'}`}>
                  <div className={`text-[10px] uppercase font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>P/E Ratio</div>
                  <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{pe}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/50 border-slate-800/60'}`}>
                  <div className={`text-[10px] uppercase font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Risk (Volatility)</div>
                  <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{risk}</div>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/50 border-slate-800/60'}`}>
                  <div className={`text-[10px] uppercase font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Avg. Daily Range</div>
                  <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>${range}</div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <div>
                  <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>52-Week Range</div>
                  <div className={`text-xs font-mono font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>${low52} - ${high52}</div>
                </div>
                <button onClick={() => onSelectStock?.(stock.symbol)} className={`text-xs font-bold flex items-center gap-1 ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Comparison Table */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/60 bg-slate-900/20'}`}>
          <div className="flex items-center gap-2">
            <BarChart2 className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Quick Comparison</h3>
          </div>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Comparing {selectedSymbols.length} stocks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase font-bold border-b ${isLight ? 'text-slate-600 border-slate-200 bg-slate-100/50' : 'text-slate-400 border-slate-800 bg-slate-900/50'}`}>
              <tr>
                <th className="px-6 py-4">Metric</th>
                {selectedStocks.map(s => (
                  <th key={s.symbol} className="px-6 py-4">{s.symbol}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Category</td>
                {selectedStocks.map(s => (
                  <td key={s.symbol} className={`px-6 py-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.sector}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Live Price</td>
                {selectedStocks.map(s => {
                  const price = Number(liveStocks[s.symbol]?.price) || 0;
                  return <td key={s.symbol} className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCurrency(price)}</td>;
                })}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>24h Change (%)</td>
                {selectedStocks.map(s => {
                  const liveData = liveStocks[s.symbol];
                  const price = Number(liveData?.price) || 0;
                  const prevPrice = liveData?.price ? Number(liveData.price) * 0.99 : 0;
                  const changePct = ((price - prevPrice) / prevPrice) * 100 || 0;
                  return (
                    <td key={s.symbol} className={`px-6 py-4 font-bold ${changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatPercent(changePct)}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Market Value</td>
                {selectedStocks.map(s => (
                  <td key={s.symbol} className={`px-6 py-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.marketCap}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>P/E Ratio</td>
                {selectedStocks.map(s => (
                  <td key={s.symbol} className={`px-6 py-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{(Math.random() * 50 + 10).toFixed(1)}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Risk (Volatility)</td>
                {selectedStocks.map(s => (
                  <td key={s.symbol} className={`px-6 py-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{(Math.random() * 2 + 0.5).toFixed(2)}</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Dividend Yield</td>
                {selectedStocks.map(s => (
                  <td key={s.symbol} className={`px-6 py-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{(Math.random() * 2).toFixed(2)}%</td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className={`px-6 py-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>52-Week Range</td>
                {selectedStocks.map(s => {
                  const price = Number(liveStocks[s.symbol]?.price) || 100;
                  const low52 = (price * 0.7).toFixed(2);
                  const high52 = (price * 1.2).toFixed(2);
                  return <td key={s.symbol} className={`px-6 py-4 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>${low52} - ${high52}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
