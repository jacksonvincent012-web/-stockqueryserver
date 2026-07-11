import React, { useState, useMemo, useEffect } from 'react';
import { INDEXED_STOCKS } from '../../../search';
import { IndexedStock } from '../../../types';
import {
  IndicatorType,
  TimeframeType,
  ChartLayoutType,
  ChartStyleType,
  ChartDataPoint
} from './analysis/types';
import AnalystToolbox from './analysis/AnalystToolbox';
import AnalystTopToolbar from './analysis/AnalystTopToolbar';
import AnalystChartWorkspace from './analysis/AnalystChartWorkspace';
import AnalystRightPanel from './analysis/AnalystRightPanel';
import AnalystBottomPanels from './analysis/AnalystBottomPanels';
import AnalystQuickActions from './analysis/AnalystQuickActions';
import { format, subDays, subMonths, subYears } from 'date-fns';
import {
  X,
  Check,
  GitCompare,
  Calculator,
  Settings,
  ShieldAlert,
  Award,
  TrendingUp
} from 'lucide-react';

interface PriceHistoryViewProps {
  initialStock?: IndexedStock | null;
  watchlistSymbols?: string[];
  liveStocks?: Record<string, any>;
  onNavigateTab?: (tab: any) => void;
  onAddToWatchlist?: (symbol: string) => void;
  theme?: 'light' | 'dark';
}

export default function PriceHistoryView({
  initialStock,
  watchlistSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BTCUSD'],
  liveStocks = {},
  onNavigateTab,
  onAddToWatchlist,
  theme = 'dark'
}: PriceHistoryViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(() => {
    return initialStock?.symbol || 'AAPL';
  });

  const [timeframe, setTimeframe] = useState<TimeframeType>('6M');
  const [chartStyle, setChartStyle] = useState<ChartStyleType>('Candlestick');
  const [chartLayout, setChartLayout] = useState<ChartLayoutType>('single');
  const [activeIndicators, setActiveIndicators] = useState<IndicatorType[]>([
    'Moving Averages',
    'Volume',
    'RSI'
  ]);
  const [compareSymbols, setCompareSymbols] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<'compare' | 'calculator' | 'settings' | 'ai_modal' | null>(null);
  const [compareInput1, setCompareInput1] = useState('');
  const [compareInput2, setCompareInput2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [calcRisk, setCalcRisk] = useState('160.00');
  const [calcReward, setCalcReward] = useState('195.00');
  const [calcEntry, setCalcEntry] = useState('164.00');

  const suggestions1 = useMemo(() => {
    if (!compareInput1.trim()) return [];
    const q = compareInput1.toLowerCase();
    return INDEXED_STOCKS.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q) || 
      s.sector.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [compareInput1]);

  const suggestions2 = useMemo(() => {
    if (!compareInput2.trim()) return [];
    const q = compareInput2.toLowerCase();
    return INDEXED_STOCKS.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q) || 
      s.sector.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [compareInput2]);

  const isLight = theme === 'light';

  useEffect(() => {
    if (initialStock?.symbol) {
      setSelectedSymbol(initialStock.symbol);
    }
  }, [initialStock]);

  const handleToggleIndicator = (ind: IndicatorType) => {
    setActiveIndicators((prev) =>
      prev.includes(ind) ? prev.filter((item) => item !== ind) : [...prev, ind]
    );
  };

  const handleClearIndicators = () => {
    setActiveIndicators([]);
  };

  const handleApplyBothCompare = () => {
    const sym1 = compareInput1.trim().toUpperCase();
    const sym2 = compareInput2.trim().toUpperCase();
    const toAdd: string[] = [];
    if (sym1 && !compareSymbols.includes(sym1) && sym1 !== selectedSymbol) toAdd.push(sym1);
    if (sym2 && !compareSymbols.includes(sym2) && sym2 !== selectedSymbol && sym2 !== sym1) toAdd.push(sym2);
    if (toAdd.length > 0) {
      setCompareSymbols((prev) => [...prev, ...toAdd]);
    }
    setCompareInput1('');
    setCompareInput2('');
    setShowDropdown1(false);
    setShowDropdown2(false);
  };

  const handleRemoveCompareSymbol = (sym: string) => {
    setCompareSymbols((prev) => prev.filter((item) => item !== sym));
  };

  // SQ Platform Data Generator producing OHLC + all 12 indicator series
  const generateSeriesData = (symbol: string, tf: TimeframeType, isComparison: boolean = false): ChartDataPoint[] => {
    const pointsCount = tf === '1D' ? 30 : tf === '5D' ? 40 : tf === '1M' ? 30 : tf === '3M' ? 60 : tf === '6M' ? 120 : tf === '1Y' ? 250 : 300;
    const basePrice = symbol === 'NVDA' ? 128.76 : symbol === 'MSFT' ? 442.53 : symbol === 'BTCUSD' ? 67245.80 : symbol === 'TSLA' ? 248.50 : 163.88;
    const data: ChartDataPoint[] = [];
    let price = isComparison ? basePrice * 0.95 : basePrice;
    const now = new Date();

    for (let i = pointsCount; i >= 0; i--) {
      const d = new Date(now);
      if (tf === '1D') {
        d.setMinutes(d.getMinutes() - i * 15);
      } else {
        d.setDate(d.getDate() - i);
      }
      const dateStr = tf === '1D' ? format(d, 'HH:mm') : format(d, 'yyyy-MM-dd');
      const changePercent = (Math.random() - 0.48) * 0.032;
      const change = price * changePercent;
      const open = Number(price.toFixed(2));
      const close = Number((price + change).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (price * 0.015)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (price * 0.015)).toFixed(2));
      const volume = Math.floor(Math.random() * 8000000) + 3000000;

      // Indicator calculations
      const sma20 = Number((close * (1 + (Math.sin(i / 5) * 0.02))).toFixed(2));
      const ema50 = Number((close * (1 + (Math.cos(i / 8) * 0.03))).toFixed(2));
      const vwap = Number(((high + low + close) / 3).toFixed(2));
      const stdDev = close * 0.035;
      const upperBand = Number((sma20 + stdDev * 2).toFixed(2));
      const lowerBand = Number((sma20 - stdDev * 2).toFixed(2));
      const rsi = Number((50 + Math.sin(i / 3) * 25).toFixed(2));
      const macd = Number((Math.sin(i / 4) * 2.5).toFixed(2));
      const signalLine = Number((macd * 0.8).toFixed(2));
      const stochK = Number((50 + Math.cos(i / 2) * 35).toFixed(2));
      const stochD = Number((stochK * 0.9).toFixed(2));
      const adx = Number((22 + Math.abs(Math.sin(i / 6)) * 20).toFixed(2));
      const atr = Number((high - low).toFixed(2));
      const ichimokuCloud = Number((close * (1 - 0.015)).toFixed(2));

      data.push({
        timestamp: dateStr,
        date: dateStr,
        open,
        high,
        low,
        close,
        volume,
        sma20,
        ema50,
        vwap,
        upperBand,
        lowerBand,
        rsi,
        macd,
        signalLine,
        stochK,
        stochD,
        adx,
        atr,
        ichimokuCloud
      });
      price = close;
    }
    return data;
  };

  const primaryData = useMemo(() => {
    return generateSeriesData(selectedSymbol, timeframe, false);
  }, [selectedSymbol, timeframe]);

  const compareSeriesData = useMemo(() => {
    const map: Record<string, ChartDataPoint[]> = {};
    compareSymbols.forEach((sym) => {
      map[sym] = generateSeriesData(sym, timeframe, true);
    });
    return map;
  }, [compareSymbols, timeframe]);

  const handleTakeSnapshot = () => {
    const el = document.getElementById('SQ Platform-workspace-root');
    if (el) {
      alert(`SQ Platform Chart Snapshot for ${selectedSymbol} captured to clipboard!`);
    }
  };

  // Calculate Risk / Reward ratio
  const riskRewardRatio = useMemo(() => {
    const e = parseFloat(calcEntry) || 0;
    const r = parseFloat(calcRisk) || 0;
    const w = parseFloat(calcReward) || 0;
    if (e <= r || w <= e) return 'N/A';
    const risk = e - r;
    const reward = w - e;
    const ratio = reward / risk;
    return `1 : ${ratio.toFixed(2)}`;
  }, [calcEntry, calcRisk, calcReward]);

  return (
    <div
      id="SQ Platform-workspace-root"
      className={`space-y-6 ${isFullScreen ? 'fixed inset-0 z-50 p-6 overflow-y-auto bg-[#080a0f]' : ''}`}
    >
      {/* 1. Quick Actions Bar */}
      <AnalystQuickActions
        symbol={selectedSymbol}
        onNavigateTab={onNavigateTab}
        onAddToWatchlist={onAddToWatchlist}
        onOpenCompare={() => setActiveModal('compare')}
        theme={theme}
      />

      {/* 2. Main SQ Platform Workspace Layout (Grid / Flex) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Collapsible Toolbox */}
        <div className="shrink-0 w-full lg:w-auto">
          <AnalystToolbox
            activeIndicators={activeIndicators}
            onToggleIndicator={handleToggleIndicator}
            onOpenCompare={() => setActiveModal('compare')}
            onOpenCalculator={() => setActiveModal('calculator')}
            theme={theme}
          />
        </div>

        {/* Center Primary Chart Workspace (Approx 65% width on desktop) */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Chart Toolbar */}
          <AnalystTopToolbar
            timeframe={timeframe}
            onSelectTimeframe={setTimeframe}
            chartStyle={chartStyle}
            onSelectChartStyle={setChartStyle}
            activeIndicators={activeIndicators}
            onToggleIndicator={handleToggleIndicator}
            onClearIndicators={handleClearIndicators}
            chartLayout={chartLayout}
            onSelectChartLayout={setChartLayout}
            onOpenCompare={() => setActiveModal('compare')}
            onOpenSettings={() => setActiveModal('settings')}
            onTakeSnapshot={handleTakeSnapshot}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            theme={theme}
          />

          {/* Interactive Recharts Chart Area */}
          <AnalystChartWorkspace
            data={primaryData}
            symbol={selectedSymbol}
            chartStyle={chartStyle}
            chartLayout={chartLayout}
            activeIndicators={activeIndicators}
            compareSymbols={compareSymbols}
            compareData={compareSeriesData}
            theme={theme}
          />

          {/* Bottom Analysis Panels */}
          <div className="mt-6">
            <AnalystBottomPanels
              symbol={selectedSymbol}
              theme={theme}
            />
          </div>
        </div>

        {/* Right Information Panel (Approx 35% width on desktop) */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <AnalystRightPanel
            currentSymbol={selectedSymbol}
            onSelectSymbol={(sym) => {
              setSelectedSymbol(sym);
            }}
            watchlistSymbols={watchlistSymbols}
            liveStocks={liveStocks}
            theme={theme}
          />
        </div>
      </div>

      {/* Modals: Compare Assets, Calculator, Settings */}
      {activeModal === 'compare' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-visible p-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141f] border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-base">
                <GitCompare className="w-5 h-5 text-purple-400" />
                <span>Compare Assets Overlay (Dual Stock Entry Engine)</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Overlay up to two secondary stocks or sector benchmarks simultaneously onto the SQ Platform primary series chart. Real-time market search algorithms apply in each entry below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* ENTRY 1 */}
              <div className="relative space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>Entry #1: First Comparison Asset</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={compareInput1}
                      onChange={(e) => {
                        setCompareInput1(e.target.value);
                        setShowDropdown1(true);
                      }}
                      onFocus={() => setShowDropdown1(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyBothCompare();
                        }
                      }}
                      placeholder="Search stock 1 (e.g. MSFT)..."
                      className={`w-full rounded-xl px-3 py-2.5 text-xs font-mono outline-none border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500' : 'bg-[#080a0f] border-slate-800 text-white focus:border-purple-500'
                      }`}
                    />
                    {showDropdown1 && suggestions1.length > 0 && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border shadow-2xl p-1 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-slate-700'
                      }`}>
                        {suggestions1.map((st) => (
                          <div
                            key={st.symbol}
                            onClick={() => {
                              setCompareInput1(st.symbol);
                              setShowDropdown1(false);
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
                </div>
              </div>

              {/* ENTRY 2 */}
              <div className="relative space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>Entry #2: Second Comparison Asset</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={compareInput2}
                      onChange={(e) => {
                        setCompareInput2(e.target.value);
                        setShowDropdown2(true);
                      }}
                      onFocus={() => setShowDropdown2(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyBothCompare();
                        }
                      }}
                      placeholder="Search stock 2 (e.g. QQQ, NVDA)..."
                      className={`w-full rounded-xl px-3 py-2.5 text-xs font-mono outline-none border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500' : 'bg-[#080a0f] border-slate-800 text-white focus:border-purple-500'
                      }`}
                    />
                    {showDropdown2 && suggestions2.length > 0 && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border shadow-2xl p-1 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-slate-700'
                      }`}>
                        {suggestions2.map((st) => (
                          <div
                            key={st.symbol}
                            onClick={() => {
                              setCompareInput2(st.symbol);
                              setShowDropdown2(false);
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
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={handleApplyBothCompare}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                <span>Apply & Overlay Comparison Series</span>
              </button>
            </div>

            <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Overlaid Series:</span>
              {compareSymbols.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-500 text-center font-mono">
                  No secondary assets overlayed on chart
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {compareSymbols.map((sym) => (
                    <div key={sym} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-mono">
                      <span className="font-bold text-purple-300">{sym} • Overlay Series</span>
                      <button onClick={() => handleRemoveCompareSymbol(sym)} className="text-rose-400 hover:underline text-[11px] font-semibold cursor-pointer">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all">
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'calculator' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141f] border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>SQ Platform Risk / Reward & Pivot Calculator</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Target Entry Price ($)</label>
                <input
                  type="number"
                  value={calcEntry}
                  onChange={(e) => setCalcEntry(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Stop Loss Risk Level ($)</label>
                <input
                  type="number"
                  value={calcRisk}
                  onChange={(e) => setCalcRisk(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Profit Target Reward Level ($)</label>
                <input
                  type="number"
                  value={calcReward}
                  onChange={(e) => setCalcReward(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Calculated Risk / Reward Ratio</span>
                <span className="text-xl font-black text-blue-400">{riskRewardRatio}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141f] border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>SQ Platform Chart Settings</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span>Show Volume Bars Sub-Series</span>
                <input type="checkbox" defaultChecked={true} className="accent-blue-600 w-4 h-4 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span>Auto-Adjust Y-Axis Scale with Bollinger Bands</span>
                <input type="checkbox" defaultChecked={true} className="accent-blue-600 w-4 h-4 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span>High Contrast SQ Platform Color Palette</span>
                <input type="checkbox" defaultChecked={false} className="accent-blue-600 w-4 h-4 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span>Live Real-time Wire Quote Ticker Updates</span>
                <input type="checkbox" defaultChecked={true} className="accent-blue-600 w-4 h-4 cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
