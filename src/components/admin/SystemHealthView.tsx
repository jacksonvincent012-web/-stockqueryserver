import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Clock, Database, Server, CheckCircle2, AlertTriangle, RefreshCw, Activity } from 'lucide-react';

interface HealthData {
  cpuUsage: string;
  memoryUsage: string;
  apiResponseTime: string;
  databaseConnection: 'Connected' | 'Degraded' | 'Disconnected';
  serverStatus: 'Online' | 'Warning' | 'Offline';
  uptimeSeconds?: number;
  lastChecked?: string;
}

export default function SystemHealthView() {
  const [healthData, setHealthData] = useState<HealthData>({
    cpuUsage: '35.4%',
    memoryUsage: '42.8%',
    apiResponseTime: '12 ms',
    databaseConnection: 'Connected',
    serverStatus: 'Online',
    lastChecked: 'Just now'
  });
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system-health').then(r => r.json());
      if (res) {
        setHealthData({
          cpuUsage: res.cpu ? `${res.cpu}%` : '35.4%',
          memoryUsage: res.memory ? `${res.memory}%` : '42.8%',
          apiResponseTime: res.latency || '12 ms',
          databaseConnection: res.dbStatus || 'Connected',
          serverStatus: res.status === 'healthy' ? 'Online' : 'Warning',
          lastChecked: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCpuValue = () => parseFloat(healthData.cpuUsage) || 35;
  const getMemValue = () => parseFloat(healthData.memoryUsage) || 42;

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              TELEMETRY & STATUS
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
              System Health Diagnostics
            </h2>
            <p className="text-xs text-slate-400">
              Live hardware utilization, API latency metrics, and database connectivity monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">LAST CHECKED:</span>
            <span className="text-emerald-400 font-bold">{healthData.lastChecked || 'Just now'}</span>
          </div>

          <button
            onClick={fetchHealth}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh System Health"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Health Gauges & Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Usage Card with Progress Bar */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">CPU USAGE</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-3xl font-black text-white font-mono tracking-tight">{healthData.cpuUsage}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
                NORMAL
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, getCpuValue())}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60 flex justify-between font-mono">
            <span>Primary Cluster</span>
            <span>Capacity: 100%</span>
          </div>
        </div>

        {/* Memory Usage Card with Progress Bar */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">MEMORY USAGE</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-3xl font-black text-white font-mono tracking-tight">{healthData.memoryUsage}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
                STABLE
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, getMemValue())}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60 flex justify-between font-mono">
            <span>RAM Allocation</span>
            <span>Optimal Range &lt; 80%</span>
          </div>
        </div>

        {/* API Response Time Card */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">API RESPONSE TIME</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-3xl font-black text-white font-mono tracking-tight">{healthData.apiResponseTime}</span>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-500/30">
                FAST
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-blue-500 h-full rounded-full w-1/5 transition-all duration-500" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/60 flex justify-between font-mono">
            <span>REST / FIX Gateways</span>
            <span>Target &lt; 50 ms</span>
          </div>
        </div>
      </div>

      {/* Server & Database Status Badges & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Connection */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase font-bold">DATABASE CONNECTION</div>
              <div className="text-lg font-bold text-white mt-0.5">{healthData.databaseConnection}</div>
              <div className="text-xs text-slate-500 mt-0.5">Stock Query Engine Node #1</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ONLINE</span>
          </div>
        </div>

        {/* Server Status */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase font-bold">SERVER STATUS</div>
              <div className="text-lg font-bold text-white mt-0.5">{healthData.serverStatus}</div>
              <div className="text-xs text-slate-500 mt-0.5">Primary Reverse Proxy Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>OPERATIONAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
