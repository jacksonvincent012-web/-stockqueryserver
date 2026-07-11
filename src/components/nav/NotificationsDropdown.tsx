import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Search, Filter, ArrowRight, ShieldAlert, DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, HelpCircle, Zap, ShieldCheck, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type NotificationCategory =
  | 'Orders Executed'
  | 'Price Alerts'
  | 'Deposits'
  | 'Withdrawals'
  | 'Transfers'
  | 'Security Alerts'
  | 'Verification Requests'
  | 'Analyst Reports'
  | 'Support Messages'
  | 'Platform Updates';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  unread: boolean;
  targetPage?: string;
}

interface NotificationsDropdownProps {
  onNavigate?: (page: string, category: NotificationCategory) => void;
  theme?: 'light' | 'dark';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'NVDA Limit Order Executed',
    message: 'Bought 100 shares of NVIDIA Corp @ $1,280.40. Total settlement $128,040.00.',
    category: 'Orders Executed',
    timestamp: '2 mins ago',
    unread: true,
    targetPage: 'portfolio'
  },
  {
    id: 'n-2',
    title: 'Price Alert: BTC crossed $68,000',
    message: 'Bitcoin has exceeded your upper resistance threshold of $68,000.00.',
    category: 'Price Alerts',
    timestamp: '14 mins ago',
    unread: true,
    targetPage: 'market'
  },
  {
    id: 'n-3',
    title: 'Wire Deposit Settled ($50,000.00)',
    message: 'Institutional wire transfer from Chase Bank has been credited to your wallet balance.',
    category: 'Deposits',
    timestamp: '1 hour ago',
    unread: true,
    targetPage: 'wallet'
  },
  {
    id: 'n-4',
    title: 'New Analyst Report Available',
    message: 'Q2 Institutional Alpha Report on Semiconductor Sector Risk is ready for download.',
    category: 'Analyst Reports',
    timestamp: '3 hours ago',
    unread: false,
    targetPage: 'reports'
  },
  {
    id: 'n-5',
    title: 'Security Alert: New Login from macOS',
    message: 'We detected an authenticated login from Apple Safari in London, United Kingdom.',
    category: 'Security Alerts',
    timestamp: 'Yesterday',
    unread: false,
    targetPage: 'security'
  },
  {
    id: 'n-6',
    title: 'KYC Level 3 Verified',
    message: 'Your institutional corporate verification documentation has been formally approved.',
    category: 'Verification Requests',
    timestamp: '2 days ago',
    unread: false,
    targetPage: 'profile'
  },
  {
    id: 'n-7',
    title: 'Support Ticket #402 Updated',
    message: 'Admin engineer assigned to investigate WebSocket latency jitter on US-East node.',
    category: 'Support Messages',
    timestamp: '3 days ago',
    unread: false,
    targetPage: 'support'
  },
  {
    id: 'n-8',
    title: 'Platform v2.5 Institutional Update',
    message: 'New multi-stock grid comparison and real-time sector simulation engines deployed.',
    category: 'Platform Updates',
    timestamp: '5 days ago',
    unread: false,
    targetPage: 'dashboard'
  },
  {
    id: 'n-9',
    title: 'Withdrawal Processed (5.00 ETH)',
    message: 'On-chain withdrawal to hardware wallet 0x71C...8932 confirmed with 12 confirmations.',
    category: 'Withdrawals',
    timestamp: '1 week ago',
    unread: false,
    targetPage: 'wallet'
  },
  {
    id: 'n-10',
    title: 'Treasury Transfer Completed',
    message: 'Transferred $25,000.00 from Operational Buffer to High Dividend Yield Portfolio.',
    category: 'Transfers',
    timestamp: '1 week ago',
    unread: false,
    targetPage: 'wallet'
  }
];

export default function NotificationsDropdown({ onNavigate, theme = 'light' }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isLight = theme === 'light';
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(item.targetPage || 'dashboard', item.category);
    }
  };

  const categories: string[] = [
    'All',
    'Orders Executed',
    'Price Alerts',
    'Deposits',
    'Withdrawals',
    'Transfers',
    'Security Alerts',
    'Verification Requests',
    'Analyst Reports',
    'Support Messages',
    'Platform Updates'
  ];

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'Orders Executed': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'Price Alerts': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Deposits': return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      case 'Withdrawals': return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'Transfers': return <DollarSign className="w-4 h-4 text-teal-500" />;
      case 'Security Alerts': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'Verification Requests': return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'Analyst Reports': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'Support Messages': return <HelpCircle className="w-4 h-4 text-cyan-500" />;
      case 'Platform Updates': return <ShieldCheck className="w-4 h-4 text-slate-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="relative inline-block select-none" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
          isOpen
            ? 'bg-blue-600 text-white'
            : isLight
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="Institutional Notifications Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Modal / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-80 sm:w-96 md:w-[440px] rounded-2xl shadow-2xl border z-50 overflow-hidden flex flex-col max-h-[85vh] ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f1523] border-slate-800 text-slate-100'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm">Notifications Center</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Search Input Bar */}
            <div className={`px-3 py-2 border-b flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-100' : 'bg-[#0e1420] border-slate-800/80'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, transactions, orders..."
                className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Category Filter Horizontal Scroll with Start/End Arrows */}
            <div className={`px-2 py-2 border-b flex items-center gap-1 select-none ${
              isLight ? 'bg-slate-50/80 border-slate-100' : 'bg-slate-900/80 border-slate-800/80'
            }`}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleScrollTabs('left'); }}
                className={`p-1.5 rounded-lg shrink-0 transition-all font-bold cursor-pointer flex items-center justify-center shadow-2xs ${
                  isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title="Scroll tabs left (Start)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={tabsContainerRef}
                className="overflow-x-hidden scroll-smooth flex items-center gap-1.5 flex-1 py-0.5 px-1"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleScrollTabs('right'); }}
                className={`p-1.5 rounded-lg shrink-0 transition-all font-bold cursor-pointer flex items-center justify-center shadow-2xs ${
                  isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title="Scroll tabs right (End)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No notifications found</p>
                  <p className="text-xs text-slate-400 mt-1">Try selecting a different category or resetting your search filter.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative ${
                      item.unread
                        ? isLight
                          ? 'bg-blue-50/40 hover:bg-blue-50/80'
                          : 'bg-blue-950/20 hover:bg-blue-950/40'
                        : isLight
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isLight ? 'bg-slate-100' : 'bg-slate-800/80'
                    }`}>
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold truncate ${
                          item.unread
                            ? isLight ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold'
                            : isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                        {item.targetPage && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline">
                            <span>Open {item.targetPage}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {item.unread && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" title="Unread" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={`p-2.5 border-t text-center text-[11px] font-mono ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span>Institutional Telemetry Feed • Auto-Archived after 30 days</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
