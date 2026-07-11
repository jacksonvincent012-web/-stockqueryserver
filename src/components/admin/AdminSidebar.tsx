import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Database, 
  Bell, 
  Zap, 
  Beaker, 
  Users, 
  Settings, 
  LogOut,
  Server,
  Activity,
  HeartPulse,
  Maximize,
  Network,
  LifeBuoy,
  FileText,
  ScrollText,
  TerminalSquare,
  BarChart3,
  Cpu,
  ChevronDown,
  ChevronUp,
  CreditCard
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'users'
  | 'transactions'
  | 'health'
  | 'market' 
  | 'queue' 
  | 'alerts' 
  | 'performance' 
  | 'reports'
  | 'benchmarks' 
  | 'settings'
  | 'operations'
  | 'audit'
  | 'support'
  | 'capacity'
  | 'infrastructure'
  | 'tickers';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  systemMode?: string;
  isCollapsed?: boolean;
  theme?: 'light' | 'dark';
  onQuickAction?: (action: string) => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen = false,
  onCloseMobile,
  systemMode = 'LIVE',
  isCollapsed = false,
  theme = 'light',
  onQuickAction
}: AdminSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const monitoringFeed = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Platform health & capacity', icon: LayoutDashboard },
    { id: 'health', label: 'Platform Health', desc: 'Real-time diagnostic checks', icon: HeartPulse },
    { id: 'capacity', label: 'System Capacity', desc: 'Resource utilization limits', icon: BarChart3 },
    { id: 'infrastructure', label: 'Infrastructure Health', desc: 'Network & server nodes', icon: Server },
    { id: 'market', label: 'Market Monitor', desc: 'Monitor market activity', icon: TrendingUp },
    { id: 'queue', label: 'Data Processing', desc: 'Incoming market updates', icon: Database },
  ] as const;

  const controlOperations = [
    { id: 'transactions', label: 'Transactions & AML', desc: 'Deposits, withdrawals & revenue', icon: CreditCard },
    { id: 'alerts', label: 'Alerts', desc: 'Platform event notifications', icon: Bell },
    { id: 'users', label: 'Users', desc: 'Manage administrators & analysts', icon: Users },
    { id: 'support', label: 'Support', desc: 'Manage support tickets', icon: LifeBuoy },
    { id: 'reports', label: 'Reports', desc: 'Platform & activity reports', icon: FileText },
    { id: 'audit', label: 'Audit Logs', desc: 'System event tracing', icon: ScrollText },
  ] as const;

  const systemResources = [
    { id: 'operations', label: 'Operations Center', desc: 'Execute system commands', icon: TerminalSquare },
    { id: 'performance', label: 'Performance', desc: 'Platform speed & efficiency', icon: Zap },
    { id: 'benchmarks', label: 'Benchmarks', desc: 'Measure system limits', icon: Beaker },
    { id: 'settings', label: 'Settings', desc: 'Configure platform behavior', icon: Settings },
    { id: 'tickers', label: 'Market Directory', desc: 'Manage companies & market data connections', icon: Database },
  ] as const;

  const handleSelect = (id: AdminTab) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const isLight = theme === 'light';

  const renderSection = (title: string, items: readonly any[], secKey: string) => {
    const isSecCollapsed = collapsedSections[secKey];
    return (
      <div key={secKey} className="space-y-1">
        <button
          onClick={() => toggleSection(secKey)}
          className={`w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
        >
          <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>• {title}</span>
          {!isCollapsed && (isSecCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />)}
          {isCollapsed && <span className="hidden lg:inline">•</span>}
        </button>
        {(!isSecCollapsed || isCollapsed) && (
          <div className="space-y-1 mt-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tab="true"
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleSelect(item.id as AdminTab)}
                  className={`
                    w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all text-left group sidebar-tab relative cursor-pointer
                    ${isCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : ''}
                    ${isActive 
                      ? isLight 
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold' 
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                      : isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : isLight 
                        ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800' 
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item.label}
                    </div>
                    <div className={`text-[11px] truncate leading-snug mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </div>

                  {isCollapsed && (
                    <div className="hidden lg:flex absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex-col">
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 h-screen lg:h-[calc(100vh-61px)]
        ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0A0E17] border-slate-800/80 text-slate-200'}
        border-r flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        {/* Brand Header */}
        <div className={`p-4 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-[#0A0E17]'} transition-all ${isCollapsed ? 'lg:px-2 lg:py-4 flex flex-col items-center' : 'p-4'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className={`text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase ${isCollapsed ? 'lg:hidden' : ''}`}>
              PLATFORM OPERATIONS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div className={`${isCollapsed ? 'lg:hidden' : ''} min-w-0`}>
              <h2 className={`text-sm font-bold leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Stock Query Server
              </h2>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate leading-tight mt-0.5">
                Monitor, manage, and maintain the Stock Query Server platform.
              </div>
            </div>
          </div>

          {!isCollapsed && (
            <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[11px]">OPERATIONAL MODE:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>[ {systemMode} ]</span>
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {renderSection('MONITORING FEED', monitoringFeed, 'feed')}
          {renderSection('CONTROL OPERATIONS', controlOperations, 'control')}
          {renderSection('SYSTEM & RESOURCES', systemResources, 'sys')}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t ${isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-slate-800/80 bg-[#0A0E17]'} ${isCollapsed ? 'lg:p-2 flex justify-center' : 'flex items-center justify-between'}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[11px] font-mono font-bold tracking-wider uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'} ${isCollapsed ? 'lg:hidden' : ''}`}>
              PLATFORM OPERATIONS
            </span>
          </div>
          {!isCollapsed && (
            <button
              onClick={onLogout}
              title="Logout"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
