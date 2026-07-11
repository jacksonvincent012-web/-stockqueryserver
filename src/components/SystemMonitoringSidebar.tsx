import React from 'react';
import { Briefcase, Search, Star, Wallet, User, Bell, X, ShieldCheck, BarChart2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemMonitoringSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemMonitoringSidebar({
  activeTab,
  setActiveTab,
  theme,
  isOpen,
  onClose
}: SystemMonitoringSidebarProps) {
  const navItems = [
    { id: 'portfolio', label: 'Portfolio', desc: 'Track investments & asset allocation', icon: Briefcase },
    { id: 'trade', label: 'Trade & Search', desc: 'Find assets, buy, and sell', icon: Search },
    { id: 'compare', label: 'Compare Stocks', desc: 'Compare stats and charts across stocks', icon: BarChart2 },
    { id: 'watchlists', label: 'Watchlists', desc: 'Monitor your favorite stocks', icon: Star },
    { id: 'wallet', label: 'Digital Wallet', desc: 'Manage funds & view transaction ledger', icon: Wallet },
    { id: 'profile', label: 'User Profile', desc: 'Manage account, identity & security', icon: User },
    { id: 'alerts', label: 'Alerts', desc: 'Price triggers & notifications', icon: Bell },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: -10 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-2xl shadow-2xl relative z-50"
        >
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-xs shadow-blue-500/50"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
                  Active Page Navigation
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
                title="Close Navigation Tray"
              >
                <span>Close Panel</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold font-sans uppercase tracking-wider shadow-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm font-sans transition-colors ${
                        isActive ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Panel Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Security Verified
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                <span>Port 3000 Container Ingress</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Select any tab to smoothly transition active module view</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
