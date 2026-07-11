import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Activity, Server, ShieldCheck,
  TrendingUp, Search, FileText, Bell, Database, RotateCw,
  ChevronRight, Cpu, HardDrive, Network, LayoutGrid,
  BarChart3, Users, Zap, ShieldAlert, Calendar, Info,
  Download, Play, Eye, RefreshCw, Settings, Sliders
} from 'lucide-react';

interface CapacityViewProps {
  theme?: 'light' | 'dark';
}

const Sparkline = ({ data, color = 'emerald' }: { data: number[]; color?: 'emerald' | 'blue' | 'purple' }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 160;
  const height = 36;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  const colorConfig = {
    emerald: {
      stroke: '#10b981',
      gradId: 'cap-spark-emerald',
      gradStart: '#10b981',
    },
    blue: {
      stroke: '#3b82f6',
      gradId: 'cap-spark-blue',
      gradStart: '#3b82f6',
    },
    purple: {
      stroke: '#8b5cf6',
      gradId: 'cap-spark-purple',
      gradStart: '#8b5cf6',
    }
  }[color];

  return (
    <div className="w-28 sm:w-32 h-8 overflow-hidden shrink-0">
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

const UsersOverTimeChart = ({ isLight }: { isLight: boolean }) => {
  const width = 500;
  const height = 220;

  // Data series (approximate values over 30 days)
  const monthlyData = [70, 105, 120, 115, 130, 145, 145, 160, 160, 175, 165, 180];
  const weeklyData = [30, 55, 65, 60, 70, 85, 90, 85, 95, 90, 85, 105];
  const dailyData = [10, 20, 25, 25, 28, 30, 45, 45, 50, 48, 52, 60];

  const maxVal = 200;

  const getPoints = (arr: number[]) => {
    return arr.map((val, i) => {
      const x = (i / (arr.length - 1)) * (width - 40) + 30;
      const y = height - 30 - (val / maxVal) * (height - 40);
      return `${x},${y}`;
    }).join(' ');
  };

  const monthlyPoints = getPoints(monthlyData);
  const weeklyPoints = getPoints(weeklyData);
  const dailyPoints = getPoints(dailyData);

  const gridColor = isLight ? '#f1f5f9' : '#334155';
  const textColor = isLight ? '#64748b' : '#94a3b8';

  return (
    <div className="w-full h-56 mt-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chart-grad-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="chart-grad-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="chart-grad-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 50, 100, 150, 200].map((val, i) => {
          const y = height - 30 - (val / maxVal) * (height - 40);
          return (
            <g key={val}>
              <line x1="30" y1={y} x2={width} y2={y} stroke={gridColor} strokeWidth="1" strokeDasharray="4 4" />
              <text x="0" y={y + 4} fill={textColor} fontSize="10" fontFamily="sans-serif" fontWeight="500">
                {val === 0 ? '0' : `${val}K`}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {['Apr 28', 'May 5', 'May 12', 'May 19', 'May 26', 'May 28'].map((label, i) => {
          const x = 30 + (i / 5) * (width - 40);
          return (
            <text key={label} x={x} y={height - 8} fill={textColor} fontSize="10" fontFamily="sans-serif" fontWeight="500" textAnchor="middle">
              {label}
            </text>
          );
        })}

        {/* Monthly Area & Line (Purple) */}
        <polygon points={`30,${height - 30} ${monthlyPoints} ${width - 10},${height - 30}`} fill="url(#chart-grad-purple)" />
        <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={monthlyPoints} />

        {/* Weekly Area & Line (Green) */}
        <polygon points={`30,${height - 30} ${weeklyPoints} ${width - 10},${height - 30}`} fill="url(#chart-grad-green)" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={weeklyPoints} />

        {/* Daily Area & Line (Blue) */}
        <polygon points={`30,${height - 30} ${dailyPoints} ${width - 10},${height - 30}`} fill="url(#chart-grad-blue)" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={dailyPoints} />
      </svg>
    </div>
  );
};

export default function CapacityView({ theme = 'light' }: CapacityViewProps) {
  const [lastUpdated, setLastUpdated] = useState('10:42 AM, May 28, 2026');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLight = theme === 'light';
  const cardBg = isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-md';
  const boxBg = isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-700/60';
  const innerCardBg = isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-800/60 border-slate-700/80';
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

  const healthServices = [
    { name: 'Database', status: 'Healthy' },
    { name: 'Servers', status: 'Healthy' },
    { name: 'API Services', status: 'Healthy' },
    { name: 'Authentication', status: 'Healthy' },
    { name: 'Search Engine', status: 'Healthy' },
    { name: 'Trading Engine', status: 'Healthy' },
  ];

  const resourceUsage = [
    { name: 'Database', usage: 61, status: 'Normal', color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', icon: Database },
    { name: 'Servers', usage: 58, status: 'Normal', color: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400', icon: Server },
    { name: 'Memory', usage: 72, status: 'High', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', icon: Cpu },
    { name: 'Storage', usage: 48, status: 'Normal', color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400', icon: HardDrive },
    { name: 'Network', usage: 32, status: 'Normal', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', icon: Network },
    { name: 'Disk I/O', usage: 37, status: 'Normal', color: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400', icon: HardDrive },
    { name: 'Waiting Requests', usageVal: '120', usage: 15, status: 'Normal', color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400', icon: Clock },
    { name: 'API Rate', usageVal: '1,240 /sec', usage: 35, status: 'Normal', color: 'bg-teal-500', textColor: 'text-teal-600 dark:text-teal-400', icon: Activity },
  ];

  return (
    <div className={`space-y-6 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'} pb-12`}>
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textTitle}`}>
            System Capacity
          </h1>
          <p className={`text-xs sm:text-sm ${textSub} mt-1`}>
            Overview of platform capacity and resource usage
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

      {/* 2. OVERALL PLATFORM HEALTH BANNER */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg} flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${textSub}`}>Overall Platform Health</span>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              Excellent
            </h2>
            <p className={`text-xs ${textSub} mt-0.5`}>All systems are operational</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
          {healthServices.map((srv) => (
            <div key={srv.name} className="flex flex-col items-start lg:items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{srv.name}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 lg:mt-0.5 pl-5 lg:pl-0">
                {srv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PLATFORM CAPACITY & 4 SUB-METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Platform Capacity (Spans 7 cols) */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} lg:col-span-7 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className={`text-lg font-bold ${textTitle}`}>Platform Capacity</h2>
            </div>
            <p className={`text-xs ${textSub}`}>How much of our capacity is being used</p>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${textTitle}`}>
                  150,000
                </span>
                <p className={`text-sm sm:text-base font-semibold ${textSub} mt-1`}>
                  of 2,500,000 Users
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-bold text-sm shadow-2xs">
                6% Used
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 mt-5 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-2xs" style={{ width: '6%' }} />
            </div>
          </div>

          {/* 3 Stats Bottom Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className={textSub}>Available Capacity</span>
              <div className={`text-base font-bold ${textTitle} mt-1`}>2,350,000 Users</div>
            </div>
            <div>
              <span className={textSub}>Capacity Type</span>
              <div className={`text-base font-bold ${textTitle} mt-1`}>Auto Scaling</div>
            </div>
            <div>
              <span className={textSub}>Next Review</span>
              <div className={`text-base font-bold ${textTitle} mt-1`}>Jun 28, 2026</div>
            </div>
          </div>
        </div>

        {/* Right Side: 4 Smaller Metric Cards (Spans 5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Users Online (With 5000 of 10000 users indicated) */}
          <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-bold ${textTitle}`}>Users Online</span>
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textTitle}`}>
                5,000
              </div>
              <p className={`text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5`}>
                of 10,000 Users (Currently active)
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold">50% Active Limit</span>
              <Sparkline color="emerald" data={[2800, 3100, 3400, 3800, 4200, 4600, 4800, 5000]} />
            </div>
          </div>

          {/* Card 2: Response Speed */}
          <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-bold ${textTitle}`}>Response Speed</span>
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textTitle}`}>
                12.4 ms
              </div>
              <p className={`text-[11px] ${textSub} mt-0.5`}>
                Average response time
              </p>
            </div>
            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Sparkline color="emerald" data={[14, 13.5, 12.8, 13.1, 12.6, 12.2, 12.5, 12.4]} />
            </div>
          </div>

          {/* Card 3: System Load */}
          <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-bold ${textTitle}`}>System Load</span>
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textTitle}`}>
                46%
              </div>
              <p className={`text-[11px] ${textSub} mt-0.5`}>
                Normal load
              </p>
            </div>
            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Sparkline color="blue" data={[42, 44, 43, 46, 48, 45, 47, 46]} />
            </div>
          </div>

          {/* Card 4: Auto Scaling */}
          <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span className={`text-xs font-bold ${textTitle}`}>Auto Scaling</span>
            </div>
            <div className="my-2">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textTitle}`}>
                Enabled
              </div>
              <p className={`text-[11px] ${textSub} mt-0.5`}>
                Scaling automatically
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Policies Active</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. RESOURCE USAGE & USERS OVER TIME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Resource Usage (Spans 7 cols) */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} lg:col-span-7`}>
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className={`text-lg font-bold ${textTitle}`}>Resource Usage</h2>
            </div>
            <p className={`text-xs ${textSub} mt-0.5`}>Real-time usage of key resources</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceUsage.map((res) => {
              const Icon = res.icon;
              return (
                <div key={res.name} className={`p-4 rounded-xl border flex flex-col justify-between ${boxBg}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className={`text-xs font-bold ${textTitle}`}>{res.name}</span>
                    </div>
                    <div className={`text-xl font-black ${textTitle} mb-1`}>
                      {res.usageVal || `${res.usage}%`}
                    </div>
                    <span className={`text-[11px] font-semibold ${res.status === 'High' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/80 rounded-full h-1.5 mt-4">
                    <div className={`h-1.5 rounded-full ${res.color}`} style={{ width: `${res.usage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Users Over Time (Spans 5 cols) */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} lg:col-span-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className={`text-lg font-bold ${textTitle}`}>Users Over Time</h2>
              </div>
              <button className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <span>Last 30 Days</span>
                <span className="text-[10px]">▼</span>
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold my-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className={textSub}>Daily Active Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className={textSub}>Weekly Active Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span className={textSub}>Monthly Active Users</span>
              </div>
            </div>

            {/* Chart */}
            <UsersOverTimeChart isLight={isLight} />
          </div>
        </div>

      </div>

      {/* 5. CURRENT TRAFFIC, PERFORMANCE SUMMARY & CAPACITY FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Current Traffic */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className={`text-lg font-bold ${textTitle}`}>Current Traffic</h2>
            </div>
            <p className={`text-xs ${textSub} mb-5`}>Live platform traffic overview</p>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Requests / Second</span>
                <div className={`text-xl font-black ${textTitle} my-1 font-mono`}>18,420</div>
                <Sparkline color="emerald" data={[17200, 17800, 18100, 18420]} />
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Highest Today</span>
                <div className={`text-xl font-black ${textTitle} my-1 font-mono`}>24,680</div>
                <span className="text-[11px] text-slate-400 font-mono">09:15 AM</span>
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Average Today</span>
                <div className={`text-xl font-black ${textTitle} my-1 font-mono`}>16,230</div>
                <Sparkline color="emerald" data={[15800, 16000, 16100, 16230]} />
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Total Requests Today</span>
                <div className={`text-xl font-black ${textTitle} my-1 font-mono`}>1.35 Billion</div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+12% vs avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Performance Summary */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className={`text-lg font-bold ${textTitle}`}>Performance Summary</h2>
            </div>
            <p className={`text-xs ${textSub} mb-5`}>Latency and success rates across services</p>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Fastest Response</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 my-1 font-mono">8 ms</div>
                <span className="text-[11px] text-slate-400 font-medium">User Service</span>
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Slowest Response</span>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 my-1 font-mono">120 ms</div>
                <span className="text-[11px] text-slate-400 font-medium">Market Data</span>
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Failed Requests</span>
                <div className={`text-xl font-black ${textTitle} my-1 font-mono`}>0.02%</div>
                <span className="text-[11px] text-slate-400 font-medium">Today</span>
              </div>

              <div className={`p-4 rounded-xl border ${boxBg}`}>
                <span className={`text-xs ${textSub}`}>Successful Requests</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 my-1 font-mono">99.98%</div>
                <span className="text-[11px] text-slate-400 font-medium">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Capacity Forecast */}
        <div className={`p-6 sm:p-7 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className={`text-lg font-bold ${textTitle}`}>Capacity Forecast</h2>
            </div>
            <p className={`text-xs ${textSub} mb-5`}>Projected usage based on current growth</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${textSub} w-20`}>30 Days</span>
                <span className={`text-xs font-bold font-mono ${textTitle} w-12 text-right`}>8%</span>
                <div className="flex-1 ml-3 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${textSub} w-20`}>90 Days</span>
                <span className={`text-xs font-bold font-mono ${textTitle} w-12 text-right`}>12%</span>
                <div className="flex-1 ml-3 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${textSub} w-20`}>1 Year</span>
                <span className={`text-xs font-bold font-mono ${textTitle} w-12 text-right`}>26%</span>
                <div className="flex-1 ml-3 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '26%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom box */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Estimated Upgrade Needed</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300 font-bold text-[10px]">
                  Not Required
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                You are well within capacity limits.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 6. BOTTOM ACTION BAR (MATCHING PHOTO) */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${textTitle}`}>Everything looks good!</h3>
            <p className={`text-xs ${textSub}`}>Your platform is healthy and operating well within capacity limits.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleRefresh}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Run System Check</span>
          </button>

          <button
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>View Logs</span>
          </button>

          <button
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

    </div>
  );
}
