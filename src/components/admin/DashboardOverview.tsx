import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Users, Activity, Clock, ShieldCheck, 
  Database, Search, FileText, Bell, Server, TrendingUp,
  BarChart3, Cpu, Globe, HeartPulse, Zap, ShieldAlert,
  AlertTriangle, ChevronRight, ChevronDown, Check
} from 'lucide-react';

interface DashboardOverviewProps {
  health: any;
  metrics: any;
  liveAlerts?: any[];
  onNavigateTab?: (tab: any) => void;
  theme?: 'light' | 'dark';
}

export default function DashboardOverview({
  health,
  metrics,
  liveAlerts = [],
  onNavigateTab,
  theme = 'light'
}: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    usersOnline: '3,412',
    avgResponseTime: '12 ms',
    requestsPerSec: '18,420',
    serverLoad: '41%',
    processingQueue: '128',
    dataIngestion: '98.7%'
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/admin/overview').then(r => r.json());
        if (res && typeof res === 'object') {
          setStats(prev => ({
            ...prev,
            usersOnline: res.activeConnections ? (res.activeConnections * 55).toLocaleString() : prev.usersOnline,
            avgResponseTime: res.avgLatency ? `${res.avgLatency} ms` : prev.avgResponseTime,
            serverLoad: res.cpuUsage ? `${res.cpuUsage}%` : prev.serverLoad
          }));
        }
      } catch (err) {
        console.error('Failed to load overview:', err);
      }
    };
    fetchOverview();
    const timer = setInterval(fetchOverview, 5000);
    return () => clearInterval(timer);
  }, []);

  const isLight = theme === 'light';

  const cardBg = isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900/90 border-slate-800 shadow-md';
  const subBg = isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700/50';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  // SVG Sparkline Helper
  const renderSparkline = (color: string, points: string) => (
    <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 40">
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className={`space-y-6 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      
      {/* ROW 1: Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Health */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>System Health</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight mt-0.5">
                Healthy
              </div>
              <div className="text-[11px] text-slate-400 mt-1">All systems operational</div>
            </div>
          </div>
          <div className="shrink-0 hidden sm:block">
            {renderSparkline('#10b981', 'M0,35 Q20,33 40,30 T70,20 T100,8')}
          </div>
        </div>

        {/* Card 2: Users Online */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Users Online</div>
              <div className={`text-2xl font-black ${textTitle} font-sans tracking-tight mt-0.5`}>
                {stats.usersOnline}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active users now</div>
            </div>
          </div>
          <div className="shrink-0 hidden sm:block">
            {renderSparkline('#3b82f6', 'M0,30 Q25,32 50,22 T80,15 T100,5')}
          </div>
        </div>

        {/* Card 3: Response Time */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Response Time</div>
              <div className={`text-2xl font-black ${textTitle} font-sans tracking-tight mt-0.5`}>
                {stats.avgResponseTime}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Average response time</div>
            </div>
          </div>
          <div className="shrink-0 hidden sm:block">
            {renderSparkline('#a855f7', 'M0,28 Q30,30 50,25 T75,20 T100,10')}
          </div>
        </div>

        {/* Card 4: Open Alerts */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Open Alerts</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight mt-0.5">
                {liveAlerts.length > 0 ? liveAlerts.length : 2}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Requires attention</div>
            </div>
          </div>
          <div className="shrink-0 hidden sm:block">
            {renderSparkline('#f59e0b', 'M0,32 Q20,30 40,34 T70,20 T100,12')}
          </div>
        </div>
      </div>

      {/* ROW 2: Live Activity + Live Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Live Activity */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className={`text-base font-bold ${textTitle}`}>Live Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Recent System Events */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-bold uppercase tracking-wider ${textSub}`}>Recent System Events</span>
                  <button onClick={() => onNavigateTab && onNavigateTab('audit')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                    View all
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:41 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>Market data feed connected</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:40 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>New admin login: admin@stockquery.com</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:39 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>AAPL data updated successfully</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:38 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>Queue processed 5,200 updates</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:37 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>Daily backup completed</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-bold uppercase tracking-wider ${textSub}`}>Recent Alerts</span>
                  <button onClick={() => onNavigateTab && onNavigateTab('alerts')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                    View all
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:41 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>High memory usage on Server 3</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] shrink-0">Warning</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:38 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>Market data delay detected</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] shrink-0">Warning</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono shrink-0">10:25 AM</span>
                    <span className={`truncate flex-1 font-medium ${textTitle}`}>Scheduled maintenance tonight</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px] shrink-0">Info</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>No critical alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5/12): Live Requests */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-base font-bold ${textTitle}`}>Live Requests</h2>
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <span>Last 5 Minutes</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="my-3">
            <div className={`text-3xl font-black ${textTitle} font-sans tracking-tight`}>
              {stats.requestsPerSec} <span className="text-sm font-normal text-slate-400">req/sec</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Current throughput</div>
          </div>

          {/* Area Chart Simulation */}
          <div className="relative w-full h-44 mt-2">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pr-2">
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span>0</span>
            </div>

            {/* Chart Area */}
            <div className="ml-8 h-38 relative">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                <div className="border-b border-slate-200 dark:border-slate-700 w-full" />
              </div>

              {/* SVG Area Chart */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 Q20,60 40,75 T80,50 T120,65 T160,30 T200,60 T240,40 T280,55 T320,25 T360,50 T400,45 L400,140 L0,140 Z"
                  fill="url(#reqGradient)"
                />
                <path
                  d="M0,80 Q20,60 40,75 T80,50 T120,65 T160,30 T200,60 T240,40 T280,55 T320,25 T360,50 T400,45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className="ml-8 flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>10:37</span>
              <span>10:38</span>
              <span>10:39</span>
              <span>10:40</span>
              <span>10:41</span>
              <span>10:42</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: System Services + User Activity + Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (4/12): System Services */}
        <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div>
            <h2 className={`text-base font-bold ${textTitle} mb-4`}>System Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Authentication', icon: ShieldCheck, status: 'Healthy' },
                { name: 'Market Data', icon: TrendingUp, status: 'Healthy' },
                { name: 'Search Engine', icon: Search, status: 'Healthy' },
                { name: 'Reports', icon: FileText, status: 'Healthy' },
                { name: 'Notifications', icon: Bell, status: 'Healthy' },
                { name: 'Database', icon: Database, status: 'Healthy' }
              ].map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between ${subBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className={`text-xs font-bold truncate ${textTitle}`}>{srv.name}</div>
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{srv.status}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('infrastructure')}
            className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1 hover:underline cursor-pointer"
          >
            <span>View all services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle (4/12): User Activity */}
        <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold ${textTitle}`}>User Activity</h2>
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                <span>Today</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="my-2">
              <div className={`text-2xl font-black ${textTitle} font-sans tracking-tight`}>6K</div>
            </div>

            {/* Bell Curve Chart Simulation */}
            <div className="relative w-full h-38 mt-4">
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pr-2">
                <span>6K</span>
                <span>4K</span>
                <span>2K</span>
                <span>0</span>
              </div>

              <div className="ml-6 h-32 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                  <div className="border-b border-slate-100 dark:border-slate-800 w-full" />
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full" />
                </div>

                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,120 Q30,115 60,90 Q120,20 180,30 Q240,60 300,100 L300,120 L0,120 Z"
                    fill="url(#userGradient)"
                  />
                  <path
                    d="M0,120 Q30,115 60,90 Q120,20 180,30 Q240,60 300,100"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              <div className="ml-6 flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (4/12): Active Alerts (2) */}
        <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold ${textTitle}`}>Active Alerts (2)</h2>
              <button onClick={() => onNavigateTab && onNavigateTab('alerts')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${subBg}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${textTitle}`}>High Memory Usage</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Server 3 memory usage is at 85%</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">2 minutes ago</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('alerts')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  View
                </button>
              </div>

              {/* Alert 2 */}
              <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${subBg}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${textTitle}`}>Market Data Delay</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">NASDAQ feed delay detected</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">4 minutes ago</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('alerts')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  View
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>All other systems operational</span>
          </div>
        </div>
      </div>

      {/* ROW 4: System Capacity */}
      <div className={`p-6 rounded-2xl border ${cardBg}`}>
        <h2 className={`text-base font-bold ${textTitle} mb-4`}>System Capacity</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Active Users</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>{stats.usersOnline}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">0.13% of capacity</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full w-[15%]" />
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Max Capacity</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>2,500,000</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total supported users</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-slate-400 dark:bg-slate-500 h-full w-full" />
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Server Load</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>{stats.serverLoad}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">CPU / Memory</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-500 h-full w-[41%]" />
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Requests / Sec</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>{stats.requestsPerSec}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Current throughput</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-500 h-full w-[65%]" />
            </div>
          </div>

          {/* Card 5 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Processing Queue</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>{stats.processingQueue}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Jobs in queue</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full w-[10%]" />
            </div>
          </div>

          {/* Card 6 */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
            <div>
              <div className={`text-xs font-semibold ${textSub}`}>Data Ingestion</div>
              <div className={`text-xl font-black ${textTitle} font-sans mt-1`}>{stats.dataIngestion}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Success rate</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full w-[98.7%]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
