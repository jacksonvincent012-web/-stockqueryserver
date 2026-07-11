import React, { useState } from 'react';
import { 
  DollarSign, CreditCard, ShieldAlert, CheckCircle2, XCircle, 
  AlertTriangle, ArrowUpRight, ArrowDownLeft, RefreshCw, Lock, 
  Unlock, Eye, Filter, Search, ShieldCheck, Wallet, PieChart,
  FileText, TrendingUp, Award, Layers
} from 'lucide-react';

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Stock Trade' | 'Crypto Trade';
  amount: number;
  currency: string;
  method: 'M-Pesa' | 'Bank Wire' | 'Crypto (BTC/USDT)' | 'Internal Balance';
  status: 'Completed' | 'Pending Review' | 'Failed' | 'Frozen (AML Alert)';
  timestamp: string;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

export default function TransactionsView() {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'financial' | 'liquidity'>('transactions');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-8901', userEmail: 'alex.vance@fund.org', userName: 'Alexander Vance', type: 'Deposit', amount: 45000, currency: 'USD', method: 'Bank Wire', status: 'Completed', timestamp: 'Today, 14:22', riskScore: 'Low' },
    { id: 'TX-8902', userEmail: 'm.thorne@trade.io', userName: 'Marcus Thorne', type: 'Withdrawal', amount: 12500, currency: 'USD', method: 'Bank Wire', status: 'Pending Review', timestamp: 'Today, 13:45', riskScore: 'Medium', notes: 'Large withdrawal requires manual 4-eye sign-off.' },
    { id: 'TX-8903', userEmail: 's.jenkins@invest.co', userName: 'Sarah Jenkins', type: 'Deposit', amount: 85000, currency: 'KES', method: 'M-Pesa', status: 'Completed', timestamp: 'Today, 12:10', riskScore: 'Low' },
    { id: 'TX-8904', userEmail: 'unknown_trader99@proton.me', userName: 'Dmitri K.', type: 'Withdrawal', amount: 3.45, currency: 'BTC', method: 'Crypto (BTC/USDT)', status: 'Frozen (AML Alert)', timestamp: 'Today, 11:05', riskScore: 'Critical', notes: 'Flagged by automated AML monitor: Destination wallet associated with mixer.' },
    { id: 'TX-8905', userEmail: 'elena.r@globalcapital.com', userName: 'Elena Rostova', type: 'Transfer', amount: 25000, currency: 'USD', method: 'Internal Balance', status: 'Completed', timestamp: 'Today, 09:30', riskScore: 'Low' },
    { id: 'TX-8906', userEmail: 'd.chen@apextech.io', userName: 'David Chen', type: 'Stock Trade', amount: 114200, currency: 'USD', method: 'Internal Balance', status: 'Completed', timestamp: 'Yesterday, 16:15', riskScore: 'Low' },
    { id: 'TX-8907', userEmail: 'crypto_whale@gmail.com', userName: 'Liam O-Connor', type: 'Crypto Trade', amount: 45000, currency: 'USDT', method: 'Crypto (BTC/USDT)', status: 'Failed', timestamp: 'Yesterday, 14:00', riskScore: 'Medium', notes: 'Slippage limit exceeded during flash spike.' },
  ]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleApproveWithdrawal = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Completed', notes: 'Approved by Admin.' } : tx));
    showToastMsg(`Withdrawal ${id} approved and dispatched to payment gateway.`);
  };

  const handleRejectWithdrawal = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Failed', notes: 'Rejected by Admin. Funds returned to wallet.' } : tx));
    showToastMsg(`Withdrawal ${id} rejected. Balance unlocked to user wallet.`);
  };

  const handleToggleFreeze = (id: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        if (tx.status === 'Frozen (AML Alert)') {
          showToastMsg(`Transaction ${id} unfrozen after AML clearance.`);
          return { ...tx, status: 'Completed', riskScore: 'Low', notes: 'Cleared manual AML review.' };
        } else {
          showToastMsg(`Transaction ${id} frozen under compliance investigation.`);
          return { ...tx, status: 'Frozen (AML Alert)', riskScore: 'Critical', notes: 'Frozen by Admin for fraud suspicion.' };
        }
      }
      return tx;
    }));
  };

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(search.toLowerCase()) || 
                          tx.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          tx.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Financial Summary Stats
  const stats = {
    depositsToday: '$130,000.00',
    withdrawalsToday: '$12,500.00',
    tradingVolume: '$4,820,450.00',
    commissionEarned: '$14,461.35',
    platformRevenue: '$28,920.00',
    successfulTrades: '1,428',
    failedTx: '14',
    fiatPool: '$12,450,000.00 (99.4% Liquid)',
    cryptoPool: '$8,210,000.00 Eqv (Cold & Hot Reserves)',
    mpesaFloat: 'KES 45,000,000 (Safaricom B2C Active)'
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 shadow-xl font-mono text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>FINANCIAL & AML GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Transaction & Financial Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            The Admin oversees financial activity, liquidity status, and transaction integrity. <strong className="text-slate-300">Note:</strong> Admins do not alter balances manually except under authorized support procedures or fraud mitigation protocols.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 shrink-0">
          {[
            { id: 'transactions', label: 'Transaction Monitoring', icon: CreditCard },
            { id: 'financial', label: 'Financial Metrics', icon: TrendingUp },
            { id: 'liquidity', label: 'Wallet & Liquidity', icon: Wallet },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: TRANSACTION MONITORING */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-6">
          {/* Quick Filter Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); }}
              className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Total Monitored Tx</div>
                <div className="text-2xl font-black text-white font-mono">{transactions.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div 
              onClick={() => { setStatusFilter('Pending Review'); setTypeFilter('ALL'); }}
              className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Pending Withdrawals</div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {transactions.filter(t => t.status === 'Pending Review').length}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div 
              onClick={() => { setStatusFilter('Frozen (AML Alert)'); setTypeFilter('ALL'); }}
              className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-rose-500/40 transition-colors"
            >
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Frozen / AML Alerts</div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {transactions.filter(t => t.status === 'Frozen (AML Alert)').length}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div 
              onClick={() => { setStatusFilter('Completed'); setTypeFilter('ALL'); }}
              className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Completed Today</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {transactions.filter(t => t.status === 'Completed').length}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Tx ID, user name, or email..."
                className="w-full bg-slate-900/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-mono transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">TYPE:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="Deposit">Deposits</option>
                  <option value="Withdrawal">Withdrawals</option>
                  <option value="Transfer">Transfers</option>
                  <option value="Stock Trade">Stock Trades</option>
                  <option value="Crypto Trade">Crypto Trades</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Frozen (AML Alert)">Frozen (AML Alert)</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-5 font-bold">Tx ID & Timestamp</th>
                    <th className="py-3.5 px-5 font-bold">User Information</th>
                    <th className="py-3.5 px-5 font-bold">Type & Method</th>
                    <th className="py-3.5 px-5 font-bold">Amount</th>
                    <th className="py-3.5 px-5 font-bold">Risk Score</th>
                    <th className="py-3.5 px-5 font-bold">Status & Notes</th>
                    <th className="py-3.5 px-5 font-bold text-right">Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filtered.length > 0 ? (
                    filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-white text-sm">{tx.id}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{tx.timestamp}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-white">{tx.userName}</div>
                          <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-bold text-blue-400">{tx.type}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tx.method}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-black text-sm text-white">
                            {tx.currency === 'USD' || tx.currency === 'USDT' ? '$' : tx.currency === 'KES' ? 'KES ' : ''}
                            {tx.amount.toLocaleString()} {tx.currency === 'BTC' ? 'BTC' : ''}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.riskScore === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                            tx.riskScore === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                          }`}>
                            {tx.riskScore} Risk
                          </span>
                        </td>
                        <td className="py-4 px-5 max-w-[220px]">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                            tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            tx.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            tx.status === 'Frozen (AML Alert)' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {tx.status}
                          </span>
                          {tx.notes && <div className="text-[10px] text-slate-400 mt-1 italic truncate" title={tx.notes}>{tx.notes}</div>}
                        </td>
                        <td className="py-4 px-5 text-right space-x-1.5">
                          {tx.status === 'Pending Review' && (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(tx.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                                title="Approve manual withdrawal"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(tx.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                                title="Reject and refund"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleFreeze(tx.id)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                              tx.status === 'Frozen (AML Alert)'
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border-slate-800'
                            }`}
                            title={tx.status === 'Frozen (AML Alert)' ? 'Unfreeze transaction' : 'Freeze transaction for AML review'}
                          >
                            {tx.status === 'Frozen (AML Alert)' ? 'Unfreeze' : 'Freeze (AML)'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        No transactions match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FINANCIAL MONITORING */}
      {activeSubTab === 'financial' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Total Platform Deposits Today</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{stats.depositsToday}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">+14.2%</span> vs yesterday average
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Total Withdrawals Today</div>
                <div className="text-3xl font-black text-amber-400 font-mono mt-1">{stats.withdrawalsToday}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-bold">Normal Ratio</span> (9.6% of deposit volume)
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Total Trading Volume (24h)</div>
                <div className="text-3xl font-black text-white font-mono mt-1">{stats.tradingVolume}</div>
                <div className="text-xs text-slate-400 mt-2">Combined equities & crypto settlement</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Commission Earned Today</div>
                <div className="text-3xl font-black text-purple-400 font-mono mt-1">{stats.commissionEarned}</div>
                <div className="text-xs text-slate-400 mt-2">0.30% average institutional take-rate</div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Net Platform Revenue (MTD)</div>
                <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{stats.platformRevenue}</div>
                <div className="text-xs text-slate-400 mt-2">After liquidity provider rebates & data fees</div>
              </div>
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Settlement Efficiency</div>
                <div className="text-3xl font-black text-white font-mono mt-1">99.03%</div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  <span className="text-emerald-400 font-bold">{stats.successfulTrades} Successful</span> / <span className="text-rose-400 font-bold">{stats.failedTx} Failed</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Revenue Breakdown & Regulatory Notice */}
          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Institutional Financial Controls Audit
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              All financial metrics shown represent real-time aggregated ledger settlements across institutional equity grids, retail M-Pesa gateways, and crypto multi-sig vaults. Per SOC-2 Type II compliance, administrative accounts do not possess direct modification privileges over individual client cash or asset holdings. Manual ledger overrides require dual-token authentication and cryptographic audit trail generation.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WALLET & LIQUIDITY STATUS */}
      {activeSubTab === 'liquidity' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Fiat Currency Pool</h3>
                    <div className="text-xs font-mono text-emerald-400">Tier 1 Bank Custody</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">HEALTHY</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-slate-400 font-mono">TOTAL RESERVE LIQUIDITY</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{stats.fiatPool}</div>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full w-[99.4%]" />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Allocated: $12.37M</span>
                <span>Buffer: $80,000</span>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Crypto Multi-Sig Reserves</h3>
                    <div className="text-xs font-mono text-purple-400">Cold (90%) / Hot (10%)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-mono font-bold">SECURE</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-slate-400 font-mono">TOTAL CRYPTO LIQUIDITY</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{stats.cryptoPool}</div>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 flex">
                <div className="bg-purple-500 h-full w-[90%]" title="Cold Storage" />
                <div className="bg-cyan-400 h-full w-[10%]" title="Hot Wallet Float" />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Cold Storage: $7.39M</span>
                <span>Hot Float: $821,000</span>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">M-Pesa Mobile Money Pool</h3>
                    <div className="text-xs font-mono text-cyan-400">Safaricom PayBill / B2C Float</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">ONLINE</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-slate-400 font-mono">AVAILABLE PAYOUT FLOAT</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{stats.mpesaFloat}</div>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full w-[94%]" />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Daily Cap: KES 50.0M</span>
                <span>Utilized: KES 5.0M</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Automated Liquidity Rebalancing Protocol
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When hot wallet reserves fall below 15% of daily withdrawal volume, automated smart contracts trigger a multi-sig replenishment request from cold vault custody. All fiat currency settlements undergo daily reconciliation with partner banks at 00:00 UTC.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
