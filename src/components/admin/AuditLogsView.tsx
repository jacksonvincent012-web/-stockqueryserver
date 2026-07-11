import React, { useState } from 'react';
import { 
  ScrollText, Search, Filter, ShieldCheck, ShieldAlert, 
  UserCheck, History, AlertTriangle, CheckCircle2, Eye, 
  Download, Key, Globe, Cpu, Lock
} from 'lucide-react';

export default function AuditLogsView() {
  const [activeTab, setActiveTab] = useState<'audit' | 'login' | 'kyc' | 'aml'>('audit');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const auditLogs = [
    { timestamp: '2026-05-28 14:32:01 UTC', actor: 'admin_vance', action: 'Triggered "Clear All Caches" operation', target: 'System Node 3', ip: '192.168.1.45', severity: 'Info' },
    { timestamp: '2026-05-28 14:22:15 UTC', actor: 'admin_rostova', action: 'Approved manual M-Pesa deposit KES 85,000', target: 'Christian Sirlil (USR-06)', ip: '192.168.1.88', severity: 'High' },
    { timestamp: '2026-05-28 13:50:40 UTC', actor: 'admin_vance', action: 'Frozen transaction TX-8904 due to AML mixer flag', target: 'Dmitri K. (USR-04)', ip: '192.168.1.45', severity: 'Critical' },
    { timestamp: '2026-05-28 13:10:00 UTC', actor: 'SYSTEM_CRON', action: 'Automated database snapshot and S3 backup completed', target: 'DB Cluster 1', ip: 'internal_worker_02', severity: 'Info' },
    { timestamp: '2026-05-28 12:45:12 UTC', actor: 'analyst_thorne', action: 'Published research report "Tech Sector Alpha Q3"', target: 'Research Center', ip: '192.168.1.104', severity: 'Info' },
    { timestamp: '2026-05-28 11:30:05 UTC', actor: 'admin_rostova', action: 'Upgraded KYC status to Verified for Amara Okafor', target: 'Amara Okafor (USR-09)', ip: '192.168.1.88', severity: 'Medium' },
    { timestamp: '2026-05-28 10:15:22 UTC', actor: 'admin_vance', action: 'Unlocked suspended user account sterling.j', target: 'James Sterling (USR-07)', ip: '192.168.1.45', severity: 'High' },
  ];

  const loginHistory = [
    { timestamp: 'Today, 14:30 UTC', user: 'alex.vance@fund.org', role: 'Administrator', ip: '192.168.1.45', location: 'London, UK', device: 'macOS / Safari', status: 'Success' },
    { timestamp: 'Today, 14:12 UTC', user: 'amara.o@tradehub.ke', role: 'User', ip: '102.0.12.99', location: 'Nairobi, Kenya', device: 'Android / Chrome', status: 'Failed (Locked)' },
    { timestamp: 'Today, 13:45 UTC', user: 'sirlilchristian@gmail.com', role: 'User', ip: '197.248.1.10', location: 'Nairobi, Kenya', device: 'iOS / Safari', status: 'Success' },
    { timestamp: 'Today, 12:20 UTC', user: 'thorne.m@stockquery.internal', role: 'Analyst', ip: '192.168.1.104', location: 'New York, USA', device: 'Windows / Edge', status: 'Success' },
    { timestamp: 'Today, 11:05 UTC', user: 'unknown_trader99@proton.me', role: 'User', ip: '185.220.101.5', location: 'Tor Network Exit', device: 'Linux / Firefox', status: 'Blocked (AML rule)' },
    { timestamp: 'Yesterday, 19:15 UTC', user: 'rostova.e@stockquery.internal', role: 'Administrator', ip: '82.112.5.44', location: 'Frankfurt, DE', device: 'macOS / Chrome', status: 'Success' },
  ];

  const amlAlerts = [
    { id: 'AML-901', user: 'Dmitri K. (unknown_trader99@proton.me)', rule: 'Mixer / Sanctioned Destination Address', amount: '3.45 BTC ($235,000)', status: 'Active Freeze', risk: 'Critical', timestamp: 'Today, 11:05' },
    { id: 'AML-902', user: 'Liam O-Connor (crypto_whale@gmail.com)', rule: 'High-Velocity Rapid Structuring (<$10k limit)', amount: '$48,500 over 6 tx', status: 'Under Investigation', risk: 'High', timestamp: 'Yesterday, 18:20' },
    { id: 'AML-903', user: 'Anonymous Entity (wallet: 0x981...b2c1)', rule: 'Cross-border flash liquidity pool swap', amount: '120 ETH ($380,000)', status: 'Cleared / Verified', risk: 'Medium', timestamp: '3 days ago' },
  ];

  const kycAudit = [
    { id: 'KYC-501', user: 'Christian Sirlil', email: 'sirlilchristian@gmail.com', docType: 'National ID (Kenya)', ocrScore: '99.4% Match', amlScreening: 'Clear (No PEP/Sanction hit)', status: 'Pending Review', submitted: 'Today, 10:15' },
    { id: 'KYC-502', user: 'Amara Okafor', email: 'amara.o@tradehub.ke', docType: 'Passport (Nigeria)', ocrScore: '98.8% Match', amlScreening: 'Clear (No PEP/Sanction hit)', status: 'Verified', submitted: 'Yesterday' },
    { id: 'KYC-503', user: 'James Sterling', email: 'sterling.j@stockquery.internal', docType: 'Driver License (US)', ocrScore: '82.1% (Blurry scan)', amlScreening: 'Clear', status: 'Rejected', submitted: '5 days ago' },
    { id: 'KYC-504', user: 'David Chen', email: 'chen.d@apextech.io', docType: 'National ID (Singapore)', ocrScore: '99.9% Match', amlScreening: 'Clear', status: 'Verified', submitted: '1 week ago' },
  ];

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
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>INSTITUTIONAL REGULATORY COMPLIANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Compliance & Regulatory Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Immutable audit logs, login histories, KYC documentation screening, and real-time AML (Anti-Money Laundering) fraud monitoring.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 shrink-0 flex-wrap">
          {[
            { id: 'audit', label: 'Audit Logs', icon: ScrollText },
            { id: 'login', label: 'Login History', icon: History },
            { id: 'kyc', label: 'KYC Status', icon: UserCheck },
            { id: 'aml', label: 'AML Monitoring', icon: ShieldAlert },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail by actor, action, target, or IP address..."
                className="w-full bg-slate-900/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs font-mono transition-all"
              />
            </div>
            <button 
              onClick={() => showToastMsg('Audit log archive downloaded (CSV / Signed JSON).')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Signed Audit Trail</span>
            </button>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/80">
                  <th className="py-3.5 px-5 font-bold">UTC Timestamp</th>
                  <th className="py-3.5 px-5 font-bold">Admin / Actor</th>
                  <th className="py-3.5 px-5 font-bold">Action Performed</th>
                  <th className="py-3.5 px-5 font-bold">Target Entity</th>
                  <th className="py-3.5 px-5 font-bold">Source IP Address</th>
                  <th className="py-3.5 px-5 font-bold text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5 text-slate-400">{log.timestamp}</td>
                    <td className="py-4 px-5 font-bold text-white">{log.actor}</td>
                    <td className="py-4 px-5 text-slate-300">{log.action}</td>
                    <td className="py-4 px-5 text-blue-400 font-bold">{log.target}</td>
                    <td className="py-4 px-5 text-slate-500">{log.ip}</td>
                    <td className="py-4 px-5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        log.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        log.severity === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOGIN HISTORY */}
      {activeTab === 'login' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/80">
                  <th className="py-3.5 px-5 font-bold">Timestamp</th>
                  <th className="py-3.5 px-5 font-bold">User Account</th>
                  <th className="py-3.5 px-5 font-bold">Role</th>
                  <th className="py-3.5 px-5 font-bold">IP Address</th>
                  <th className="py-3.5 px-5 font-bold">Geo-Location</th>
                  <th className="py-3.5 px-5 font-bold">Client Device</th>
                  <th className="py-3.5 px-5 font-bold text-right">Login Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {loginHistory.map((login, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5 text-slate-400">{login.timestamp}</td>
                    <td className="py-4 px-5 font-bold text-white">{login.user}</td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {login.role}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">{login.ip}</td>
                    <td className="py-4 px-5 text-slate-300">{login.location}</td>
                    <td className="py-4 px-5 text-slate-500">{login.device}</td>
                    <td className="py-4 px-5 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                        login.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        login.status.includes('Blocked') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {login.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KYC STATUS AUDIT */}
      {activeTab === 'kyc' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/80">
                  <th className="py-3.5 px-5 font-bold">KYC ID & Date</th>
                  <th className="py-3.5 px-5 font-bold">User Information</th>
                  <th className="py-3.5 px-5 font-bold">Document Submitted</th>
                  <th className="py-3.5 px-5 font-bold">AI OCR Confidence</th>
                  <th className="py-3.5 px-5 font-bold">PEP / Sanction Screening</th>
                  <th className="py-3.5 px-5 font-bold text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {kycAudit.map((kyc, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{kyc.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{kyc.submitted}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{kyc.user}</div>
                      <div className="text-[11px] text-slate-400">{kyc.email}</div>
                    </td>
                    <td className="py-4 px-5 text-blue-400 font-bold">{kyc.docType}</td>
                    <td className="py-4 px-5">
                      <span className="text-emerald-400 font-bold">{kyc.ocrScore}</span>
                    </td>
                    <td className="py-4 px-5 text-slate-300">{kyc.amlScreening}</td>
                    <td className="py-4 px-5 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                        kyc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        kyc.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {kyc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AML MONITORING */}
      {activeTab === 'aml' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Active AML Flagged Cases</div>
                <div className="text-2xl font-black text-rose-400 font-mono">2 Under Freeze</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">Automated Rule Engine</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">48 Rules Active</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400 mb-1">FATF / FINCEN Status</div>
                <div className="text-2xl font-black text-blue-400 font-mono">Compliant</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Flagged Anti-Money Laundering (AML) Investigations
              </h3>
              <button 
                onClick={() => showToastMsg('AML compliance report generated for regulatory submission.')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                File SAR (Suspicious Activity Report)
              </button>
            </div>

            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/80">
                  <th className="py-3.5 px-5 font-bold">Case ID & Time</th>
                  <th className="py-3.5 px-5 font-bold">Entity / User</th>
                  <th className="py-3.5 px-5 font-bold">Triggered AML Rule</th>
                  <th className="py-3.5 px-5 font-bold">Transaction Value</th>
                  <th className="py-3.5 px-5 font-bold">Risk Rating</th>
                  <th className="py-3.5 px-5 font-bold text-right">Investigation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {amlAlerts.map((aml, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{aml.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{aml.timestamp}</div>
                    </td>
                    <td className="py-4 px-5 font-bold text-white">{aml.user}</td>
                    <td className="py-4 px-5 text-amber-400 font-bold">{aml.rule}</td>
                    <td className="py-4 px-5 text-white font-bold">{aml.amount}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        aml.risk === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        aml.risk === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {aml.risk}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                        aml.status.includes('Freeze') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
                        aml.status.includes('Investigation') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {aml.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
