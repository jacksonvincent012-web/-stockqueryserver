import React, { useState } from 'react';
import { 
  Star, TrendingUp, DollarSign, Clock, Calendar, 
  BarChart2, RefreshCw, Maximize2, Camera, Bell, 
  Layers, Sliders, Check, ArrowUpRight, ArrowDownRight,
  Activity, ShieldCheck, Share2, Eye
} from 'lucide-react';
import type { IndexedStock } from '../types';

interface InstitutionalHeaderProps {
  stock: IndexedStock;
  liveData?: any;
  theme: 'light' | 'dark';
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  viewMode: 'live' | 'historical';
  onViewModeChange: (mode: 'live' | 'historical') => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  onScreenshot?: () => void;
  onFullScreen?: () => void;
  onRefresh?: () => void;
  onTradeClick?: () => void;
  hideTrade?: boolean;
}

export default function InstitutionalHeader({
  stock,
  liveData,
  theme,
  timeframe,
  onTimeframeChange,
  viewMode,
  onViewModeChange,
  onToggleSettings,
  isSettingsOpen,
  onScreenshot,
  onFullScreen,
  onRefresh,
  onTradeClick,
  hideTrade
}: InstitutionalHeaderProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  const isLight = theme === 'light';

  // Parse numeric price or default
  const priceNum = typeof liveData?.price === 'number' 
    ? liveData.price 
    : (typeof liveData?.price === 'string' ? parseFloat(liveData.price.replace(/[^0-9.-]+/g, '')) : 163.88);
  
  const changeStr = liveData?.change || '+2.34 (+1.45%)';
  const isPos = changeStr.includes('+') || !changeStr.includes('-');
  
  // Simulated institutional metrics
  const afterHoursPrice = (priceNum + 0.17).toFixed(2);
  const bidAskStr = `$${(priceNum - 0.02).toFixed(2)} / $${(priceNum + 0.03).toFixed(2)} x 800`;
  const mktCap = stock.marketCap || '3.01T';
  const peRatio = liveData?.peRatio || '26.42';
  const divYield = '0.51%';
  const dayHigh = (priceNum * 1.015).toFixed(2);
  const dayLow = (priceNum * 0.985).toFixed(2);
  const week52High = '199.62';
  const week52Low = '124.17';
  const volumeStr = liveData?.volume ? (liveData.volume / 1000000).toFixed(2) + 'M' : '52.78M';
  const avgVolStr = '48.32M';

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

  return (
    <div className={`border-b font-sans ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e121a] border-slate-800'}`}>
      
      {/* ================= ROW 1: INSTITUTIONAL BRANDING, PRICE & ACTION BUTTONS ================= */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Left: Symbol, Badge, Name & Live Price */}
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tight font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {stock.symbol}
                </h1>
                <span className="px-3 py-1 bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-600/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {stock.sector || 'TECHNOLOGY'}
                </span>
              </div>
              <div className={`text-sm font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {stock.name}
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Price Display */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ${priceNum.toFixed(2)}
                </span>
                <span className={`text-sm sm:text-base font-bold font-mono flex items-center gap-1 ${
                  isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {changeStr}
                  {isPos ? <ArrowUpRight className="w-4 h-4 inline" /> : <ArrowDownRight className="w-4 h-4 inline" />}
                </span>
              </div>
              <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>After Hours: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>${afterHoursPrice}</strong></span>
                <span className="text-emerald-500 font-semibold">+0.17 (+0.10%)</span>
              </div>
            </div>
          </div>

          {/* Center/Right: Quick Fundamental Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-6 justify-between xl:justify-end">
            
            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-5 text-xs">
              <div>
                <span className={`block font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Market Cap</span>
                <strong className={`font-mono font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{mktCap}</strong>
              </div>
              <div>
                <span className={`block font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>PE Ratio</span>
                <strong className={`font-mono font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{peRatio}</strong>
              </div>
              <div>
                <span className={`block font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Dividend Yield</span>
                <strong className={`font-mono font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{divYield}</strong>
              </div>
            </div>

            {/* Action Buttons: Watchlist & Trade */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-2xs ${
                  isWatchlisted
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                    : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
                }`}
              >
                <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {!hideTrade && (
                <button
                  onClick={onTradeClick}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                >
                  <DollarSign className="w-4 h-4 -mr-1" />
                  <span>Trade</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ================= EXTENDED LIVE MARKET BAR (BID/ASK, DAY HIGH/LOW, 52W HIGH/LOW) ================= */}
        <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs font-mono ${
          isLight ? 'border-slate-100 text-slate-600' : 'border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">Market Open</span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span>Bid/Ask: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{bidAskStr}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div>Day's Range: <strong className="text-rose-500">${dayLow}</strong> - <strong className="text-emerald-500">${dayHigh}</strong></div>
            <div>52W Range: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>${week52Low}</strong> - <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>${week52High}</strong></div>
            <div>Vol: <strong className="text-blue-500">{volumeStr}</strong></div>
            <div>Avg Vol: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{avgVolStr}</strong></div>
          </div>
        </div>

      </div>

      {/* ================= ROW 2: SUB-TOOLBAR (TIMEFRAMES, ENTERPRISE CONTROLS & VIEW TOGGLE) ================= */}
      <div className={`px-5 sm:px-6 py-2.5 border-t flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
        isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80 bg-[#0b0e14]/60'
      }`}>
        
        {/* Left: Timeframe Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-2 shrink-0">Timeframe:</span>
          {timeframes.map((tf) => {
            const active = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all shrink-0 ${
                  active
                    ? isLight
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/90'
                      : 'bg-slate-800 text-blue-400 shadow-xs border border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Tools (Alerts, Compare, Refresh, Screenshot, Full Screen) & View Mode */}
        <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
          
          {/* Action Buttons group */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAlertSet(!alertSet)}
              title="Set Price Alert"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                alertSet
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : isLight ? 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${alertSet ? 'fill-amber-500' : ''}`} />
              <span className="hidden xl:inline">Alert</span>
            </button>

            <button
              onClick={handleRefreshClick}
              title="Refresh Live Data Sync"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isLight ? 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <span className="hidden xl:inline">Refresh</span>
            </button>

            <button
              onClick={onScreenshot}
              title="Take Screenshot of Chart"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isLight ? 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onFullScreen}
              title="Toggle Full Screen Workspace"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isLight ? 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleSettings}
              title="Chart Settings Panel"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSettingsOpen
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : isLight ? 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Settings</span>
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          {/* View Mode Pills (Live Market vs Historical Data) */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isLight ? 'bg-slate-200/60 border-slate-300/60' : 'bg-slate-900 border-slate-800'
          }`}>
            {!hideTrade && (
              <button
                onClick={() => onViewModeChange('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewMode === 'live'
                    ? (isLight ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'bg-slate-800 text-white shadow-xs border border-slate-700')
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Market</span>
              </button>
            )}
            <button
              onClick={() => onViewModeChange('historical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                viewMode === 'historical' || hideTrade
                  ? (isLight ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'bg-slate-800 text-white shadow-xs border border-slate-700')
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Historical Data</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
