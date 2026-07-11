import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  TrendingUp,
  GitCompare,
  LayoutTemplate,
  Layout,
  Maximize2,
  Minimize2,
  Camera,
  Settings,
  ChevronDown,
  Check,
  X,
  Sliders,
  BarChart2,
  Activity
} from 'lucide-react';
import { IndicatorType, TimeframeType, ChartLayoutType, ChartStyleType } from './types';
import { motion, AnimatePresence } from 'motion/react';

interface AnalystTopToolbarProps {
  timeframe: TimeframeType;
  onSelectTimeframe: (tf: TimeframeType) => void;
  chartStyle: ChartStyleType;
  onSelectChartStyle: (style: ChartStyleType) => void;
  activeIndicators: IndicatorType[];
  onToggleIndicator: (ind: IndicatorType) => void;
  onClearIndicators: () => void;
  chartLayout: ChartLayoutType;
  onSelectChartLayout: (layout: ChartLayoutType) => void;
  onOpenCompare: () => void;
  onOpenSettings: () => void;
  onTakeSnapshot: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  theme?: 'light' | 'dark';
}

const TIMEFRAMES: TimeframeType[] = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

const CHART_STYLES: ChartStyleType[] = ['Candlestick', 'Line', 'Heikin Ashi', 'Area', 'OHLC'];

const ALL_INDICATORS: IndicatorType[] = [
  'Moving Averages',
  'RSI',
  'MACD',
  'Bollinger Bands',
  'Volume',
  'EMA',
  'SMA',
  'VWAP',
  'ATR',
  'ADX',
  'Ichimoku',
  'Stochastic'
];

const TEMPLATES = [
  { name: 'SQ Platform Momentum', indicators: ['Moving Averages', 'RSI', 'Volume', 'MACD'] as IndicatorType[] },
  { name: 'Mean Reversion & Bands', indicators: ['Bollinger Bands', 'Stochastic', 'VWAP'] as IndicatorType[] },
  { name: 'Trend & Directional Flow', indicators: ['EMA', 'ADX', 'ATR', 'Volume'] as IndicatorType[] },
  { name: 'Cloud Breakout Setup', indicators: ['Ichimoku', 'SMA', 'Volume'] as IndicatorType[] },
  { name: 'Clean Price Action', indicators: ['Volume'] as IndicatorType[] }
];

export default function AnalystTopToolbar({
  timeframe,
  onSelectTimeframe,
  chartStyle,
  onSelectChartStyle,
  activeIndicators,
  onToggleIndicator,
  onClearIndicators,
  chartLayout,
  onSelectChartLayout,
  onOpenCompare,
  onOpenSettings,
  onTakeSnapshot,
  isFullScreen,
  onToggleFullScreen,
  theme = 'dark'
}: AnalystTopToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<'indicators' | 'styles' | 'templates' | 'layout' | null>(null);

  const isLight = theme === 'light';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyTemplate = (inds: IndicatorType[]) => {
    onClearIndicators();
    inds.forEach(ind => onToggleIndicator(ind));
    setActiveDropdown(null);
  };

  return (
    <div
      ref={dropdownRef}
      className={`p-3 rounded-2xl border shadow-sm mb-4 transition-all flex flex-wrap items-center justify-between gap-3 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0e14] border-slate-800 text-slate-200'
      }`}
    >
      {/* Left Section: Timeframes & Chart Type */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Timeframes Bar */}
        <div className={`flex items-center p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121722] border-slate-800'}`}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'styles' ? null : 'styles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeDropdown === 'styles'
                ? 'border-blue-500 text-blue-500 bg-blue-500/10'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{chartStyle}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'styles' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute left-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-30 p-1.5 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111622] border-slate-800 text-slate-200'
                }`}
              >
                {CHART_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      onSelectChartStyle(style);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                      chartStyle === style
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{style}</span>
                    {chartStyle === style && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Middle Section: Indicators, Compare, Templates */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Indicator Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'indicators' ? null : 'indicators')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeDropdown === 'indicators' || activeIndicators.length > 0
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Indicators</span>
            {activeIndicators.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px] font-mono">
                {activeIndicators.length}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'indicators' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute left-0 top-full mt-2 w-64 rounded-xl border shadow-xl z-30 p-2 max-h-80 overflow-y-auto custom-scrollbar ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111622] border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Select Indicators</span>
                  {activeIndicators.length > 0 && (
                    <button
                      onClick={onClearIndicators}
                      className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {ALL_INDICATORS.map((ind) => {
                    const active = activeIndicators.includes(ind);
                    return (
                      <button
                        key={ind}
                        onClick={() => onToggleIndicator(ind)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                          active
                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                            : isLight
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{ind}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          active ? 'bg-blue-600 text-white' : isLight ? 'bg-slate-200' : 'bg-slate-800'
                        }`}>
                          {active && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compare Stocks Button */}
        <button
          onClick={onOpenCompare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
              : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-purple-400" />
          <span>Compare</span>
        </button>

        {/* Templates Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'templates' ? null : 'templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeDropdown === 'templates'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
            <span>Templates</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          <AnimatePresence>
            {activeDropdown === 'templates' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute left-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-30 p-1.5 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111622] border-slate-800 text-slate-200'
                }`}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-slate-400">Preset Strategy Templates</div>
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleApplyTemplate(tmpl.indicators)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {tmpl.indicators.join(', ')}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layout Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'layout' ? null : 'layout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              activeDropdown === 'layout'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Chart Layout Mode"
          >
            <Layout className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{chartLayout.replace('_', '/')}</span>
          </button>

          <AnimatePresence>
            {activeDropdown === 'layout' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute right-0 top-full mt-2 w-44 rounded-xl border shadow-xl z-30 p-1.5 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111622] border-slate-800 text-slate-200'
                }`}
              >
                {(['single', 'split', 'top_bottom', 'grid'] as ChartLayoutType[]).map((lay) => (
                  <button
                    key={lay}
                    onClick={() => {
                      onSelectChartLayout(lay);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      chartLayout === lay
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{lay.replace('_', ' / ')} View</span>
                    {chartLayout === lay && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section: Fullscreen, Snapshot, Settings */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTakeSnapshot}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70'
              : 'bg-[#121722] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
          title="Take Chart Snapshot"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullScreen}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isFullScreen
              ? 'bg-blue-600 border-blue-500 text-white'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70'
              : 'bg-[#121722] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70'
              : 'bg-[#121722] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
          title="Chart Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Active Indicators Ribbon */}
      {activeIndicators.length > 0 && (
        <div className="w-full flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Active Indicators:</span>
          {activeIndicators.map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-medium"
            >
              <span>{ind}</span>
              <button
                onClick={() => onToggleIndicator(ind)}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onClearIndicators}
            className="text-[10px] text-slate-500 hover:text-rose-400 ml-2 font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
