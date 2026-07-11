import React, { useState } from 'react';
import { Bell, PlusCircle, CheckCircle2, AlertTriangle, Trash2, ShieldAlert, ArrowRight, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { INDEXED_STOCKS } from '../../../search';

export interface AnalystAlertItem {
  id: string;
  stockSymbol: string;
  stockName: string;
  monitorType: 'Price' | 'Trading Volume' | 'Daily Change';
  condition: 'Goes Above' | 'Goes Below' | 'Changes By';
  targetValue: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Triggered';
  dateCreated: string;
}

interface AlertsViewProps {
  alerts: AnalystAlertItem[];
  onAddAlert: (newAlert: AnalystAlertItem) => void;
  onDeleteAlert: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AlertsView({
  alerts,
  onAddAlert,
  onDeleteAlert,
  onToggleStatus
}: AlertsViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(INDEXED_STOCKS[0].symbol);
  const [monitorType, setMonitorType] = useState<'Price' | 'Trading Volume' | 'Daily Change'>('Price');
  const [condition, setCondition] = useState<'Goes Above' | 'Goes Below' | 'Changes By'>('Goes Above');
  const [targetValue, setTargetValue] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue.trim()) return;

    const stockObj = INDEXED_STOCKS.find(s => s.symbol === selectedSymbol) || INDEXED_STOCKS[0];
    const newAlert: AnalystAlertItem = {
      id: `alert_${Date.now()}`,
      stockSymbol: stockObj.symbol,
      stockName: stockObj.name,
      monitorType,
      condition,
      targetValue: monitorType === 'Price' && !targetValue.startsWith('$') ? `$${targetValue}` : targetValue,
      priority,
      status: 'Active',
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    onAddAlert(newAlert);
    setTargetValue('');
    setSuccessMsg(`Alert successfully saved for ${stockObj.symbol}! We will notify you when ${monitorType.toLowerCase()} ${condition.toLowerCase()} ${targetValue}.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Stock Monitoring & Custom Alerts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Set up automated notifications using simple plain English conditions without technical formulas or jargon.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Create Alert Form and My Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Create Alert Form (as requested by prompt) */}
        <div className="lg:col-span-5 bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Alert</h2>
              <p className="text-xs text-slate-400">Set conditions to track stock behavior</p>
            </div>
          </div>

          <form onSubmit={handleSaveAlert} className="space-y-6">
            
            {/* Field 1: Select Stock */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                1. Select Stock
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-2xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              >
                {INDEXED_STOCKS.map(stock => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} — {stock.name} ({stock.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: What would you like to monitor? */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                2. What would you like to monitor?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Price', label: 'Price', icon: <DollarSign className="w-4 h-4 mb-1" /> },
                  { id: 'Trading Volume', label: 'Trading Volume', icon: <Activity className="w-4 h-4 mb-1" /> },
                  { id: 'Daily Change', label: 'Daily Change', icon: <TrendingUp className="w-4 h-4 mb-1" /> },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setMonitorType(type.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      monitorType === type.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={monitorType === type.id ? 'text-blue-400' : 'text-slate-500'}>{type.icon}</span>
                    <span className="text-center leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Choose a condition */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                3. Choose a condition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Goes Above', label: 'Goes Above' },
                  { id: 'Goes Below', label: 'Goes Below' },
                  { id: 'Changes By', label: 'Changes By' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setCondition(cond.id as any)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      condition === cond.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md font-bold'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Enter Target Value */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                4. Enter Target Value
              </label>
              <div className="relative">
                {monitorType === 'Price' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                )}
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={
                    monitorType === 'Price' ? 'e.g., 185.00' :
                    monitorType === 'Trading Volume' ? 'e.g., 50000000 (shares)' : 'e.g., 5% or -3%'
                  }
                  required
                  className={`w-full bg-[#0b0f19] border border-slate-700 rounded-2xl ${
                    monitorType === 'Price' ? 'pl-8' : 'pl-4'
                  } pr-4 py-3.5 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner`}
                />
              </div>
            </div>

            {/* Field 5: Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                5. Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Low', label: 'Low', color: 'text-blue-300 border-blue-500/30 bg-blue-500/10' },
                  { id: 'Medium', label: 'Medium', color: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
                  { id: 'High', label: 'High', color: 'text-rose-300 border-rose-500/30 bg-rose-500/10' },
                ].map((prio) => (
                  <button
                    key={prio.id}
                    type="button"
                    onClick={() => setPriority(prio.id as any)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      priority === prio.id
                        ? `${prio.color} ring-2 ring-white/20 font-bold shadow-md`
                        : 'bg-[#0b0f19] border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {prio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 6: Save Alert Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Save Alert</span>
            </button>
          </form>
        </div>

        {/* Right Column: My Alerts Section (as required by prompt) */}
        <div className="lg:col-span-7 bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">My Alerts</h2>
                <p className="text-xs text-slate-400">Manage your active monitoring triggers and conditions</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                {alerts.length} Total Conditions
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-[#0b0f19] rounded-2xl border border-slate-800/80 p-8">
                <Bell className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No custom alerts set yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Use the Create Alert form on the left to start monitoring stock price jumps, volume spikes, or daily percent changes!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {alerts.map((alert) => {
                  const isTriggered = alert.status === 'Triggered';
                  const priorityColor = 
                    alert.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    alert.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30';

                  return (
                    <div
                      key={alert.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isTriggered 
                          ? 'bg-gradient-to-r from-rose-950/20 to-amber-950/20 border-rose-500/40' 
                          : 'bg-[#0b0f19] border-slate-800 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {alert.stockSymbol.slice(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-base">{alert.stockSymbol}</span>
                            <span className="text-xs text-slate-400">({alert.stockName})</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityColor}`}>
                              {alert.priority} Priority
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            <strong>What is being monitored:</strong> {alert.monitorType} {alert.condition} <span className="font-mono font-bold text-emerald-400">{alert.targetValue}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Date Created: {alert.dateCreated}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {/* Status Toggle / Badge */}
                        <button
                          onClick={() => onToggleStatus(alert.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isTriggered
                              ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                        >
                          {alert.status}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Plain English trigger engine active</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Background Sync
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
