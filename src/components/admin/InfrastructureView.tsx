import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Server, ShieldCheck, TrendingUp, Search, FileText, Bell, Database, 
  RotateCw, Activity, Cpu, HardDrive, Globe, CheckCircle2, AlertTriangle, Zap, 
  RefreshCw, Play, Pause, Layers, Radio, Terminal, Sliders, Eye, Sun, Moon, 
  Wrench, Check, ArrowUpRight, BarChart2, RefreshCcw
} from 'lucide-react';

interface InfrastructureViewProps {
  theme?: 'light' | 'dark';
}

interface NodeInfo {
  id: string;
  region: string;
  code: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DRAINING';
  latency: string;
  latencyNum: number;
  type: string;
  cpuLoad: number;
  ramLoad: number;
  activePods: string;
  pinging?: boolean;
  draining?: boolean;
}

interface ServiceInfo {
  id: string;
  title: string;
  desc: string;
  icon: any;
  status: 'Healthy' | 'Optimizing' | 'High Load';
  throughput: string;
  latency: string;
  uptime: string;
  restarting?: boolean;
}

export default function InfrastructureView({ theme = 'light' }: InfrastructureViewProps) {
  const isLight = theme === 'light';
  const cardBg = isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-md';
  const subCardBg = isLight ? 'bg-white border-slate-200 shadow-2xs hover:border-blue-400' : 'bg-slate-800/50 border-slate-700/60 shadow-2xs hover:border-blue-500';
  const boxBg = isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-700/60';
  const textTitle = isLight ? 'text-slate-900' : 'text-white';
  const textSub = isLight ? 'text-slate-500' : 'text-slate-400';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'regions' | 'services' | 'alerts'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Time state for photo-style header
  const [currentTime, setCurrentTime] = useState(new Date());

  // Regional Nodes State
  const [nodes, setNodes] = useState<NodeInfo[]>([
    { id: 'us-e1', region: 'us-east-1', code: 'US-E1', status: 'HEALTHY', latency: '12ms', latencyNum: 12, type: 'Primary API Gateway & Engine', cpuLoad: 38, ramLoad: 44, activePods: '240 / 240' },
    { id: 'us-w2', region: 'us-west-2', code: 'US-W2', status: 'HEALTHY', latency: '24ms', latencyNum: 24, type: 'Secondary Compute & DB Mirror', cpuLoad: 41, ramLoad: 48, activePods: '180 / 180' },
    { id: 'eu-w1', region: 'eu-west-1', code: 'EU-W1', status: 'HEALTHY', latency: '45ms', latencyNum: 45, type: 'EU Regional Edge Gateway', cpuLoad: 34, ramLoad: 39, activePods: '160 / 160' },
    { id: 'eu-c1', region: 'eu-central-1', code: 'EU-C1', status: 'HEALTHY', latency: '52ms', latencyNum: 52, type: 'Financial Data Cache Cluster', cpuLoad: 29, ramLoad: 35, activePods: '120 / 120' },
    { id: 'ap-s1', region: 'ap-south-1', code: 'AP-S1', status: 'HEALTHY', latency: '85ms', latencyNum: 85, type: 'APAC Regional Ingress Node', cpuLoad: 46, ramLoad: 52, activePods: '140 / 140' },
    { id: 'sa-e1', region: 'sa-east-1', code: 'SA-E1', status: 'HEALTHY', latency: '110ms', latencyNum: 110, type: 'LatAm Edge Delivery Node', cpuLoad: 22, ramLoad: 28, activePods: '80 / 80' },
  ]);

  // Logical Services State
  const [services, setServices] = useState<ServiceInfo[]>([
    { id: 'auth', title: 'Authentication Engine', desc: 'User login, OAuth2 & JWT token validation service', icon: ShieldCheck, status: 'Healthy', throughput: '2,840 req/s', latency: '3.2ms', uptime: '99.999%' },
    { id: 'market', title: 'Market Data Ingestion', desc: 'Real-time WebSocket ticker telemetry & quote stream', icon: TrendingUp, status: 'Healthy', throughput: '14,500 msg/s', latency: '1.4ms', uptime: '99.998%' },
    { id: 'search', title: 'Search & Indexing Engine', desc: 'Elastic company symbol query & fast search indexing', icon: Search, status: 'Healthy', throughput: '1,210 req/s', latency: '8.5ms', uptime: '99.995%' },
    { id: 'reports', title: 'Report Generator Service', desc: 'Financial export, PDF rendering & analytics summaries', icon: FileText, status: 'Healthy', throughput: '340 req/s', latency: '18.2ms', uptime: '99.990%' },
    { id: 'notif', title: 'Notification Dispatch', desc: 'System webhooks, email alerts & push notifications', icon: Bell, status: 'Healthy', throughput: '890 req/s', latency: '4.1ms', uptime: '99.999%' },
    { id: 'db', title: 'Relational Database Pool', desc: 'PostgreSQL / Cloud SQL primary connection pool', icon: Database, status: 'Healthy', throughput: '6,400 qps', latency: '2.1ms', uptime: '99.999%' },
    { id: 'ingress', title: 'Kubernetes Ingress Edge', desc: 'Nginx edge router, WAF protection & SSL termination', icon: Globe, status: 'Healthy', throughput: '22,400 req/s', latency: '0.8ms', uptime: '100.00%' },
    { id: 'cache', title: 'Distributed Redis Cache', desc: 'High-speed session store & live quote cache cluster', icon: Zap, status: 'Healthy', throughput: '48,000 ops/s', latency: '0.4ms', uptime: '99.999%' },
  ]);

  // Telemetry History
  const [bandwidthHistory, setBandwidthHistory] = useState([
    { time: '10s ago', gbps: 14.2 },
    { time: '8s ago', gbps: 14.8 },
    { time: '6s ago', gbps: 13.9 },
    { time: '4s ago', gbps: 15.4 },
    { time: '2s ago', gbps: 14.6 },
    { time: 'Now', gbps: 15.1 },
  ]);

  // Global system metrics
  const [systemStats, setSystemStats] = useState({
    cpu: 35.4,
    memory: 42.8,
    uptime: '99.998%',
    activeConnections: '1,284',
    avgLatency: '28ms'
  });

  // Fetch real backend system health if available & pulse simulation
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/admin/system-health').then(r => r.json());
        if (res && typeof res === 'object') {
          setSystemStats(prev => ({
            ...prev,
            cpu: res.cpu || prev.cpu,
            memory: res.memory || prev.memory,
            activeConnections: res.active_connections ? res.active_connections.toLocaleString() : prev.activeConnections
          }));
        }
      } catch (err) {
        // Fallback to simulated variation
      }
    };

    fetchHealth();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate live jitter around nominal values
      setNodes(prev => prev.map(node => {
        if (node.draining) return node;
        const cpuDelta = Math.floor(Math.random() * 5) - 2;
        const ramDelta = Math.floor(Math.random() * 3) - 1;
        return {
          ...node,
          cpuLoad: Math.max(15, Math.min(88, node.cpuLoad + cpuDelta)),
          ramLoad: Math.max(20, Math.min(90, node.ramLoad + ramDelta)),
        };
      }));

      // Update live telemetry chart
      setBandwidthHistory(prev => {
        const newGbps = Number((14.0 + Math.random() * 2.5).toFixed(1));
        return [
          ...prev.slice(1),
          { time: new Date().toTimeString().split(' ')[0], gbps: newGbps }
        ];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener (/ for search, R for refresh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handlePingNode = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, pinging: true } : n));
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id !== nodeId) return n;
        const jitter = Math.floor(Math.random() * 6) - 3;
        const newLat = Math.max(8, n.latencyNum + jitter);
        return { ...n, pinging: false, latency: `${newLat}ms`, latencyNum: newLat };
      }));
    }, 900);
  };

  const handleToggleDrain = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      const willDrain = !n.draining;
      return {
        ...n,
        draining: willDrain,
        status: willDrain ? 'DRAINING' : 'HEALTHY',
        cpuLoad: willDrain ? 5 : 38,
        activePods: willDrain ? '0 / 240 (Evacuated)' : '240 / 240'
      };
    }));
  };

  const handleRestartService = (serviceId: string) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, restarting: true, status: 'Optimizing' } : s));
    setTimeout(() => {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, restarting: false, status: 'Healthy' } : s));
    }, 1200);
  };

  // Format time and date exactly like the reference photo
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Filter logic
  const filteredNodes = nodes.filter(n => 
    n.region.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showRegions = activeTab === 'all' || activeTab === 'regions';
  const showServices = activeTab === 'all' || activeTab === 'services';
  const showAlertsOnly = activeTab === 'alerts';

  return (
    <div className={`space-y-6 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'} pb-12`}>
      
      {/* 1. TOP HEADER WITH PHOTO-STYLE CONTROL BAR */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} flex flex-col xl:flex-row xl:items-center justify-between gap-6`}>
        <div>
          <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GLOBAL CLOUD MESH OPERATIONAL</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${textTitle} flex items-center gap-3`}>
            <Server className="w-7 h-7 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Infrastructure Health</span>
          </h1>
          <p className={`text-xs sm:text-sm ${textSub} mt-1 max-w-2xl`}>
            Real-time telemetry across regional edge gateways, Kubernetes cluster saturation, and logical microservice pipelines.
          </p>
        </div>

        {/* PHOTO-STYLE INTERACTIVE CONTROL BAR */}
        <div className={`p-2 sm:p-2.5 rounded-2xl border ${isLight ? 'bg-slate-100/80 border-slate-200/80' : 'bg-slate-800/80 border-slate-700'} flex flex-wrap items-center gap-2 sm:gap-3 self-start xl:self-center shadow-xs`}>
          
          {/* Search Bar with [/] shortcut badge */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className={`pl-8 pr-9 py-1.5 rounded-xl border text-xs font-medium transition-all w-40 sm:w-52 focus:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs'
                  : 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
              }`}
            />
            <button 
              onClick={() => searchInputRef.current?.focus()}
              className={`absolute right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
              title="Keyboard shortcut: /"
            >
              /
            </button>
          </div>

          {/* Refresh Button with [R] shortcut badge */}
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs active:scale-95 ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50' 
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
            }`}
            title="Refresh Telemetry (Shortcut: R)"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span className="font-semibold">Refresh</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              isLight ? 'bg-slate-100 border border-slate-200 text-slate-500' : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              R
            </span>
          </button>

          {/* Crisp Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Stacked Time & Date */}
          <div className="hidden md:block text-right px-1">
            <div className={`text-xs font-bold font-mono leading-none ${textTitle}`}>
              {formattedTime}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none font-mono">
              {formattedDate}
            </div>
          </div>

          {/* Notification Alert Bell Badge */}
          <button
            onClick={() => setShowAlertModal(!showAlertModal)}
            className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Active Infrastructure Notices"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs animate-pulse">
              3
            </span>
          </button>

          {/* Avatar / Operator Status Circle */}
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity ml-1 border-2 border-emerald-400" title="Active Operator Admin Session">
            A
          </div>
        </div>
      </div>

      {/* ACTIVE ALERTS DRAWER BANNER IF CLICKED */}
      {showAlertModal && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h4 className="font-bold text-amber-900 dark:text-amber-200">3 Active Infrastructure Advisory Notices</h4>
              <ul className="mt-1.5 space-y-1 text-amber-800 dark:text-amber-300 list-disc list-inside font-mono text-xs">
                <li>sa-east-1 regional gateway experiencing +15ms jitter due to transit ISP routing.</li>
                <li>Database connection pool utilization reached 64% during morning market open.</li>
                <li>Redis distributed cache auto-evicted 1,420 expired session keys cleanly.</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={() => setShowAlertModal(false)}
            className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-200 transition-colors shrink-0"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 2. KPI METRICS OVERVIEW ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Global Mesh Latency', value: systemStats.avgLatency, desc: 'P50 Across 6 Regions', trend: '±2ms Jitter', icon: Network, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20' },
          { title: 'Active Pod Clusters', value: '1,420 / 1,500', desc: 'Kubernetes Containers', trend: '94.6% Running', icon: Layers, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
          { title: 'Cluster CPU Saturation', value: `${systemStats.cpu}%`, desc: 'Average Core Load', trend: 'Optimal Range', icon: Cpu, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20' },
          { title: 'Cluster RAM Saturation', value: `${systemStats.memory}%`, desc: 'Allocated Memory', trend: '38.2 GB Free', icon: HardDrive, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20' },
          { title: 'Global Edge Uptime', value: systemStats.uptime, desc: 'Last 30 Days SLA', trend: 'Zero Unscheduled Outages', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`rounded-2xl p-5 border ${cardBg} flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${textSub} truncate`}>{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-black ${textTitle} font-mono tracking-tight mb-1`}>{kpi.value}</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={textSub}>{kpi.desc}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{kpi.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. INTERACTIVE FILTER TABS & SEARCH bar */}
      <div className={`p-3 rounded-2xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Infrastructure', count: nodes.length + services.length },
            { id: 'regions', label: 'Regional Edge Nodes', count: nodes.length },
            { id: 'services', label: 'Core Microservices', count: services.length },
            { id: 'alerts', label: 'Active Advisories', count: 3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-blue-700 text-white' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Filtering by: "{searchQuery}"</span>
            <button onClick={() => setSearchQuery('')} className="text-rose-500 hover:underline font-bold">Clear</button>
          </div>
        )}
      </div>

      {/* 4. REGIONAL DEPLOYMENT NODES GRID */}
      {showRegions && !showAlertsOnly && (
        <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${textTitle} flex items-center gap-2`}>
                <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Regional Edge Deployment Nodes</span>
              </h2>
              <p className={`text-xs ${textSub} mt-0.5`}>
                Global low-latency points of presence (PoP), active pod distribution, and traffic routing controls.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400">
                6 / 6 REGIONS ONLINE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNodes.map(node => {
              const isDraining = node.draining;
              return (
                <div key={node.id} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isDraining ? 'bg-amber-50/50 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30' : boxBg
                }`}>
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                          isDraining
                            ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300'
                            : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300'
                        }`}>
                          {node.code}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm sm:text-base ${textTitle}`}>{node.region}</h4>
                          <span className={`text-[11px] font-mono ${textSub}`}>{node.type}</span>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
                        isDraining
                          ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isDraining ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                        <span>{node.status}</span>
                      </div>
                    </div>

                    {/* Dual Progress Load Bars */}
                    <div className="space-y-3 my-4 py-3 border-y border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className={textSub}>CPU Saturation</span>
                          <span className={`font-bold ${node.cpuLoad > 75 ? 'text-amber-500' : textTitle}`}>{node.cpuLoad}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              node.cpuLoad > 75 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${node.cpuLoad}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className={textSub}>RAM Saturation</span>
                          <span className={`font-bold ${node.ramLoad > 80 ? 'text-amber-500' : textTitle}`}>{node.ramLoad}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              node.ramLoad > 80 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${node.ramLoad}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Interactive Action Buttons */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-3">
                      <span className={textSub}>Ping Latency:</span>
                      <strong className={`font-bold ${node.pinging ? 'text-blue-500 animate-pulse' : textTitle}`}>
                        {node.pinging ? 'Pinging...' : node.latency}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono mb-4">
                      <span className={textSub}>Active Pods:</span>
                      <strong className={textTitle}>{node.activePods}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <button
                        onClick={() => handlePingNode(node.id)}
                        disabled={node.pinging}
                        className={`py-2 rounded-xl text-xs font-bold font-mono border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isLight
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <RefreshCcw className={`w-3.5 h-3.5 ${node.pinging ? 'animate-spin text-blue-500' : ''}`} />
                        <span>{node.pinging ? 'PING...' : 'PING NODE'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleDrain(node.id)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDraining
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300'
                            : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{isDraining ? 'RESTORE' : 'DRAIN TRAFFIC'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. LOGICAL PLATFORM SERVICES (CORE MICROSERVICES) */}
      {showServices && !showAlertsOnly && (
        <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${textTitle} flex items-center gap-2`}>
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Logical Platform Microservices</span>
              </h2>
              <p className={`text-xs ${textSub} mt-0.5`}>
                Core business services, database pools, authentication engines, and distributed caching layers.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-mono text-xs font-bold shadow-2xs">
              8 / 8 SERVICES NOMINAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredServices.map(srv => {
              const Icon = srv.icon;
              const isRestarting = srv.restarting;
              return (
                <div key={srv.id} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${subCardBg}`}>
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        isRestarting
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                      }`}>
                        {srv.status}
                      </span>
                    </div>

                    <h3 className={`font-bold text-base ${textTitle} mb-1`}>{srv.title}</h3>
                    <p className={`text-xs ${textSub} leading-relaxed mb-4`}>{srv.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className={textSub}>Throughput:</span>
                      <strong className={textTitle}>{srv.throughput}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSub}>P99 Latency:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{srv.latency}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className={textSub}>Uptime SLA:</span>
                      <strong className={textTitle}>{srv.uptime}</strong>
                    </div>

                    <button
                      onClick={() => handleRestartService(srv.id)}
                      disabled={isRestarting}
                      className={`w-full mt-3 py-2 rounded-xl font-mono text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-blue-500' : ''}`} />
                      <span>{isRestarting ? 'RESTARTING POD...' : 'RESTART POD'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. LIVE NETWORK INGRESS BANDWIDTH TELEMETRY STREAM */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${textTitle} flex items-center gap-2`}>
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Real-Time Mesh Ingress Telemetry</span>
            </h2>
            <p className={`text-xs ${textSub} mt-0.5`}>
              Live network throughput bandwidth streaming across all edge gateways (updating dynamically every 3s).
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Current Mesh Bandwidth: <strong className={`text-base font-bold text-emerald-600 dark:text-emerald-400`}>{bandwidthHistory[bandwidthHistory.length - 1].gbps} Gbps</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {bandwidthHistory.map((pt, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${boxBg} text-center font-mono hover:border-blue-400 dark:hover:border-blue-500 transition-all`}>
              <div className={`text-xs ${textSub} mb-1`}>{pt.time}</div>
              <div className={`text-lg sm:text-xl font-black ${textTitle}`}>{pt.gbps} <span className="text-xs font-normal text-slate-400">Gbps</span></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
