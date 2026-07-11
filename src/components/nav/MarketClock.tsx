import React, { useState, useEffect, useRef } from 'react';
import { Globe, Clock, ChevronDown, Check, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketClockProps {
  theme?: 'light' | 'dark';
}

export type ExchangeId = 'NYSE' | 'NASDAQ' | 'LSE' | 'TSE' | 'HKEX' | 'CRYPTO';

interface ExchangeInfo {
  id: ExchangeId;
  name: string;
  timeZone: string;
  currency: string;
  flag: string;
}

const EXCHANGES: ExchangeInfo[] = [
  { id: 'NYSE', name: 'New York Stock Exchange (EST)', timeZone: 'America/New_York', currency: 'USD', flag: '🇺🇸' },
  { id: 'NASDAQ', name: 'Nasdaq Stock Market (EST)', timeZone: 'America/New_York', currency: 'USD', flag: '🇺🇸' },
  { id: 'LSE', name: 'London Stock Exchange (GMT)', timeZone: 'Europe/London', currency: 'GBP', flag: '🇬🇧' },
  { id: 'TSE', name: 'Tokyo Stock Exchange (JST)', timeZone: 'Asia/Tokyo', currency: 'JPY', flag: '🇯🇵' },
  { id: 'HKEX', name: 'Hong Kong Stock Exchange (HKT)', timeZone: 'Asia/Hong_Kong', currency: 'HKD', flag: '🇭🇰' },
  { id: 'CRYPTO', name: 'Global Digital Assets (24/7)', timeZone: 'UTC', currency: 'USD/USDT', flag: '⚡' },
];

export default function MarketClock({ theme = 'light' }: MarketClockProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>(() => {
    return (localStorage.getItem('nav_selected_exchange') as ExchangeId) || 'NYSE';
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentEx = EXCHANGES.find(e => e.id === selectedExchange) || EXCHANGES[0];

  // Calculate formatted time and date
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Determine active market session dynamically
  const getMarketSession = (): { label: string; status: 'open' | 'pre' | 'after' | 'closed'; color: string; dot: string } => {
    if (selectedExchange === 'CRYPTO') {
      return { label: '24/7 Active Market', status: 'open', color: 'text-emerald-500 dark:text-emerald-400 font-bold', dot: 'bg-emerald-500 animate-pulse' };
    }

    try {
      // Get hour and day of week in target timezone
      const exTimeStr = currentTime.toLocaleString('en-US', { timeZone: currentEx.timeZone, hour12: false });
      const exDate = new Date(exTimeStr);
      const day = exDate.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = exDate.getHours();
      const minutes = exDate.getMinutes();
      const timeInMins = hours * 60 + minutes;

      // Weekend
      if (day === 0 || day === 6) {
        return { label: 'Market Closed (Wkend)', status: 'closed', color: 'text-rose-500 dark:text-rose-400 font-bold', dot: 'bg-rose-500' };
      }

      if (selectedExchange === 'NYSE' || selectedExchange === 'NASDAQ') {
        // 4:00 AM (240) to 9:30 AM (570) = Pre-Market
        // 9:30 AM (570) to 4:00 PM (960) = Market Open
        // 4:00 PM (960) to 8:00 PM (1200) = After Hours
        if (timeInMins >= 570 && timeInMins < 960) {
          return { label: 'Market Open', status: 'open', color: 'text-emerald-500 dark:text-emerald-400 font-bold', dot: 'bg-emerald-500 animate-pulse' };
        } else if (timeInMins >= 240 && timeInMins < 570) {
          return { label: 'Pre-Market Session', status: 'pre', color: 'text-amber-500 dark:text-amber-400 font-bold', dot: 'bg-amber-500 animate-pulse' };
        } else if (timeInMins >= 960 && timeInMins < 1200) {
          return { label: 'After Hours Trading', status: 'after', color: 'text-amber-500 dark:text-amber-400 font-bold', dot: 'bg-amber-500 animate-pulse' };
        } else {
          return { label: 'Market Closed', status: 'closed', color: 'text-rose-500 dark:text-rose-400 font-bold', dot: 'bg-rose-500' };
        }
      } else if (selectedExchange === 'LSE') {
        // 8:00 AM (480) to 4:30 PM (990)
        if (timeInMins >= 480 && timeInMins < 990) {
          return { label: 'Market Open', status: 'open', color: 'text-emerald-500 dark:text-emerald-400 font-bold', dot: 'bg-emerald-500 animate-pulse' };
        } else if (timeInMins >= 420 && timeInMins < 480) {
          return { label: 'Pre-Market Auction', status: 'pre', color: 'text-amber-500 dark:text-amber-400 font-bold', dot: 'bg-amber-500 animate-pulse' };
        } else {
          return { label: 'Market Closed', status: 'closed', color: 'text-rose-500 dark:text-rose-400 font-bold', dot: 'bg-rose-500' };
        }
      } else if (selectedExchange === 'TSE' || selectedExchange === 'HKEX') {
        // Asia 9:00 AM (540) to 3:00/4:00 PM (900/960)
        if (timeInMins >= 540 && timeInMins < 960) {
          return { label: 'Market Open', status: 'open', color: 'text-emerald-500 dark:text-emerald-400 font-bold', dot: 'bg-emerald-500 animate-pulse' };
        } else {
          return { label: 'Market Closed', status: 'closed', color: 'text-rose-500 dark:text-rose-400 font-bold', dot: 'bg-rose-500' };
        }
      }
    } catch (err) {
      // fallback
    }

    return { label: 'Market Open', status: 'open', color: 'text-emerald-500 dark:text-emerald-400 font-bold', dot: 'bg-emerald-500 animate-pulse' };
  };

  const session = getMarketSession();

  const handleSelectExchange = (id: ExchangeId) => {
    setSelectedExchange(id);
    localStorage.setItem('nav_selected_exchange', id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block select-none" ref={dropdownRef}>
      {/* Clock & Exchange Selector Pill */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-1 rounded-xl border text-left cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
            : isLight
            ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300'
            : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700'
        }`}
        title="Click to change Exchange & inspect Timezone Sessions"
      >
        {/* Flag / Globe */}
        <div className="text-sm shrink-0">{currentEx.flag}</div>

        {/* Time and Date */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
              {formattedTime}
            </span>
            <span className={`text-[10px] font-mono font-bold px-1 rounded ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {selectedExchange}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 leading-none">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${session.dot}`} />
            <span className={`text-[10px] font-mono truncate ${session.color}`}>
              {session.label}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {/* Exchange Selection Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden py-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
            }`}
          >
            <div className={`px-4 py-2 border-b flex items-center justify-between text-xs font-semibold ${
              isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Global Trading Exchanges</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{formattedDate}</span>
            </div>

            <div className="p-1.5 space-y-0.5">
              {EXCHANGES.map((ex) => {
                const isSelected = selectedExchange === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExchange(ex.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'bg-blue-600/20 text-blue-200 font-bold'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{ex.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{ex.id} • {ex.name.split(' (')[0]}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          Zone: {ex.timeZone} • Curr: {ex.currency}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className={`px-4 py-2 border-t text-[10px] font-mono flex items-center justify-between ${
              isLight ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
              <span>Active Session Telemetry</span>
              <span className="text-emerald-500 font-bold">Auto-Adjusting</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
