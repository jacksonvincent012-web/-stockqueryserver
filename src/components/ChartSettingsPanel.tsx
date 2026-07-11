import React, { useState } from 'react';
import { 
  X, Sun, Moon, Monitor, Sliders, Check, 
  BarChart2, Activity, Layers, Download, ChevronRight,
  Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChartSettingsPanelProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  onClose: () => void;
  chartType: 'Line' | 'Candles' | 'Area' | 'Heikin Ashi';
  onChartTypeChange: (type: 'Line' | 'Candles' | 'Area' | 'Heikin Ashi') => void;
  showVolume: boolean;
  onToggleVolume: (show: boolean) => void;
  showIndicators: boolean;
  onToggleIndicators: (show: boolean) => void;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export default function ChartSettingsPanel({
  theme,
  isOpen,
  onClose,
  chartType,
  onChartTypeChange,
  showVolume,
  onToggleVolume,
  showIndicators,
  onToggleIndicators,
  timeframe,
  onTimeframeChange
}: ChartSettingsPanelProps) {
  const [activeThemeMode, setActiveThemeMode] = useState<'light' | 'dark' | 'auto'>(theme);
  const [priceScale, setPriceScale] = useState<'Auto' | 'Log' | 'Percentage'>('Auto');
  const [savedLayouts, setSavedLayouts] = useState<string[]>(['Institutional Default', 'Swing Trader Pro']);
  const [showLayoutSuccess, setShowLayoutSuccess] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSaveLayout = () => {
    setShowLayoutSuccess(true);
    setTimeout(() => setShowLayoutSuccess(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`w-72 sm:w-80 shrink-0 border-l flex flex-col z-30 font-sans shadow-xl ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e121a] border-slate-800 text-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${
        isLight ? 'border-slate-100 bg-slate-50/60' : 'border-slate-800/80 bg-slate-900/50'
      }`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Chart Settings</h3>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors ${
            isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        
        {/* Theme Selector */}
        <div className="space-y-2">
          <label className={`block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Theme</label>
          <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-900 border-slate-800'
          }`}>
            {(['light', 'dark', 'auto'] as const).map((mode) => {
              const active = activeThemeMode === mode;
              const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
              return (
                <button
                  key={mode}
                  onClick={() => setActiveThemeMode(mode)}
                  className={`py-1.5 px-2 rounded-lg font-bold capitalize flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? isLight
                        ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                        : 'bg-slate-800 text-blue-400 shadow-2xs border border-slate-700'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Style */}
        <div className="space-y-2">
          <label className={`block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Chart Style</label>
          <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-900 border-slate-800'
          }`}>
            {(['Candles', 'Line', 'Area', 'Heikin Ashi'] as const).map((type) => {
              const active = chartType === type;
              return (
                <button
                  key={type}
                  onClick={() => onChartTypeChange(type)}
                  className={`py-1.5 px-2.5 rounded-lg font-bold transition-all text-center ${
                    active
                      ? isLight
                        ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                        : 'bg-slate-800 text-blue-400 shadow-2xs border border-slate-700'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Interval */}
        <div className="space-y-2">
          <label className={`block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Time Interval</label>
          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className={`flex-1 p-2 rounded-xl border font-mono font-bold text-xs focus:outline-none transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'].map(tf => (
                <option key={tf} value={tf}>{tf} Interval</option>
              ))}
            </select>
            <button className={`px-3 py-2 rounded-xl border font-bold text-xs transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
            }`}>
              Custom ⇄
            </button>
          </div>
        </div>

        {/* Toggles (Volume & Indicators) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className={`font-semibold flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <BarChart2 className="w-4 h-4 text-slate-400" />
              Show Volume
            </span>
            <button
              onClick={() => onToggleVolume(!showVolume)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                showVolume ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                showVolume ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className={`font-semibold flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Activity className="w-4 h-4 text-slate-400" />
              Show Indicators (SMA/RSI)
            </span>
            <button
              onClick={() => onToggleIndicators(!showIndicators)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                showIndicators ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                showIndicators ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Advanced Accordion Menu Items */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Price Scale */}
          <div className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
          }`}
          onClick={() => setPriceScale(prev => prev === 'Auto' ? 'Log' : prev === 'Log' ? 'Percentage' : 'Auto')}
          >
            <span className="font-bold text-slate-600 dark:text-slate-400">PRICE SCALE</span>
            <div className="flex items-center gap-1.5 text-blue-500 font-bold">
              <span>{priceScale}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Indicators Count */}
          <div className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
          }`}>
            <span className="font-bold text-slate-600 dark:text-slate-400">INDICATORS</span>
            <div className="flex items-center gap-1.5 text-blue-500 font-bold">
              <span>{showIndicators ? '2 Active' : 'Off'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Templates */}
          <div className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
          }`}>
            <span className="font-bold text-slate-600 dark:text-slate-400">TEMPLATES</span>
            <div className="flex items-center gap-1.5 text-blue-500 font-bold">
              <span>Institutional</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Save Layout Action */}
          <div 
            onClick={handleSaveLayout}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              showLayoutSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isLight ? 'bg-blue-50/60 border-blue-200/80 text-blue-600 hover:bg-blue-100/80' : 'bg-blue-950/20 border-blue-500/30 text-blue-400 hover:bg-blue-900/30'
            }`}
          >
            <span className="font-bold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {showLayoutSuccess ? 'Layout Saved!' : 'SAVE LAYOUT'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className={`p-3 text-center border-t text-[10px] text-slate-400 font-mono ${
        isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800/60 bg-slate-900/30'
      }`}>
        Institutional Engine v4.2 · Live Sync
      </div>
    </motion.div>
  );
}
