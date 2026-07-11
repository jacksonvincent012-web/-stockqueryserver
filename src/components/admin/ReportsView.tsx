import React from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';

export default function ReportsView() {
  return (
    <div className="space-y-6">
      <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-400" />
          Platform Reports
        </h2>
        <p className="text-slate-400 mt-2">Generate and download financial and usage reports for compliance and auditing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Monthly Trading Volume', desc: 'Detailed breakdown of all platform trades.', date: 'Oct 2023' },
          { title: 'System Uptime & SLA', desc: 'Infrastructure availability and downtime incidents.', date: 'Q3 2023' },
          { title: 'Active User Growth', desc: 'New registrations vs active traders over 30 days.', date: 'Last 30 Days' },
          { title: 'Compliance Audit', desc: 'Automated regulatory compliance checks.', date: 'Generated Today' }
        ].map(report => (
          <div key={report.title} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-center hover:border-slate-700 transition-colors cursor-pointer">
            <div>
              <h3 className="text-white font-bold">{report.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{report.desc}</p>
              <div className="text-xs font-mono text-emerald-400 mt-3">{report.date}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors">
              <Download className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
