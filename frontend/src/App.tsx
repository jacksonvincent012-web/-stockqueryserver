import React, { useState } from 'react';

interface StockData {
  symbol: string;
  price: number;
  volume: number;
  sector: string;
  price_history_count: number;
  gain_7d_pct: number;
}

export default function App() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Corrected from /api/stock?symbol= to matching the backend route parameter layout
      const response = await fetch(`/api/stocks/${ticker.trim().toUpperCase()}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Stock data not found or server error');
        }
        if (response.status === 401) {
          throw new Error('Authentication Required. Please bypass @require_auth in server.py for initial testing.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setStockData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Navbar Layout */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">StockQuery Portal</h1>
        <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          Backend Connected via HTTP Proxy
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Search Query Panel */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter Stock Ticker (e.g. AAPL, TSLA, NVDA)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl tracking-wide transition-colors duration-150 shadow-sm"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {/* Conditional Error Display */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl font-medium animate-fadeIn">
              <span>⚠️</span> {error}
            </div>
          )}
        </section>

        {/* Dashboard Display Area */}
        <section className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 min-h-[300px] flex flex-col justify-center items-center shadow-sm">
          {stockData ? (
            <div className="w-full text-left animate-fadeIn">
              {/* Header Metrics */}
              <div className="flex justify-between items-baseline border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stockData.symbol}</h2>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">{stockData.sector} Sector</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-slate-900">${stockData.price.toFixed(2)}</div>
                  <div className={`text-sm font-bold mt-1 ${stockData.gain_7d_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData.gain_7d_pct >= 0 ? '▲' : '▼'} {stockData.gain_7d_pct.toFixed(2)}% (7d)
                  </div>
                </div>
              </div>

              {/* Data Structure Diagnostic Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Market Volume</span>
                  <span className="text-xl font-mono font-bold text-slate-700">{stockData.volume.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Price History Depth</span>
                  <span className="text-xl font-mono font-bold text-slate-700">{stockData.price_history_count} Ticks</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-sm">
              <p className="text-slate-500 font-semibold text-base mb-1">No active ticker metrics loaded.</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Submit a stock identifier symbol above to generate historical trend analytics.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}