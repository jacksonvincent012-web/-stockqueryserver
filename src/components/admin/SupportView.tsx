import React, { useState } from 'react';
import { 
  LifeBuoy, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  Lock, Unlock, RefreshCw, DollarSign, Key, UserCheck, Search,
  Filter, MessageSquare, ArrowRight, XCircle
} from 'lucide-react';

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  issueType: 'Locked Account' | 'Suspended User' | 'M-Pesa Issue' | 'Crypto Deposit Issue' | 'Payment Issue' | 'Identity Verification';
  subject: string;
  description: string;
  status: 'PENDING' | 'IN PROGRESS' | 'RESOLVED' | 'ESCALATED';
  timestamp: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  referenceNo?: string;
}

export default function SupportView() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '#TK-9021',
      userName: 'Amara Okafor',
      userEmail: 'amara.o@tradehub.ke',
      issueType: 'Locked Account',
      subject: 'Account locked after 5 failed login attempts',
      description: 'User locked out during volatility spike while attempting 2FA authentication from new device.',
      status: 'PENDING',
      timestamp: 'Today, 14:15',
      priority: 'High'
    },
    {
      id: '#TK-9022',
      userName: 'Christian Sirlil',
      userEmail: 'sirlilchristian@gmail.com',
      issueType: 'M-Pesa Issue',
      subject: 'M-Pesa KES 85,000 deposit debited from Safaricom but missing in wallet',
      description: 'Transaction confirmation received from M-Pesa (Ref: QX9281KL), but API timeout prevented instant ledger credit.',
      status: 'PENDING',
      timestamp: 'Today, 13:40',
      priority: 'Urgent',
      referenceNo: 'M-Pesa Ref: QX9281KL'
    },
    {
      id: '#TK-9023',
      userName: 'Dmitri K.',
      userEmail: 'unknown_trader99@proton.me',
      issueType: 'Crypto Deposit Issue',
      subject: '0.45 BTC deposit pending over 6 confirmations',
      description: 'Deposit transaction reached 12 blockchain confirmations on Bitcoin network but vault status shows unverified.',
      status: 'IN PROGRESS',
      timestamp: 'Today, 11:20',
      priority: 'High',
      referenceNo: 'TxHash: 3f9a...881c'
    },
    {
      id: '#TK-9024',
      userName: 'James Sterling',
      userEmail: 'sterling.j@stockquery.internal',
      issueType: 'Suspended User',
      subject: 'Request to unlock suspended trading account',
      description: 'Account suspended due to abnormal high-frequency order cancellation. User submitted explanatory compliance statement.',
      status: 'PENDING',
      timestamp: 'Yesterday, 16:50',
      priority: 'Medium'
    },
    {
      id: '#TK-9025',
      userName: 'Elena Rostova',
      userEmail: 'rostova.e@stockquery.internal',
      issueType: 'Payment Issue',
      subject: 'Bank wire transfer $25,000 held by intermediary clearing',
      description: 'Wire reference BW-9920 held in compliance queue. Bank clearance memo received this morning.',
      status: 'PENDING',
      timestamp: 'Yesterday, 14:10',
      priority: 'Medium',
      referenceNo: 'Wire Ref: BW-9920'
    },
    {
      id: '#TK-9026',
      userName: 'David Chen',
      userEmail: 'chen.d@stockquery.internal',
      issueType: 'Identity Verification',
      subject: 'KYC Document passport scan blur error',
      description: 'Automated OCR failed to read expiration date on submitted passport document.',
      status: 'RESOLVED',
      timestamp: '2 days ago',
      priority: 'Low'
    }
  ]);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleResolveAction = (id: string, actionType: string, ticket: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));

    switch (actionType) {
      case 'unlock_locked':
        showToastMsg(`Account for ${ticket.userName} unlocked. Temporary recovery token dispatched to ${ticket.userEmail}.`);
        break;
      case 'unlock_suspended':
        showToastMsg(`Suspension lifted for ${ticket.userName}. Full trading and withdrawal privileges restored.`);
        break;
      case 'mpesa':
        showToastMsg(`M-Pesa transaction (${ticket.referenceNo || 'QX9281KL'}) reconciled with Safaricom gateway. Funds credited to wallet.`);
        break;
      case 'crypto':
        showToastMsg(`Blockchain transaction verified. 0.45 BTC deposit credited to ${ticket.userName}'s multi-sig vault.`);
        break;
      case 'payment':
        showToastMsg(`Bank wire payment cleared through treasury queue. Balance updated.`);
        break;
      case 'identity':
        showToastMsg(`Identity verification override approved for ${ticket.userName}. KYC status upgraded to Verified.`);
        break;
      default:
        showToastMsg(`Ticket ${id} resolved successfully.`);
    }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(search.toLowerCase()) || 
                          t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || t.issueType === filterType;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = tickets.filter(t => t.status === 'PENDING' || t.status === 'IN PROGRESS').length;
  const urgentCount = tickets.filter(t => (t.status === 'PENDING' || t.status === 'IN PROGRESS') && (t.priority === 'Urgent' || t.priority === 'High')).length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

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
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>CUSTOMER SUPPORT & ESCALATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Administrative Support Tools
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Recover locked accounts, unlock suspended users, verify identities, and resolve payment, M-Pesa, or crypto deposit discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            OPEN TICKETS: <strong className="text-amber-400 font-bold">{pendingCount} PENDING</strong>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { setStatusFilter('ALL'); setFilterType('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Total Monitored Tickets</div>
            <div className="text-2xl font-black text-white font-mono">{tickets.length} Tickets</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setStatusFilter('PENDING'); setFilterType('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Urgent & High Priority</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{urgentCount} Requiring Action</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setStatusFilter('RESOLVED'); setFilterType('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Resolved Cases</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{resolvedCount} / {tickets.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID, user, subject, or reference number..."
            className="w-full bg-slate-900/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-mono transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">ISSUE TYPE:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Locked Account">Locked Accounts</option>
              <option value="Suspended User">Suspended Users</option>
              <option value="M-Pesa Issue">M-Pesa Issues</option>
              <option value="Crypto Deposit Issue">Crypto Deposit Issues</option>
              <option value="Payment Issue">Payment Issues</option>
              <option value="Identity Verification">Identity Verification</option>
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
              <option value="PENDING">Pending</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`bg-[#111827] border rounded-2xl p-6 shadow-xl transition-all ${
                ticket.status === 'RESOLVED' ? 'border-slate-800/80 opacity-80' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl shrink-0 font-bold ${
                    ticket.issueType === 'Locked Account' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    ticket.issueType === 'M-Pesa Issue' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    ticket.issueType === 'Crypto Deposit Issue' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    ticket.issueType === 'Suspended User' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {ticket.issueType === 'Locked Account' ? <Lock className="w-5 h-5" /> :
                     ticket.issueType === 'M-Pesa Issue' ? <DollarSign className="w-5 h-5" /> :
                     ticket.issueType === 'Crypto Deposit Issue' ? <Key className="w-5 h-5" /> :
                     ticket.issueType === 'Suspended User' ? <Unlock className="w-5 h-5" /> :
                     <UserCheck className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-sm text-white">{ticket.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300 uppercase">
                        {ticket.issueType}
                      </span>
                      {ticket.referenceNo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {ticket.referenceNo}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{ticket.subject}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono">
                      <span>User: <strong className="text-slate-200">{ticket.userName}</strong> ({ticket.userEmail})</span>
                      <span>•</span>
                      <span>{ticket.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start lg:self-center">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    ticket.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    ticket.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {ticket.priority} Priority
                  </span>

                  <span className={`px-3 py-1 rounded-md text-[11px] font-bold border ${
                    ticket.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    ticket.status === 'IN PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {ticket.status !== 'RESOLVED' ? (
                    <>
                      {ticket.issueType === 'Locked Account' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'unlock_locked', ticket)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Recover & Unlock Account</span>
                        </button>
                      )}

                      {ticket.issueType === 'Suspended User' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'unlock_suspended', ticket)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Unlock Suspended User</span>
                        </button>
                      )}

                      {ticket.issueType === 'M-Pesa Issue' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'mpesa', ticket)}
                          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Reconcile & Credit M-Pesa</span>
                        </button>
                      )}

                      {ticket.issueType === 'Crypto Deposit Issue' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'crypto', ticket)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Blockchain Tx</span>
                        </button>
                      )}

                      {ticket.issueType === 'Payment Issue' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'payment', ticket)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resolve Payment</span>
                        </button>
                      )}

                      {ticket.issueType === 'Identity Verification' && (
                        <button
                          onClick={() => handleResolveAction(ticket.id, 'identity', ticket)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Verify Identity (KYC)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleResolveAction(ticket.id, 'generic', ticket)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                        title="Mark ticket as resolved"
                      >
                        Close Ticket
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Resolved by Support Team
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No support tickets found matching the selected search or filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
