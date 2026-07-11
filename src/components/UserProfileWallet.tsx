import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowUp,
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Copy, 
  CreditCard, 
  Building, 
  TrendingUp, 
  PieChart, 
  Shield
} from 'lucide-react';

interface UserProfileWalletProps {
  theme?: 'light' | 'dark';
}

export default function UserProfileWallet({ theme = 'light' }: UserProfileWalletProps) {
  const [copied, setCopied] = useState(false);
  const [fiatBalance, setFiatBalance] = useState(24500.00);
  const [investedBalance] = useState(118350.40);
  const [marginBalance] = useState(50000.00);
  
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [hoveredTab, setHoveredTab] = useState<'deposit' | 'withdraw' | null>(null);
  const [modalHoveredTab, setModalHoveredTab] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_ach');
  const [transactions, setTransactions] = useState([
    { id: 'TX-9942', type: 'Money Added', method: 'Bank Wire (Chase ACH ****4920)', amount: '+$5,000.00', date: 'Today, 10:42 AM', status: 'Completed', isPositive: true },
    { id: 'TX-9810', type: 'Stock Purchase', method: 'Bought 10 NVDA @ $128.50', amount: '-$1,285.00', date: 'Yesterday, 3:15 PM', status: 'Completed', isPositive: false },
    { id: 'TX-9755', type: 'Dividend Received', method: 'AAPL Quarterly Dividend', amount: '+$142.80', date: 'Jun 28, 2026', status: 'Completed', isPositive: true },
    { id: 'TX-9612', type: 'Money Withdrawn', method: 'Bank Wire (Chase ACH ****4920)', amount: '-$2,500.00', date: 'Jun 25, 2026', status: 'Completed', isPositive: false },
  ]);

  const totalPortfolioValue = fiatBalance + investedBalance;
  const currentHeaderTab = hoveredTab || activeModal || 'deposit';
  const currentModalTab = modalHoveredTab || activeModal || 'deposit';

  const handleCopyId = () => {
    navigator.clipboard.writeText('UID-8849-NS-2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (activeModal === 'deposit') {
      setFiatBalance(prev => prev + numAmount);
      setTransactions(prev => [
        {
          id: `TX-${Date.now().toString().slice(-4)}`,
          type: 'Money Added',
          method: method === 'bank_ach' ? 'Bank ACH Transfer' : method === 'wire' ? 'Direct Bank Wire' : 'Crypto USDT Deposit',
          amount: `+$${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          date: 'Just now',
          status: 'Completed',
          isPositive: true
        },
        ...prev
      ]);
    } else if (activeModal === 'withdraw') {
      if (numAmount > fiatBalance) {
        alert('Insufficient available fiat balance for withdrawal.');
        return;
      }
      setFiatBalance(prev => prev - numAmount);
      setTransactions(prev => [
        {
          id: `TX-${Date.now().toString().slice(-4)}`,
          type: 'Money Withdrawn',
          method: method === 'bank_ach' ? 'Bank ACH Transfer' : method === 'wire' ? 'Direct Bank Wire' : 'Crypto Wallet Transfer',
          amount: `-$${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          date: 'Processing...',
          status: 'Processing',
          isPositive: false
        },
        ...prev
      ]);
    }
    setAmount('');
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-slate-800 dark:text-slate-300">
      {/* Top Banner: User Profile & Verification Header */}
      <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Circular Light Blue Avatar as shown in screenshot */}
            <div className="w-20 h-20 rounded-full bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
              <User className="w-10 h-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                  Christian S.
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Tier-3 Verified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 font-mono text-xs">
                <span className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60 px-3 py-1 rounded-lg font-medium">
                  USER ID: UID-8849-NS-2026
                  <button onClick={handleCopyId} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors ml-0.5" title="Copy User ID">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-sans font-medium text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 2FA Enabled
                </span>
              </div>
            </div>
          </div>

          <div 
            className="flex items-center p-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl gap-1 shrink-0 shadow-inner relative pt-2 md:pt-0"
            onMouseLeave={() => setHoveredTab(null)}
          >
            <button
              type="button"
              onClick={() => { setActiveModal('deposit'); if (!amount || amount === '0') setAmount('1000'); }}
              onMouseEnter={() => setHoveredTab('deposit')}
              className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2.5 cursor-pointer shrink-0 z-10 ${
                currentHeaderTab === 'deposit'
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {currentHeaderTab === 'deposit' && (
                <motion.div
                  layoutId="wallet-header-active-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30"
                  style={{ zIndex: -1 }}
                />
              )}
              <ArrowDownLeft className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveModal('withdraw'); if (!amount || amount === '0') setAmount('500'); }}
              onMouseEnter={() => setHoveredTab('withdraw')}
              className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2.5 cursor-pointer shrink-0 z-10 ${
                currentHeaderTab === 'withdraw'
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {currentHeaderTab === 'withdraw' && (
                <motion.div
                  layoutId="wallet-header-active-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30"
                  style={{ zIndex: -1 }}
                />
              )}
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Metric Grid (Account Balances Matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Account Value */}
        <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">Total Account Value</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight mb-3">
              ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs font-mono flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">↑ +$4,820.15 (+3.48%)</span>
            <span className="text-slate-400 dark:text-slate-500">24h gain</span>
          </div>
        </div>

        {/* Card 2: Available Cash */}
        <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">Available Cash</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight mb-3">
              ${fiatBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs font-mono flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-400 dark:text-slate-500">Ready to Withdraw</span>
            <button onClick={() => setActiveModal('withdraw')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer">Withdraw →</button>
          </div>
        </div>

        {/* Card 3: Money Invested */}
        <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">Money Invested</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight mb-3">
              ${investedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            Invested in 8 Holdings
          </div>
        </div>

        {/* Card 4: Available Borrowing Power */}
        <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">Available Borrowing Power</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight mb-3">
              ${marginBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            2× Borrowing Limit
          </div>
        </div>
      </div>

      {/* Deposit / Withdraw Modal Panel */}
      {activeModal && (
        <div className="bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
            <div 
              className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 relative w-fit shadow-inner"
              onMouseLeave={() => setModalHoveredTab(null)}
            >
              <button
                type="button"
                onClick={() => { setActiveModal('deposit'); if (!amount || amount === '0') setAmount('1000'); }}
                onMouseEnter={() => setModalHoveredTab('deposit')}
                className={`relative px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer z-10 ${
                  currentModalTab === 'deposit'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {currentModalTab === 'deposit' && (
                  <motion.div
                    layoutId="modal-tab-pill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    className="absolute inset-0 bg-blue-600 rounded-lg shadow-md shadow-blue-600/30"
                    style={{ zIndex: -1 }}
                  />
                )}
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveModal('withdraw'); if (!amount || amount === '0') setAmount('500'); }}
                onMouseEnter={() => setModalHoveredTab('withdraw')}
                className={`relative px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer z-10 ${
                  currentModalTab === 'withdraw'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {currentModalTab === 'withdraw' && (
                  <motion.div
                    layoutId="modal-tab-pill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    className="absolute inset-0 bg-blue-600 rounded-lg shadow-md shadow-blue-600/30"
                    style={{ zIndex: -1 }}
                  />
                )}
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </button>
            </div>

            <button 
              onClick={() => setActiveModal(null)} 
              className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-300 transition-colors cursor-pointer self-start sm:self-auto font-semibold"
            >
              Close [ESC]
            </button>
          </div>

          <form onSubmit={handleTransactionSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-2">Select Transfer Method</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMethod('bank_ach')}
                  className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all ${
                    method === 'bank_ach' ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-700/80 dark:bg-blue-950/80 dark:text-blue-200 font-bold shadow-sm ring-1 ring-blue-500/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  <Building className={`w-4 h-4 mb-1.5 ${method === 'bank_ach' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <div>Bank ACH</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">Chase ****4920</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('wire')}
                  className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all ${
                    method === 'wire' ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-700/80 dark:bg-blue-950/80 dark:text-blue-200 font-bold shadow-sm ring-1 ring-blue-500/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 mb-1.5 ${method === 'wire' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <div>Direct Wire</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">Same Day Settlement</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('crypto')}
                  className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all ${
                    method === 'crypto' ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-700/80 dark:bg-blue-950/80 dark:text-blue-200 font-bold shadow-sm ring-1 ring-blue-500/20' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  <Wallet className={`w-4 h-4 mb-1.5 ${method === 'crypto' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <div>Crypto USDT</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">TRC20 / ERC20</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-2">Enter Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-9 pr-4 text-slate-900 dark:text-white font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[250, 500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono text-xs transition-all cursor-pointer"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                {activeModal === 'deposit' ? 'Confirm Deposit →' : 'Confirm Withdraw →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-[#0b0e14] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">Recent Activity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">History of deposits, withdrawals, and trade settlements</p>
        </div>

        <div className="space-y-3.5">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-4 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'Money Added' || tx.type === 'Dividend Received'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : tx.type === 'Stock Purchase'
                    ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {tx.type === 'Money Added' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : tx.type === 'Stock Purchase' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : tx.type === 'Dividend Received' ? (
                    <DollarSign className="w-5 h-5" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-slate-900 dark:text-white text-base font-sans">{tx.type}</span>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800/80">{tx.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">{tx.method}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className={`font-mono font-extrabold text-base sm:text-lg ${
                  tx.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {tx.amount}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center justify-end gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tx.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

