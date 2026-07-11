import React, { useEffect, useState } from 'react';
import { HardDrive, Database, RefreshCw, Layers } from 'lucide-react';

interface StorageMetrics {
  tickStorage: string;
  historicalDataSize: string;
  cacheUsage: string;
  databaseSize: string;
  cachePercentage: number;
  dbPercentage: number;
  tickPercentage: number;
  histPercentage: number;
}

export default function StorageView() {
  const [metrics, setMetrics] = useState<StorageMetrics>({
    tickStorage: '120 MB',
    historicalDataSize: '340 MB',
    cacheUsage: '45 MB / 100 MB',
    databaseSize: '1.2 GB / 5.0 GB',
    cachePercentage: 45,
    dbPercentage: 24,
    tickPercentage: 35,
    histPercentage: 68
  });
  const [loading, setLoading] = useState(false);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/storage').then(r => r.json());
      if (res && typeof res === 'object') {
        setMetrics({
          tickStorage: res.tick_storage || res.tickStorage || '120 MB',
          historicalDataSize: res.ohlc_records || res.historicalData || '340 MB',
          cacheUsage: res.cache_usage || res.cacheUsage || '45 MB / 100 MB',
          databaseSize: res.database_size || '1.2 GB / 5.0 GB',
          cachePercentage: 45,
          dbPercentage: 24,
          tickPercentage: 35,
          histPercentage: 68
        });
      }
    } catch (err) {
      console.error('Failed to fetch storage metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
    const interval = setInterval(fetchStorage, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <HardDrive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              RESOURCE MONITORING
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
              Storage Monitor
            </h2>
            <p className="text-xs text-slate-400">
              Audit data storage allocations, database capacity limits, and system cache utilization.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStorage}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono text-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH STORAGE</span>
        </button>
      </div>

      {/* Storage Cards & Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tick Storage */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">TICK STORAGE</div>
              <div className="text-3xl font-black text-white font-mono mt-1">{metrics.tickStorage}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400">
              <span>Allocation Buffer</span>
              <span className="text-blue-400 font-bold">{metrics.tickPercentage}% Used</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.tickPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Historical Data Size */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">HISTORICAL DATA SIZE</div>
              <div className="text-3xl font-black text-white font-mono mt-1">{metrics.historicalDataSize}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400">
              <span>OHLC Records Archive</span>
              <span className="text-emerald-400 font-bold">{metrics.histPercentage}% Used</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.histPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Cache Usage */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">CACHE USAGE</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{metrics.cacheUsage}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400">
              <span>Memory Cache Buffer</span>
              <span className="text-blue-400 font-bold">{metrics.cachePercentage}% Used</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.cachePercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Database Size */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">DATABASE SIZE</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{metrics.databaseSize}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400">
              <span>Total Volume Capacity</span>
              <span className="text-emerald-400 font-bold">{metrics.dbPercentage}% Used</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.dbPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Storage Allocation Distribution Visual Chart */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-base">Storage Allocation Breakdown</h3>
          <span className="text-xs font-mono text-slate-400">System Volume: 5.0 GB Total</span>
        </div>
        
        <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800 font-mono text-[10px] text-white font-bold">
          <div className="bg-blue-600 h-full flex items-center justify-center truncate px-2" style={{ width: '30%' }} title="Tick Storage">
            30% Tick Data
          </div>
          <div className="bg-emerald-500 h-full flex items-center justify-center truncate px-2" style={{ width: '45%' }} title="Historical OHLC">
            45% Historical OHLC
          </div>
          <div className="bg-blue-400 h-full flex items-center justify-center truncate px-2" style={{ width: '15%' }} title="Cache">
            15% Cache
          </div>
          <div className="bg-slate-700 h-full flex items-center justify-center truncate px-2" style={{ width: '10%' }} title="Free Space">
            10% Free
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-2 text-slate-400">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-600" /><span>Tick Storage</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /><span>Historical Data</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-400" /><span>Cache Memory</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-700" /><span>Unallocated Space</span></div>
        </div>
      </div>
    </div>
  );
}
