import React from 'react';
import { 
  Home, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Bell, 
  Star, 
  FileText, 
  User, 
  LogOut, 
  X, 
  PieChart,
  Settings
} from 'lucide-react';

export type AnalystTab = 
  | 'dashboard' 
  | 'research' 
  | 'screeners' 
  | 'analysis' 
  | 'fundamental' 
  | 'management' 
  | 'watchlist'
  | 'compare'
  | 'profile'
  | 'report_crafting'
  | 'settings';

interface AnalystSidebarProps {
  activeTab: AnalystTab;
  onSelectTab: (tab: AnalystTab) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  theme?: 'light' | 'dark';
}

const MENU_ITEMS: { id: AnalystTab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Analyst Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'research', label: 'Market Research', icon: <Search className="w-5 h-5" /> },
  { id: 'screeners', label: 'Screeners', icon: <Layers className="w-5 h-5" /> },
  { id: 'analysis', label: 'Analysis Tools', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'report_crafting', label: 'Report Crafting', icon: <FileText className="w-5 h-5" /> },
  { id: 'fundamental', label: 'Fundamental Analysis', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'management', label: 'Watchlist & Compare', icon: <Star className="w-5 h-5" /> },
  { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AnalystSidebar({
  activeTab,
  onSelectTab,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  theme = 'dark'
}: AnalystSidebarProps) {
  const isLight = theme === 'light';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-[61px] left-0 z-50 h-screen lg:h-[calc(100vh-61px)]
        ${isLight ? 'bg-white text-slate-800 border-r border-slate-200' : 'bg-[#131b2e] text-slate-200 border-r border-slate-800/80'}
        flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none
        ${isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Brand Header */}
        <div className={`p-5 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/80'} flex items-center justify-between transition-all ${isCollapsed ? 'lg:px-2 lg:py-4 flex-col justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Analyst Portal</span>
              <span className="block text-[11px] font-medium text-emerald-500">SQ Platform</span>
            </div>
          </div>
          {isMobileOpen && (
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className={`px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            Analyst Tools
          </p>
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'management' && (activeTab === 'watchlist' || activeTab === 'compare'));
            return (
              <button
                key={item.id}
                data-tab="true"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all sidebar-tab relative cursor-pointer ${
                  isCollapsed ? 'lg:justify-center lg:px-2' : ''
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : isLight ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                    {item.icon}
                  </span>
                  <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </div>
                {item.badge && !isCollapsed && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && (
                  <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 items-center gap-1.5">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className={`p-4 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-[#0b0f19]/50'} ${isCollapsed ? 'lg:p-2' : ''}`}>
          <div className={`flex items-center justify-between mb-4 px-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                A
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>Financial Analyst</p>
                <p className="text-xs text-slate-400 truncate">analyst@stockquery.com</p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer ${isCollapsed ? 'lg:px-2' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
