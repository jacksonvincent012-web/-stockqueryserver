import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ChevronDown, Check, Zap, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RefreshControlProps {
  onRefresh?: () => void;
  theme?: 'light' | 'dark';
}

export type AutoRefreshInterval = 'Off' | 1 | 5 | 10 | 30 | 60;

export default function RefreshControl({ onRefresh, theme = 'light' }: RefreshControlProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('Just now');
  const [autoInterval, setAutoInterval] = useState<AutoRefreshInterval>('Off');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Update "time ago" ticker every second
  useEffect(() => {
    const updateTicker = () => {
      const diffSecs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (diffSecs < 3) {
        setTimeAgo('Just now');
      } else if (diffSecs < 60) {
        setTimeAgo(`${diffSecs}s ago`);
      } else {
        const mins = Math.floor(diffSecs / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    const timer = setInterval(updateTicker, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Handle Auto-refresh interval
  useEffect(() => {
    if (autoInterval === 'Off') return;

    const intervalMs = (typeof autoInterval === 'number' ? autoInterval : 0) * 1000;
    if (intervalMs <= 0) return;

    const timer = setInterval(() => {
      triggerRefresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoInterval]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeAgo('Just now');
    if (onRefresh) {
      onRefresh();
    }
    window.dispatchEvent(new Event('app:refresh-live-data'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const intervals: { label: string; value: AutoRefreshInterval }[] = [
    { label: 'Off (Manual Only)', value: 'Off' },
    { label: 'Every 1 second', value: 1 },
    { label: 'Every 5 seconds', value: 5 },
    { label: 'Every 10 seconds', value: 10 },
    { label: 'Every 30 seconds', value: 30 },
    { label: 'Every 1 minute', value: 60 },
  ];

  return (
    <div className="relative inline-block text-left select-none" ref={menuRef}>
      <div className="flex items-center">
        {/* Main Refresh Pill Button */}
        <button
          onClick={triggerRefresh}
          className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-l-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs active:scale-95 ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80'
          }`}
          title="Refresh live data instantly without reload"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          <span className="hidden sm:inline font-semibold">Refresh</span>
          <span className={`hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            isLight ? 'bg-white border border-slate-200 text-slate-400' : 'bg-slate-800 text-slate-400'
          }`}>
            R
          </span>
        </button>

        {/* Dropdown Caret for Auto-Refresh Settings */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-1.5 py-1.5 rounded-r-xl border border-l-0 text-xs transition-all cursor-pointer shadow-2xs ${
            isOpen
              ? 'bg-blue-600 text-white border-blue-600'
              : isLight
              ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title="Configure Auto Refresh Intervals"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden py-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
            }`}
          >
            {/* Status Header */}
            <div className={`px-4 py-2.5 border-b mb-1 ${isLight ? 'bg-slate-50/80 border-slate-100' : 'bg-slate-900/80 border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Telemetry Feed</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{timeAgo}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Updates stock quotes, crypto, charts, portfolios, watchlists & alerts.
              </p>
            </div>

            {/* Auto Refresh Options */}
            <div className="px-3 py-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">
                Auto Refresh Frequency
              </span>
              <div className="mt-1 space-y-0.5">
                {intervals.map((opt) => {
                  const isSelected = autoInterval === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setAutoInterval(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'bg-blue-600/20 text-blue-300 font-bold'
                          : isLight
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className={`mt-1 pt-2 px-4 border-t text-[10px] font-mono flex items-center justify-between ${
              isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'
            }`}>
              <span>Zero reload streaming</span>
              <span className="font-bold text-emerald-500">WebSocket Ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
