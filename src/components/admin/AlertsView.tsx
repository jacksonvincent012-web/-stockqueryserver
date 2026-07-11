import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, ShieldCheck, Check, Clock } from 'lucide-react';

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  status: 'active' | 'resolved';
}

interface AlertsViewProps {
  liveAlerts?: any[];
}

export default function AlertsView({ liveAlerts = [] }: AlertsViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'critical'>('active');
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 'ALT-101', severity: 'critical', title: 'Secondary Node Latency Spike', message: 'High network latency detected on backup routing node B-2 during market open.', time: '5 mins ago', status: 'active' },
    { id: 'ALT-102', severity: 'warning', title: 'Ingestion Buffer Elevation', message: 'Data ingestion queue depth temporarily reached 75% capacity threshold.', time: '12 mins ago', status: 'active' },
    { id: 'ALT-103', severity: 'warning', title: 'Memory Usage Warning', message: 'Worker cluster node #4 reported elevated RAM utilization (82%).', time: '25 mins ago', status: 'active' },
    { id: 'ALT-104', severity: 'info', title: 'Macroeconomic Feed Ingested', message: 'US Consumer Price Index (CPI) telemetry feed received and indexed cleanly.', time: '1 hour ago', status: 'active' },
    { id: 'ALT-105', severity: 'critical', title: 'Ticker Stream Fluctuation', message: 'Symbol AAPL price fluctuation exceeded standard volatility limits.', time: '2 hours ago', status: 'resolved' },
    { id: 'ALT-106', severity: 'info', title: 'Scheduled Database Indexing', message: 'Automated database vacuum and search index optimization completed.', time: '3 hours ago', status: 'resolved' },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    setToast(`Alert ${id} marked as resolved.`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAlerts = alerts.filter(item => {
    if (filter === 'active') return item.status === 'active';
    if (filter === 'resolved') return item.status === 'resolved';
    if (filter === 'critical') return item.severity === 'critical';
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  const getBadgeStyle = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 shadow-lg font-mono text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>PLATFORM EVENT NOTIFICATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Alerts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Highlight important platform events. Prioritized to avoid overwhelming the administrator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            ACTIVE ALERTS: <strong className="text-rose-400 font-bold">{activeCount} PENDING</strong>
          </div>
        </div>
      </div>

      {/* Top Severity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Critical</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{criticalCount} Active</div>
            <p className="text-[11px] text-slate-400 mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{warningCount} Active</div>
            <p className="text-[11px] text-slate-400 mt-1">Monitor for potential escalation</p>
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Information</span>
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{infoCount} Events</div>
            <p className="text-[11px] text-slate-400 mt-1">Standard system operational notes</p>
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Recent Alerts</span>
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{alerts.length} Total</div>
            <p className="text-[11px] text-slate-400 mt-1">Logged in past 24 hours</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {(['active', 'resolved', 'critical', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab === 'all' ? 'All Alerts' : tab} ({
              tab === 'active' ? activeCount :
              tab === 'resolved' ? alerts.length - activeCount :
              tab === 'critical' ? alerts.filter(a => a.severity === 'critical').length :
              alerts.length
            })
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base">Alerts Log ({filteredAlerts.length})</h2>
          <span className="text-xs font-mono text-slate-400">Real-time event stream</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${getBadgeStyle(item.severity)}`}>
                    {getIcon(item.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{item.title}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getBadgeStyle(item.severity)}`}>
                        {item.severity}
                      </span>
                      {item.status === 'resolved' && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                          <Check className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                      <span>ID: {item.id}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                    </div>
                  </div>
                </div>

                {item.status === 'active' && (
                  <button
                    onClick={() => handleResolve(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white border border-slate-800 hover:border-emerald-500 text-slate-300 text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 font-sans text-sm">
              No alerts found matching the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
