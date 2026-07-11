import React, { useState } from 'react';
import { 
  Users, Shield, CheckCircle2, Search, Filter, UserCheck, 
  UserX, UserPlus, KeyRound, Edit3, ShieldCheck, 
  AlertTriangle, Lock, Unlock, FileCheck, X
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Analyst' | 'User' | 'Viewer';
  status: 'Active' | 'Suspended' | 'Locked';
  kycStatus: 'Verified' | 'Pending Review' | 'Rejected' | 'Not Submitted';
  lastActive: string;
  phone?: string;
  accountBalance?: string;
}

export default function UsersView() {
  const [users, setUsers] = useState<UserRecord[]>([
    { id: 'USR-01', name: 'Alexander Vance', email: 'vance.a@stockquery.internal', role: 'Administrator', status: 'Active', kycStatus: 'Verified', lastActive: 'Active now', phone: '+1 (555) 019-2831' },
    { id: 'USR-02', name: 'Elena Rostova', email: 'rostova.e@stockquery.internal', role: 'Administrator', status: 'Active', kycStatus: 'Verified', lastActive: '12 mins ago', phone: '+44 20 7946 0921' },
    { id: 'USR-03', name: 'Marcus Thorne', email: 'thorne.m@stockquery.internal', role: 'Analyst', status: 'Active', kycStatus: 'Verified', lastActive: '1 hour ago', phone: '+1 (555) 014-4920' },
    { id: 'USR-04', name: 'Sarah Jenkins', email: 'jenkins.s@stockquery.internal', role: 'Analyst', status: 'Active', kycStatus: 'Verified', lastActive: '3 hours ago', phone: '+1 (555) 018-3829' },
    { id: 'USR-05', name: 'David Chen', email: 'chen.d@stockquery.internal', role: 'Analyst', status: 'Active', kycStatus: 'Verified', lastActive: '1 day ago', phone: '+65 6789 0123' },
    { id: 'USR-06', name: 'Christian Sirlil', email: 'sirlilchristian@gmail.com', role: 'User', status: 'Active', kycStatus: 'Pending Review', lastActive: '5 mins ago', phone: '+254 711 234 567', accountBalance: '$14,250.00' },
    { id: 'USR-07', name: 'James Sterling', email: 'sterling.j@stockquery.internal', role: 'User', status: 'Suspended', kycStatus: 'Rejected', lastActive: '5 days ago', phone: '+1 (555) 012-9988' },
    { id: 'USR-08', name: 'Compliance Robot Service', email: 'svc-compliance@stockquery.internal', role: 'Viewer', status: 'Active', kycStatus: 'Verified', lastActive: 'Just now' },
    { id: 'USR-09', name: 'Amara Okafor', email: 'amara.o@tradehub.ke', role: 'User', status: 'Locked', kycStatus: 'Pending Review', lastActive: '2 days ago', phone: '+254 722 000 111', accountBalance: 'KES 450,000' },
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [kycFilter, setKycFilter] = useState('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User' as UserRecord['role'],
    status: 'Active' as UserRecord['status'],
    kycStatus: 'Pending Review' as UserRecord['kycStatus'],
    phone: ''
  });

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'User',
      status: 'Active',
      kycStatus: 'Pending Review',
      phone: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      phone: user.phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      showToastMsg(`User account ${editingUser.name} updated successfully.`);
    } else {
      const newId = `USR-${String(users.length + 10).padStart(2, '0')}`;
      const newUser: UserRecord = {
        id: newId,
        ...formData,
        lastActive: 'Never (New Account)'
      };
      setUsers(prev => [newUser, ...prev]);
      showToastMsg(`New user account created: ${formData.name} (${newId}).`);
    }
    setIsModalOpen(false);
  };

  const handleRoleChange = (id: string, newRole: UserRecord['role']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    showToastMsg(`Permissions updated: Assigned "${newRole}" role.`);
  };

  const handleStatusChange = (id: string, nextStatus: UserRecord['status']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    showToastMsg(`Account access status changed to "${nextStatus}".`);
  };

  const handleVerifyKyc = (id: string, newKyc: 'Verified' | 'Rejected') => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: newKyc } : u));
    showToastMsg(newKyc === 'Verified' ? `KYC documents verified! User identity confirmed.` : `KYC verification rejected.`);
  };

  const handleResetPassword = (email: string, name: string) => {
    showToastMsg(`Password reset link dispatched to ${email} (${name}).`);
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesKyc = kycFilter === 'ALL' || u.kycStatus === kycFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesKyc;
  });

  const adminCount = users.filter(u => u.role === 'Administrator').length;
  const analystCount = users.filter(u => u.role === 'Analyst').length;
  const pendingKycCount = users.filter(u => u.kycStatus === 'Pending Review').length;
  const lockedOrSuspended = users.filter(u => u.status === 'Locked' || u.status === 'Suspended').length;

  const getRoleStyle = (role: UserRecord['role']) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Analyst': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'User': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Viewer': return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
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
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>INSTITUTIONAL IDENTITY & ACCESS CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            User Management & KYC Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Create, edit, suspend, and restore accounts. Verify KYC documents, reset credentials, and assign administrative or trading permissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); setKycFilter('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Total Registered Users</div>
            <div className="text-2xl font-black text-white font-mono">{users.length} Accounts</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setKycFilter('Pending Review'); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Pending KYC Verification</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{pendingKycCount} Documents</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setRoleFilter('Administrator'); setStatusFilter('ALL'); setKycFilter('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Admin & Analyst Corps</div>
            <div className="text-2xl font-black text-purple-400 font-mono">{adminCount + analystCount} Personnel</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setStatusFilter('Locked'); setRoleFilter('ALL'); setKycFilter('ALL'); }}
          className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between cursor-pointer hover:border-rose-500/40 transition-colors"
        >
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Locked / Suspended</div>
            <div className="text-2xl font-black text-rose-400 font-mono">{lockedOrSuspended} Accounts</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or phone number..."
            className="w-full bg-slate-900/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-xs font-mono transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Analyst">Analyst</option>
              <option value="User">User</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">KYC:</span>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
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
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Locked">Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-5 font-bold">User Identity</th>
                <th className="py-3.5 px-5 font-bold">Role & Permissions</th>
                <th className="py-3.5 px-5 font-bold">KYC Verification</th>
                <th className="py-3.5 px-5 font-bold">Account Status</th>
                <th className="py-3.5 px-5 font-bold">Last Activity</th>
                <th className="py-3.5 px-5 font-bold text-right">Admin Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          u.role === 'Administrator' ? 'bg-purple-600 text-white' :
                          u.role === 'Analyst' ? 'bg-blue-600 text-white' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {u.name}
                            <span className="text-[10px] text-slate-500 font-mono">({u.id})</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-slate-500 mt-0.5">{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] focus:outline-none cursor-pointer ${getRoleStyle(u.role)}`}
                      >
                        <option value="Administrator" className="bg-slate-900 text-white">Administrator</option>
                        <option value="Analyst" className="bg-slate-900 text-white">Analyst</option>
                        <option value="User" className="bg-slate-900 text-white">User</option>
                        <option value="Viewer" className="bg-slate-900 text-white">Viewer</option>
                      </select>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          u.kycStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          u.kycStatus === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {u.kycStatus}
                        </span>
                        {u.kycStatus === 'Pending Review' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleVerifyKyc(u.id, 'Verified')}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Approve KYC Document"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleVerifyKyc(u.id, 'Rejected')}
                              className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white"
                              title="Reject KYC Document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        u.status === 'Locked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      <div>{u.lastActive}</div>
                      {u.accountBalance && <div className="text-[10px] text-blue-400 font-bold mt-0.5">Bal: {u.accountBalance}</div>}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => handleResetPassword(u.email, u.name)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-800 transition-all"
                        title="Send Password Reset"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-slate-800 transition-all"
                        title="Edit Account Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {u.status === 'Active' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(u.id, 'Suspended')}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-800 text-[10px] font-bold transition-all"
                            title="Suspend user account"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleStatusChange(u.id, 'Locked')}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 text-[10px] font-bold transition-all"
                            title="Lock account for security/fraud"
                          >
                            Lock
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.id, 'Active')}
                          className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition-all flex items-center gap-1 inline-flex"
                          title="Restore and Unlock account"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No personnel or users found matching the selected search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white">
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New User Account'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Christian Sirlil"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +254 711 000 111"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Role Assignment</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="User">User (Trader)</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">KYC Verification Status</label>
                <select
                  value={formData.kycStatus}
                  onChange={e => setFormData({ ...formData, kycStatus: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Submitted">Not Submitted</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
