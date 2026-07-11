import React from 'react';
import { TrendingUp, TrendingDown, Activity, ArrowRight, Layers, Monitor, Landmark, HeartPulse, Flame, ShoppingCart, MessageSquare, Factory, Zap, BarChart2, Tag } from 'lucide-react';

interface SectorIndexesProps {
  onSelectSector?: (sectorName: string) => void;
  onSelectSymbol?: (symbol: string) => void;
}

export interface SectorData {
  id: string;
  name: string;
  ticker: string;
  price: string;
  change: string;
  changeAmount: string;
  volume: string;
  marketCap: string;
  topStock: string;
  stocksInSector: string[];
  trend: number[];
}

export const SECTOR_LIST: SectorData[] = [
  {
    id: 'xlk',
    name: 'Technology',
    ticker: 'XLK',
    price: '228.40',
    change: '+1.65',
    changeAmount: '+3.70',
    volume: '14.8M',
    marketCap: '$16.4T',
    topStock: 'AAPL',
    stocksInSector: ['AAPL', 'MSFT', 'NVDA', 'TSLA'],
    trend: [222, 223, 224, 224.5, 226, 227, 228.40],
  },
  {
    id: 'xlf',
    name: 'Banks & Finance',
    ticker: 'XLF',
    price: '41.90',
    change: '-0.21',
    changeAmount: '-0.09',
    volume: '34.5M',
    marketCap: '$4.2T',
    topStock: 'JPM',
    stocksInSector: ['JPM', 'BAC', 'V', 'MA'],
    trend: [42.4, 42.2, 42.3, 42.1, 42.0, 42.1, 41.90],
  },
  {
    id: 'xlv',
    name: 'Healthcare',
    ticker: 'XLV',
    price: '144.50',
    change: '+0.32',
    changeAmount: '+0.46',
    volume: '15.2M',
    marketCap: '$5.4T',
    topStock: 'UNH',
    stocksInSector: ['UNH', 'JNJ', 'ABBV', 'PFE'],
    trend: [143.5, 143.8, 144.0, 143.9, 144.2, 144.4, 144.50],
  },
  {
    id: 'xle',
    name: 'Energy',
    ticker: 'XLE',
    price: '91.30',
    change: '-0.64',
    changeAmount: '-0.58',
    volume: '22.1M',
    marketCap: '$2.1T',
    topStock: 'XOM',
    stocksInSector: ['XOM', 'CVX'],
    trend: [92.8, 92.5, 92.1, 91.8, 92.0, 91.5, 91.30],
  },
  {
    id: 'xly',
    name: 'Shopping & Retail',
    ticker: 'XLY',
    price: '182.10',
    change: '+1.15',
    changeAmount: '+2.08',
    volume: '11.4M',
    marketCap: '$4.8T',
    topStock: 'AMZN',
    stocksInSector: ['AMZN', 'TSLA'],
    trend: [178, 179, 180, 180.5, 181, 181.5, 182.10],
  },
  {
    id: 'xlc',
    name: 'Media & Communication',
    ticker: 'XLC',
    price: '84.60',
    change: '+0.92',
    changeAmount: '+0.77',
    volume: '13.2M',
    marketCap: '$3.9T',
    topStock: 'GOOGL',
    stocksInSector: ['GOOGL', 'META'],
    trend: [82.5, 83.0, 83.4, 83.8, 84.1, 84.3, 84.60],
  },
  {
    id: 'xli',
    name: 'Manufacturing & Transport',
    ticker: 'XLI',
    price: '124.80',
    change: '+0.45',
    changeAmount: '+0.56',
    volume: '9.8M',
    marketCap: '$3.1T',
    topStock: 'CAT',
    stocksInSector: ['CAT', 'GE', 'UPS'],
    trend: [123.0, 123.5, 123.8, 124.0, 124.2, 124.5, 124.80],
  },
  {
    id: 'xlu',
    name: 'Utilities',
    ticker: 'XLU',
    price: '68.40',
    change: '+0.15',
    changeAmount: '+0.10',
    volume: '18.1M',
    marketCap: '$1.6T',
    topStock: 'NEE',
    stocksInSector: ['NEE', 'DUK', 'SO'],
    trend: [67.8, 68.0, 68.1, 68.2, 68.3, 68.3, 68.40],
  }
];

function getSectorIcon(name: string) {
  switch (name) {
    case 'Technology':
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Monitor className="w-5 h-5" />
        </div>
      );
    case 'Banks & Finance':
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
      );
    case 'Healthcare':
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <HeartPulse className="w-5 h-5" />
        </div>
      );
    case 'Energy':
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
      );
    case 'Shopping & Retail':
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5" />
        </div>
      );
    case 'Media & Communication':
      return (
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
      );
    case 'Manufacturing & Transport':
      return (
        <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 flex items-center justify-center shrink-0">
          <Factory className="w-5 h-5" />
        </div>
      );
    case 'Utilities':
      return (
        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
      );
  }
}

export default function SectorIndexes({ onSelectSector, onSelectSymbol }: SectorIndexesProps) {
  return (
    <div className="space-y-6">
      {/* Page Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
              Market Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              See how different parts of the market are performing today.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-8">
        {/* Top Bar of Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sans">
                How Different Markets Are Performing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                Real-time performance, quotes, and popular companies in each market category.
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Tag className="w-4 h-4 text-blue-500" />
            <span>Market Categories</span>
          </div>
        </div>

        {/* Grid of 8 Sector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTOR_LIST.map((sector) => {
            const numChange = parseFloat(sector.change);
            const isPositive = numChange >= 0;

            return (
              <div
                key={sector.id}
                onClick={() => onSelectSector?.(sector.name)}
                className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-slate-600 rounded-2xl p-5 shadow-sm dark:shadow-xl hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  {/* Icon & Pill Row */}
                  <div className="flex items-center justify-between gap-2">
                    {getSectorIcon(sector.name)}
                    <span className={`inline-flex items-center gap-1 text-xs font-bold font-sans px-2.5 py-1 rounded-lg ${
                      isPositive 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
                      <span>{sector.change}%</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-3.5 font-sans">
                    {sector.name}
                  </h3>

                  {/* Price Row */}
                  <div className="mt-2 flex items-baseline justify-between font-sans">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">${sector.price}</span>
                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {sector.changeAmount}
                    </span>
                  </div>

                  {/* Top Companies Section */}
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-2 font-sans">
                      Top Companies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sector.stocksInSector.map(sym => (
                        <span
                          key={sym}
                          onClick={(e) => { e.stopPropagation(); onSelectSymbol?.(sym); }}
                          className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-100 dark:border-blue-800/60 font-sans"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Volume, Best Performer, and Dash Chart */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-sans mb-3">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Trading Volume</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{sector.volume}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Best Performer</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{sector.topStock}</strong>
                    </div>
                  </div>

                  {/* Horizontal Dash Bar Chart matching screenshot */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                      <div
                        key={idx}
                        className="h-1.5 flex-1 rounded-full bg-slate-800 dark:bg-slate-700/80 transition-all group-hover:bg-slate-700 dark:group-hover:bg-slate-600"
                      ></div>
                    ))}
                    <div
                      className={`h-1.5 flex-1 rounded-full ${
                        isPositive ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-rose-500 shadow-xs shadow-rose-500/50'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside Main Card matching screenshot */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:px-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 font-sans">
            <Activity className="w-5 h-5 text-emerald-500 shrink-0 animate-pulse" />
            <span>Choose a market category or company to see more details.</span>
          </div>
          <button
            onClick={() => onSelectSymbol?.('NVDA')}
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 shrink-0 cursor-pointer group transition-colors font-sans"
          >
            <span>View NVIDIA Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
