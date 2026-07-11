import React, { useState } from 'react';
import { Columns, Plus, X, TrendingUp, TrendingDown, Check, Zap, BarChart2, ArrowRight, ShieldCheck } from 'lucide-react';
import type { IndexedStock } from '../types';
import { INDEXED_STOCKS } from '../search';

interface MultiStockGridProps {
  onSelectStock: (stock: IndexedStock) => void;
  liveStocks?: Record<string, any>;
}

const AVAILABLE_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'SPY', 'V', 'JPM', 'XOM', 'CVX', 'BRK.A', 'JNJ', 'UNH'];

const STOCK_METADATA: Record<string, any> = {
  AAPL: { 
    name: 'Apple Inc.', 
    category: 'Technology', 
    badgeCategory: 'Technology', 
    pe: '29.2', 
    beta: '1.24', 
    high52: '$199.62', 
    low52: '$164.08', 
    yield: '0.52%', 
    mcap: '$3.02T', 
    eps: '$6.58', 
    range: '$6.28', 
    defaultPrice: '452.45', 
    defaultChange: '+0.62', 
    sector: 'Technology Sector' 
  },
  MSFT: { 
    name: 'Microsoft Corp.', 
    category: 'Technology', 
    badgeCategory: 'Technology', 
    pe: '35.1', 
    beta: '0.90', 
    high52: '$430.94', 
    low52: '$309.45', 
    yield: '0.68%', 
    mcap: '$2.38T', 
    eps: '$11.80', 
    range: '$11.80', 
    defaultPrice: '318.44', 
    defaultChange: '-2.08', 
    sector: 'Technology Sector' 
  },
  NVDA: { 
    name: 'NVIDIA Corp.', 
    category: 'Technology', 
    badgeCategory: 'Technology', 
    pe: '42.0', 
    beta: '1.68', 
    high52: '$140.76', 
    low52: '$39.23', 
    yield: '0.03%', 
    mcap: '$3.15T', 
    eps: '$2.98', 
    range: '$2.98', 
    defaultPrice: '137.93', 
    defaultChange: '+2.88', 
    sector: 'Technology Sector' 
  },
  TSLA: { 
    name: 'Tesla Inc.', 
    category: 'Consumer', 
    badgeCategory: 'Consumer Discretionary', 
    pe: '64.2', 
    beta: '2.31', 
    high52: '$271.00', 
    low52: '$138.80', 
    yield: '0.00%', 
    mcap: '$880.48B', 
    eps: '$3.12', 
    range: '$3.12', 
    defaultPrice: '276.84', 
    defaultChange: '+1.90', 
    sector: 'Consumer Discretionary' 
  },
  GOOGL: { 
    name: 'Alphabet Inc.', 
    category: 'Technology', 
    badgeCategory: 'Technology', 
    pe: '25.3', 
    beta: '1.05', 
    high52: '$180.50', 
    low52: '$115.83', 
    yield: '0.45%', 
    mcap: '$2.24T', 
    eps: '$6.90', 
    range: '$4.85', 
    defaultPrice: '178.35', 
    defaultChange: '+1.42', 
    sector: 'Communication Services' 
  },
  AMZN: { 
    name: 'Amazon.com Inc.', 
    category: 'Consumer', 
    badgeCategory: 'Consumer Retail', 
    pe: '40.1', 
    beta: '1.18', 
    high52: '$191.70', 
    low52: '$118.35', 
    yield: '0.00%', 
    mcap: '$1.98T', 
    eps: '$4.65', 
    range: '$5.40', 
    defaultPrice: '186.50', 
    defaultChange: '+0.85', 
    sector: 'Consumer Discretionary' 
  },
  META: { 
    name: 'Meta Platforms Inc.', 
    category: 'Technology', 
    badgeCategory: 'Communication', 
    pe: '28.7', 
    beta: '1.35', 
    high52: '$531.49', 
    low52: '$274.38', 
    yield: '0.40%', 
    mcap: '$1.26T', 
    eps: '$17.40', 
    range: '$9.15', 
    defaultPrice: '508.20', 
    defaultChange: '-1.15', 
    sector: 'Communication Services' 
  },
  SPY: { 
    name: 'SPDR S&P 500 ETF Trust', 
    category: 'Index Fund', 
    badgeCategory: 'Market Index', 
    pe: '24.5', 
    beta: '1.00', 
    high52: '$565.16', 
    low52: '$435.00', 
    yield: '1.25%', 
    mcap: '$580.2B', 
    eps: '$18.50', 
    range: '$4.15', 
    defaultPrice: '558.40', 
    defaultChange: '+0.45', 
    sector: 'Index Fund' 
  },
  'BRK.A': { 
    name: 'Berkshire Hathaway Inc.', 
    category: 'Finance', 
    badgeCategory: 'Banking & Finance', 
    pe: '19.8', 
    beta: '0.85', 
    high52: '$647000', 
    low52: '$501000', 
    yield: '0.00%', 
    mcap: '$890.1B', 
    eps: '$31200', 
    range: '$4200', 
    defaultPrice: '615400.00', 
    defaultChange: '+0.30', 
    sector: 'Financials & Banking' 
  },
  JPM: { 
    name: 'JPMorgan Chase & Co.', 
    category: 'Finance', 
    badgeCategory: 'Banking & Finance', 
    pe: '12.4', 
    beta: '1.10', 
    high52: '$205.88', 
    low52: '$138.10', 
    yield: '2.25%', 
    mcap: '$580.4B', 
    eps: '$16.20', 
    range: '$3.40', 
    defaultPrice: '198.60', 
    defaultChange: '+1.12', 
    sector: 'Financials & Banking' 
  },
  V: { 
    name: 'Visa Inc.', 
    category: 'Finance', 
    badgeCategory: 'Financial Services', 
    pe: '30.5', 
    beta: '0.95', 
    high52: '$290.96', 
    low52: '$228.00', 
    yield: '0.75%', 
    mcap: '$560.8B', 
    eps: '$9.10', 
    range: '$3.80', 
    defaultPrice: '275.10', 
    defaultChange: '-0.40', 
    sector: 'Financials & Banking' 
  },
  JNJ: { 
    name: 'Johnson & Johnson', 
    category: 'Healthcare', 
    badgeCategory: 'Healthcare & Pharma', 
    pe: '15.2', 
    beta: '0.55', 
    high52: '$168.00', 
    low52: '$143.10', 
    yield: '3.10%', 
    mcap: '$380.2B', 
    eps: '$9.80', 
    range: '$2.10', 
    defaultPrice: '152.40', 
    defaultChange: '+0.35', 
    sector: 'Healthcare Sector' 
  },
  UNH: { 
    name: 'UnitedHealth Group Inc.', 
    category: 'Healthcare', 
    badgeCategory: 'Healthcare & Pharma', 
    pe: '21.4', 
    beta: '0.65', 
    high52: '$554.70', 
    low52: '$445.00', 
    yield: '1.50%', 
    mcap: '$450.6B', 
    eps: '$25.10', 
    range: '$7.40', 
    defaultPrice: '498.20', 
    defaultChange: '-0.65', 
    sector: 'Healthcare Sector' 
  },
  XOM: { 
    name: 'Exxon Mobil Corp.', 
    category: 'Energy', 
    badgeCategory: 'Energy Sector', 
    pe: '11.8', 
    beta: '0.95', 
    high52: '$123.75', 
    low52: '$95.50', 
    yield: '3.30%', 
    mcap: '$440.1B', 
    eps: '$9.60', 
    range: '$2.80', 
    defaultPrice: '114.30', 
    defaultChange: '+1.05', 
    sector: 'Energy Sector' 
  },
  CVX: { 
    name: 'Chevron Corporation', 
    category: 'Energy', 
    badgeCategory: 'Energy Sector', 
    pe: '13.1', 
    beta: '0.90', 
    high52: '$167.11', 
    low52: '$139.00', 
    yield: '4.10%', 
    mcap: '$300.5B', 
    eps: '$11.80', 
    range: '$3.10', 
    defaultPrice: '156.80', 
    defaultChange: '+0.70', 
    sector: 'Energy Sector' 
  }
};

// Component for rendering stylized brand logos/icons matching screenshot
export function StockLogo({ symbol, className = '' }: { symbol: string, className?: string }) {
  switch (symbol) {
    case 'AAPL':
      return (
        <div className={`w-11 h-11 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-sm ${className}`}>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.64-.78 1.08-1.86.96-2.95-.93.04-2.06.62-2.72 1.4-.58.68-.99 1.78-.85 2.85.1 0 .23.01.35.01 1.01-.01 2-.63 2.26-1.31z" />
          </svg>
        </div>
      );
    case 'MSFT':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm p-2.5 `}>
          <div className="grid grid-cols-2 gap-0.5 w-full h-full">
            <div className="bg-[#f25022] rounded-xs" />
            <div className="bg-[#7fba00] rounded-xs" />
            <div className="bg-[#00a4ef] rounded-xs" />
            <div className="bg-[#ffb900] rounded-xs" />
          </div>
        </div>
      );
    case 'NVDA':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#76b900] text-white flex items-center justify-center shrink-0 shadow-sm `}>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.003 3C7.03 3 3 7.03 3 12.003c0 4.973 4.03 9.003 9.003 9.003 4.974 0 9.003-4.03 9.003-9.003C21.006 7.03 16.977 3 12.003 3zm3.898 12.916c-1.821 1.547-4.484 1.76-6.567.42-1.32-.849-2.096-2.316-2.096-3.896 0-1.862.966-3.551 2.52-4.417 1.139-.636 2.457-.866 3.754-.658a.747.747 0 0 1 .615.864.747.747 0 0 1-.864.615c-.974-.156-1.964.017-2.82.5-1.166.65-1.891 1.918-1.891 3.313 0 1.186.583 2.287 1.574 2.925 1.565 1.007 3.565.847 4.933-.316a.747.747 0 0 1 1.054.086.747.747 0 0 1-.086 1.054l-.126-.49z" />
          </svg>
        </div>
      );
    case 'TSLA':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#e82127] text-white flex items-center justify-center shrink-0 shadow-sm `}>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-13h1v8h-1zM7 8c1.5-1 3.5-1.5 5-1.5s3.5.5 5 1.5l-.8 1.4C14.8 8.6 13.5 8.2 12 8.2s-2.8.4-4.2 1.2L7 8z" />
          </svg>
        </div>
      );
    case 'GOOGL':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm font-extrabold text-xl font-sans `}>
          <span className="text-blue-600">G</span>
        </div>
      );
    case 'AMZN':
      return (
        <div className={`w-11 h-11 rounded-xl bg-black text-[#ff9900] flex items-center justify-center shrink-0 shadow-sm font-extrabold text-lg font-sans ${className}`}>
          <span>a</span><span className="text-white">z</span>
        </div>
      );
    case 'META':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#0064e0] text-white flex items-center justify-center shrink-0 shadow-sm font-extrabold text-xl font-sans `}>
          <span>M</span>
        </div>
      );
    case 'BRK.A':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#002060] text-white flex items-center justify-center shrink-0 shadow-sm font-serif font-extrabold text-xl `}>
          <span>B</span>
        </div>
      );
    case 'JPM':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#003466] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-sm tracking-tighter `}>
          <span>JPM</span>
        </div>
      );
    case 'BAC':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#e31837] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs tracking-tighter `}>
          <span>BAC</span>
        </div>
      );
    case 'V':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#1a1f71] text-[#f7b600] flex items-center justify-center shrink-0 shadow-sm font-sans font-black text-xl italic `}>
          <span>V</span>
        </div>
      );
    case 'MA':
      return (
        <div className={`w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-sm p-2 ${className}`}>
          <div className="flex items-center justify-center -space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#eb001b] opacity-90" />
            <div className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-90" />
          </div>
        </div>
      );
    case 'UNH':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#002677] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-sm `}>
          <span>UNH</span>
        </div>
      );
    case 'JNJ':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#d51900] text-white flex items-center justify-center shrink-0 shadow-sm font-serif font-bold text-base italic `}>
          <span>J&J</span>
        </div>
      );
    case 'ABBV':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#00005a] text-sky-400 flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>ABBV</span>
        </div>
      );
    case 'PFE':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#0000ff] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>PFE</span>
        </div>
      );
    case 'XOM':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#ff0000] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-black text-xs tracking-tighter `}>
          <span>XOM</span>
        </div>
      );
    case 'CVX':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#0099d8] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>CVX</span>
        </div>
      );
    case 'CAT':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#ffcd11] text-black flex items-center justify-center shrink-0 shadow-sm font-sans font-black text-xs `}>
          <span>CAT</span>
        </div>
      );
    case 'GE':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#005a9c] text-white flex items-center justify-center shrink-0 shadow-sm font-serif font-bold text-lg `}>
          <span>GE</span>
        </div>
      );
    case 'UPS':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#351c15] text-[#ffb500] flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>UPS</span>
        </div>
      );
    case 'NEE':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#009639] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>NEE</span>
        </div>
      );
    case 'DUK':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#00539f] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>DUK</span>
        </div>
      );
    case 'SO':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-[#cc0000] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-bold text-xs `}>
          <span>SO</span>
        </div>
      );
    case 'SPY':
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-extrabold text-sm font-sans `}>
          <span>S&P</span>
        </div>
      );
    default:
      return (
        <div className={`w-11 h-11 rounded-xl w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-sm font-bold text-sm font-sans `}>
          {symbol.slice(0, 3)}
        </div>
      );
  }
}

export default function MultiStockGrid({ onSelectStock, liveStocks = {} }: MultiStockGridProps) {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'TSLA']);
  const [activePreset, setActivePreset] = useState<string>('tech');

  const handleAddSymbol = (sym: string) => {
    if (selectedSymbols.includes(sym)) return;
    if (selectedSymbols.length >= 4) {
      setSelectedSymbols([...selectedSymbols.slice(1), sym]);
    } else {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    if (selectedSymbols.length <= 1) return;
    setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
  };

  const applyPreset = (presetName: string, syms: string[]) => {
    setActivePreset(presetName);
    setSelectedSymbols(syms);
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Controls Card ("Compare Stocks") */}
      <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-all space-y-6">
        
        {/* Header and Category Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <BarChart2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                Compare Stocks
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Compare real-time prices, simple stats, and risk for up to 4 stocks.
              </p>
            </div>
          </div>

          {/* Category Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mr-1">
              Choose a category:
            </span>
            <button
              onClick={() => applyPreset('tech', ['AAPL', 'MSFT', 'NVDA', 'TSLA'])}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                activePreset === 'tech'
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              Technology
            </button>
            <button
              onClick={() => applyPreset('consumer', ['AMZN', 'META', 'GOOGL', 'TSLA'])}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                activePreset === 'consumer'
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              Consumer & Retail
            </button>
            <button
              onClick={() => applyPreset('finance', ['JPM', 'V', 'BRK.A', 'SPY'])}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                activePreset === 'finance'
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              Banking & Finance
            </button>
            <button
              onClick={() => applyPreset('health', ['JNJ', 'UNH', 'XOM', 'CVX'])}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                activePreset === 'health'
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              Healthcare & Pharma
            </button>
          </div>
        </div>

        {/* Selected & Add More Symbol Bars */}
        <div className="space-y-3.5 pt-1">
          {/* Selected Symbols Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white mr-2 shrink-0">
              Selected ({selectedSymbols.length}/4):
            </span>
            {selectedSymbols.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all"
              >
                <span>{sym}</span>
                <button
                  onClick={() => handleRemoveSymbol(sym)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                  title={`Remove ${sym}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add More Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white mr-2 shrink-0">
              Add more:
            </span>
            {AVAILABLE_SYMBOLS.filter(s => !selectedSymbols.includes(s)).map(sym => (
              <button
                key={sym}
                onClick={() => handleAddSymbol(sym)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{sym}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Card Comparison Grid */}
      <div className={`grid grid-cols-1 ${selectedSymbols.length > 1 ? 'sm:grid-cols-2' : ''} ${selectedSymbols.length > 2 ? 'lg:grid-cols-4' : ''} gap-4 sm:gap-6`}>
        {selectedSymbols.map(sym => {
          const live = liveStocks[sym] || {};
          const meta = STOCK_METADATA[sym] || {};
          const price = live.price || meta.defaultPrice || '150.00';
          const change = live.change || meta.defaultChange || '+1.25';
          const isPositive = parseFloat(change) >= 0;
          const stockObj = INDEXED_STOCKS.find(s => s.symbol === sym);

          return (
            <div
              key={sym}
              className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Top Row: Brand Logo + Symbol + Change Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3.5">
                    <StockLogo symbol={sym} />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none font-sans">
                        {sym}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[110px]">
                        {stockObj?.name || meta.name || sym}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 rounded-md text-[11px] font-semibold">
                        {meta.badgeCategory || meta.category || 'Technology'}
                      </span>
                    </div>
                  </div>

                  {/* 24h Change Pill */}
                  <div className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40'
                  }`}>
                    <span>{isPositive ? '↗' : '↘'}</span>
                    <span>{change.startsWith('+') || change.startsWith('-') ? change : isPositive ? `+${change}` : `-${change}`}%</span>
                  </div>
                </div>

                {/* Live Price Display */}
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-5 font-sans">
                  ${price}
                </div>

                {/* 4-Box 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-2.5 my-4">
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Market Value</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{meta.mcap || '$3.02T'}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">P/E Ratio</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{meta.pe || '29.2'}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Risk (Volatility)</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{meta.beta || '1.24'}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Avg. Daily Range</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{meta.range || '$6.28'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: 52-Week Range & View Details Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">52-Week Range</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {meta.low52} – {meta.high52}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const target = stockObj || {
                      symbol: sym,
                      name: meta.name || sym,
                      sector: meta.sector || 'Technology Sector',
                      price: price,
                      change: change
                    };
                    onSelectStock(target as IndexedStock);
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:hover:bg-blue-900 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer group-hover:scale-[1.03]"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Comparison Table Card */}
      <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl mt-6 sm:mt-8">
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0b0e14]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 font-sans">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span>Quick Comparison</span>
          </h3>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Comparing {selectedSymbols.length} stocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 font-bold w-1/5">Metric</th>
                {selectedSymbols.map(sym => (
                  <th key={sym} className="py-4 px-6 font-bold">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">Category</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {STOCK_METADATA[sym]?.category || 'Technology'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">Live Price</td>
                {selectedSymbols.map(sym => {
                  const live = liveStocks[sym] || {};
                  const price = live.price || STOCK_METADATA[sym]?.defaultPrice || '150.00';
                  return (
                    <td key={sym} className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      ${price}
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">24h Change (%)</td>
                {selectedSymbols.map(sym => {
                  const live = liveStocks[sym] || {};
                  const chg = live.change || STOCK_METADATA[sym]?.defaultChange || '+1.25';
                  const isPos = parseFloat(chg) >= 0;
                  return (
                    <td key={sym} className={`py-4 px-6 font-bold ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {chg.startsWith('+') || chg.startsWith('-') ? chg : isPos ? `+${chg}` : `-${chg}`}%
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">Market Value</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {STOCK_METADATA[sym]?.mcap || '$2.0T'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">P/E Ratio</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {STOCK_METADATA[sym]?.pe || '28.5'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">Risk (Volatility)</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {STOCK_METADATA[sym]?.beta || '1.10'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">Dividend Yield</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {STOCK_METADATA[sym]?.yield || '0.50%'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">52-Week Range</td>
                {selectedSymbols.map(sym => (
                  <td key={sym} className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {STOCK_METADATA[sym]?.low52} – {STOCK_METADATA[sym]?.high52}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

