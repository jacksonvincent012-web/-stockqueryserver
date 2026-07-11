import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Trash2, Database, Search, Lock, Unlock, CheckCircle2, AlertTriangle, Play, Zap, Clock } from 'lucide-react';

interface OperationAction {
  id: string;
  name: string;
  desc: string;
  icon: any;
  buttonLabel: string;
  buttonStyle: string;
  requiresConfirm: boolean;
  status: 'Idle' | 'Running' | 'Success';
}

export default function OperationsCenterView() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [operations, setOperations] = useState<OperationAction[]>([
    {
      id: 'restart',
      name: 'Restart Services',
      desc: 'Safely restarts core background calculation engines and data ingestion pipelines without dropping active user connections.',
      icon: RefreshCw,
      buttonLabel: 'Restart Services',
      buttonStyle: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500',
      requiresConfirm: true,
      status: 'Idle'
    },
    {
      id: 'cache',
      name: 'Clear Caches',
      desc: 'Wipes temporary memory buffers so the system re-fetches fresh stock prices directly from primary exchange feeds.',
      icon: Trash2,
      buttonLabel: 'Clear All Caches',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
      requiresConfirm: false,
      status: 'Idle'
    },
    {
      id: 'backup',
      name: 'Backup Database',
      desc: 'Creates an immediate encrypted snapshot of all stock data, user profiles, and audit logs to secure cloud storage.',
      icon: Database,
      buttonLabel: 'Create Database Backup',
      buttonStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500',
      requiresConfirm: false,
      status: 'Idle'
    },
    {
      id: 'reindex',
      name: 'Reindex Search',
      desc: 'Re-builds search lookup tables to ensure company name searches and ticker auto-complete remain fast and accurate.',
      icon: Search,
      buttonLabel: 'Reindex Search Tables',
      buttonStyle: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500',
      requiresConfirm: false,
      status: 'Idle'
    },
  ]);

  const executeOperation = (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    setOperations(prev => prev.map(op => op.id === id ? { ...op, status: 'Running' } : op));

    setTimeout(() => {
      setOperations(prev => prev.map(op => op.id === id ? { ...op, status: 'Success' } : op));
      setLoadingId(null);
      const opObj = operations.find(o => o.id === id);
      setToast(`Operation "${opObj?.name}" completed successfully.`);
      setTimeout(() => setToast(null), 3500);
      
      setTimeout(() => {
        setOperations(prev => prev.map(op => op.id === id ? { ...op, status: 'Idle' } : op));
      }, 3000);
    }, 1500);
  };

  const toggleMaintenanceMode = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    setToast(next ? 'System is now in MAINTENANCE MODE. New logins restricted.' : 'System Maintenance Mode lifted. Normal operations restored.');
    setTimeout(() => setToast(null), 3500);
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
            <span>PLATFORM COMMAND & CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Operations Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Execute critical system commands. Every action explains what it does in simple, plain English.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
            maintenanceMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{maintenanceMode ? 'MAINTENANCE MODE ACTIVE' : 'NORMAL PLATFORM OPERATIONS'}</span>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Special Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
        maintenanceMode 
          ? 'bg-amber-950/30 border-amber-500/40' 
          : 'bg-[#111827] border-slate-800'
      }`}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${maintenanceMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              {maintenanceMode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <h2 className="text-lg font-bold text-white">Maintenance Mode</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Temporarily restricts new user logins while administrators apply critical system updates, schema changes, or database migrations. Active administrator sessions remain undisturbed.
          </p>
        </div>

        <button
          onClick={toggleMaintenanceMode}
          className={`px-6 py-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-2 shadow-lg ${
            maintenanceMode
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20'
              : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
          }`}
        >
          {maintenanceMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{maintenanceMode ? 'LIFT MAINTENANCE MODE' : 'ENABLE MAINTENANCE MODE'}</span>
        </button>
      </div>

      {/* Core Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {operations.map((op) => {
          const Icon = op.icon;
          const isRunning = op.status === 'Running';
          const isSuccess = op.status === 'Success';

          return (
            <div key={op.id} className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{op.name}</h3>
                  </div>
                  {isSuccess && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{op.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Status: <strong className={isRunning ? 'text-blue-400 font-bold' : isSuccess ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{op.status}</strong>
                </span>
                <button
                  onClick={() => executeOperation(op.id)}
                  disabled={loadingId !== null}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40 ${op.buttonStyle}`}
                >
                  {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'EXECUTING COMMAND...' : op.buttonLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
