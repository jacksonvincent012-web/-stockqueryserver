import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Activity, Server, ShieldAlert, ShieldCheck,
  TrendingUp, Search, FileText, Bell, Database, RotateCw,
  ChevronRight, Cpu, HardDrive, Network, LayoutGrid
} from 'lucide-react';

interface PlatformHealthViewProps {
  theme?: 'light' | 'dark';
}

const Sparkline = ({ data, color = 'emerald' }: { data: number[]; color?: 'emerald' | 'blue' | 'purple' }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 240;
  const height = 44;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  const colorConfig = {
    emerald: {
      stroke: '#10b981',
      gradId: 'spark-grad-emerald',
      gradStart: '#10b981',
    },
    blue: {
      stroke: '#3b82f6',
      gradId: 'spark-grad-blue',
      gradStart: '#3b82f6',
    },
    purple: {
      stroke: '#8b5cf6',
      gradId: 'spark-grad-purple',
      gradStart: '#8b5cf6',
    }
  }[color];

  return (
    <div className="w-full h-11 mt-2 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={colorConfig.gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorConfig.gradStart} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colorConfig.gradStart} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#${colorConfig.gradId})`} />
        <polyline
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

export default function PlatformHealthView({ theme = 'light' }: PlatformHealthViewProps) {
  const [lastUpdated, setLastUpdated] = useState('10:42 AM, May 28, 2026');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLight = theme === 'light';
  const cardBg = isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-md';
  const innerCardBg = isLight ? 'bg-slate-50/70 border-slate-200/80' : 'bg-slate-800/40 border-slate-700/60';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setLastUpdated(`${timeStr}, ${dateStr}`);
      setIsRefreshing(false);
    }, 600);
  };

  const services = [
    { name: 'User Authentication', desc: 'Login and user management', icon: ShieldCheck, status: 'Healthy', latency: '8 ms', uptime: '99.99%' },
    { name: 'Market Data Feed', desc: 'Real-time market data service', icon: TrendingUp, status: 'Healthy', latency: '15 ms', uptime: '99.98%' },
    { name: 'Search Service', desc: 'Company and symbol search', icon: Search, status: 'Healthy', latency: '9 ms', uptime: '99.99%' },
    { name: 'Reports Service', desc: 'Reports generation and export', icon: FileText, status: 'Healthy', latency: '18 ms', uptime: '99.97%' },
    { name: 'Notifications Service', desc: 'Alerts and notifications', icon: Bell, status: 'Healthy', latency: '11 ms', uptime: '99.99%' },
    { name: 'Database', desc: 'Primary database service', icon: Database, status: 'Healthy', latency: '7 ms', uptime: '99.99%' },
  ];

  const recentAlerts = [
    { time: '10:38 AM', alert: 'High memory usage on Server 3', service: 'Database', severity: 'Warning', status: 'Active' },
    { time: '10:25 AM', alert: 'Market data delay detected', service: 'Market Data Feed', severity: 'Warning', status: 'Active' },
    { time: '10:10 AM', alert: 'Search service response slow', service: 'Search Service', severity: 'Info', status: 'Resolved' },
  ];

  return (
    <div className={`space-y-6 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'} pb-12`}>
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textTitle}`}>
            Platform Health
          </h1>
          <p className={`text-xs sm:text-sm ${textSub} mt-1`}>
            Real-time health status of all platform services
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`text-xs ${textSub} font-medium`}>
            Last updated: <span className={textTitle}>{lastUpdated}</span>
          </span>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all shadow-2xs font-semibold text-xs cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-700 active:scale-95'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 active:scale-95'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. FIVE TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Overall Status */}
        <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${textTitle}`}>Overall Status</span>
          </div>
          <div className="mt-4 mb-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              Healthy
            </span>
          </div>
          <p className={`text-[11px] ${textSub}`}>All systems are running normally</p>
        </div>

        {/* Card 2: Uptime */}
        <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${textTitle}`}>Uptime</span>
          </div>
          <div className="mt-4 mb-1">
            <span className={`text-2xl font-black ${textTitle} tracking-tight`}>
              99.98%
            </span>
          </div>
          <p className={`text-[11px] ${textSub}`}>Last 30 days</p>
        </div>

        {/* Card 3: Response Time */}
        <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${textTitle}`}>Response Time</span>
          </div>
          <div className="mt-4 mb-1">
            <span className={`text-2xl font-black ${textTitle} tracking-tight`}>
              12.4 ms
            </span>
          </div>
          <p className={`text-[11px] ${textSub}`}>Average</p>
        </div>

        {/* Card 4: Services */}
        <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${textTitle}`}>Services</span>
          </div>
          <div className="mt-4 mb-1">
            <span className={`text-2xl font-black ${textTitle} tracking-tight`}>
              6 / 6
            </span>
          </div>
          <p className={`text-[11px] ${textSub}`}>All services healthy</p>
        </div>

        {/* Card 5: Incidents */}
        <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${textTitle}`}>Incidents</span>
          </div>
          <div className="mt-4 mb-1">
            <span className={`text-2xl font-black ${textTitle} tracking-tight`}>
              0
            </span>
          </div>
          <p className={`text-[11px] ${textSub}`}>No active incidents</p>
        </div>
      </div>

      {/* 3. ROW 2: SYSTEM SERVICES & SYSTEM METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: System Services */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div>
            <div className="mb-5">
              <h2 className={`text-base sm:text-lg font-bold ${textTitle}`}>System Services</h2>
              <p className={`text-xs ${textSub} mt-0.5`}>Health status of all platform services</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="pb-3 pl-1">Service</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Response Time</th>
                    <th className="pb-3 pr-1 text-right">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {services.map((srv, idx) => {
                    const Icon = srv.icon;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 pl-1 pr-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className={`font-bold ${textTitle} text-xs sm:text-sm`}>{srv.name}</div>
                              <div className={`text-[11px] ${textSub} mt-0.5 truncate`}>{srv.desc}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-semibold">
                            {srv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {srv.latency}
                        </td>
                        <td className="py-3.5 pr-1 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <span>{srv.uptime}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
              <span>View all services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Panel: System Metrics */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg}`}>
          <div className="mb-5">
            <h2 className={`text-base sm:text-lg font-bold ${textTitle}`}>System Metrics</h2>
            <p className={`text-xs ${textSub} mt-0.5`}>Live performance metrics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: CPU Usage */}
            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${textTitle}`}>CPU Usage</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                  Normal
                </span>
              </div>
              <div className={`text-xl font-black ${textTitle}`}>23%</div>
              <Sparkline color="emerald" data={[21, 23, 20, 24, 22, 25, 27, 24, 26, 23, 25, 22, 23]} />
            </div>

            {/* Metric 2: Memory Usage */}
            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${textTitle}`}>Memory Usage</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                  Normal
                </span>
              </div>
              <div className={`text-xl font-black ${textTitle}`}>46%</div>
              <Sparkline color="emerald" data={[44, 45, 43, 46, 47, 45, 46, 48, 47, 45, 48, 49, 46]} />
            </div>

            {/* Metric 3: Disk Usage */}
            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${textTitle}`}>Disk Usage</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                  Normal
                </span>
              </div>
              <div className={`text-xl font-black ${textTitle}`}>31%</div>
              <Sparkline color="emerald" data={[30, 31, 30, 32, 31, 33, 31, 32, 30, 31, 32, 31, 31]} />
            </div>

            {/* Metric 4: Network I/O */}
            <div className={`p-4 rounded-xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${textTitle}`}>Network I/O</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                  Normal
                </span>
              </div>
              <div className={`text-xl font-black ${textTitle}`}>128 Mbps</div>
              <Sparkline color="blue" data={[115, 120, 118, 125, 130, 122, 128, 135, 130, 138, 132, 126, 128]} />
            </div>

            {/* Metric 5: Active Connections (Full Width) */}
            <div className={`p-4 rounded-xl border ${innerCardBg} sm:col-span-2`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${textTitle}`}>Active Connections</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                  Normal
                </span>
              </div>
              <div className={`text-xl font-black ${textTitle}`}>1,248</div>
              <Sparkline color="purple" data={[1180, 1210, 1190, 1230, 1250, 1210, 1240, 1270, 1230, 1260, 1280, 1240, 1248]} />
            </div>
          </div>
        </div>

      </div>

      {/* 4. ROW 3: RECENT ALERTS & SYSTEM INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Recent Alerts */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div>
            <div className="mb-5">
              <h2 className={`text-base sm:text-lg font-bold ${textTitle}`}>Recent Alerts</h2>
              <p className={`text-xs ${textSub} mt-0.5`}>Latest system alerts and notifications</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="pb-3 pl-1">Time</th>
                    <th className="pb-3 px-2">Alert</th>
                    <th className="pb-3 px-2">Service</th>
                    <th className="pb-3 px-2">Severity</th>
                    <th className="pb-3 pr-1 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {recentAlerts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-1 pr-2 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className={`py-3.5 px-2 font-medium ${textTitle}`}>
                        {item.alert}
                      </td>
                      <td className={`py-3.5 px-2 ${textSub} whitespace-nowrap`}>
                        {item.service}
                      </td>
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.severity === 'Warning'
                            ? 'bg-amber-100/80 text-amber-800 border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                            : 'bg-blue-100/80 text-blue-800 border-blue-200/60 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3.5 pr-1 text-right whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border inline-block ${
                          item.status === 'Active'
                            ? 'bg-rose-100/80 text-rose-800 border-rose-200/60 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                            : 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
              <span>View all alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Panel: System Information */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg}`}>
          <div className="mb-5">
            <h2 className={`text-base sm:text-lg font-bold ${textTitle}`}>System Information</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Platform Version</span>
              <span className={`font-mono font-bold ${textTitle}`}>v2.4.1</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Environment</span>
              <span className={`font-medium ${textTitle}`}>Production</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Data Center</span>
              <span className={`font-medium ${textTitle}`}>AWS - US East (N. Virginia)</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Server Time</span>
              <span className={`font-mono ${textTitle}`}>May 28, 2026 10:42 AM (UTC)</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Auto Scaling</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-semibold text-[11px]">
                Enabled
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className={textSub}>Backup Status</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-semibold text-[11px]">
                Completed
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
