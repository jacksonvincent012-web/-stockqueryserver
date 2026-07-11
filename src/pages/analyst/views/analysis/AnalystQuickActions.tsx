import React, { useState } from 'react';
import {
  FileText,
  Download,
  GitCompare,
  Save,
  PlusCircle,
  Share2,
  CheckCircle2,
  TrendingUp,
  Briefcase
} from 'lucide-react';

interface AnalystQuickActionsProps {
  symbol: string;
  onNavigateTab?: (tab: any) => void;
  onAddToWatchlist?: (symbol: string) => void;
  onOpenCompare?: () => void;
  onExportData?: () => void;
  theme?: 'light' | 'dark';
}

export default function AnalystQuickActions({
  symbol,
  onNavigateTab,
  onAddToWatchlist,
  onOpenCompare,
  onExportData,
  theme = 'dark'
}: AnalystQuickActionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isLight = theme === 'light';

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateReport = () => {
    showFeedback(`Opening Report Crafting workspace for ${symbol}...`);
    if (onNavigateTab) {
      setTimeout(() => onNavigateTab('report_crafting'), 600);
    }
  };

  const handleExport = () => {
    if (onExportData) {
      onExportData();
    } else {
      // Create simple CSV export download
      const csvContent = `data:text/csv;charset=utf-8,Symbol,Date,Open,High,Low,Close,Volume\n${symbol},${new Date().toISOString().split('T')[0]},161.50,164.10,161.00,163.88,48320000`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${symbol}_SQ Platform_analysis.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showFeedback(`Exporting SQ Platform series data for ${symbol}...`);
  };

  const handleCompare = () => {
    if (onOpenCompare) {
      onOpenCompare();
    } else {
      showFeedback(`Opening asset comparison overlay for ${symbol}...`);
    }
  };

  const handleSave = () => {
    showFeedback(`Analysis configuration for ${symbol} saved to SQ Platform profile.`);
  };

  const handleAddWatchlist = () => {
    if (onAddToWatchlist) {
      onAddToWatchlist(symbol);
    }
    showFeedback(`${symbol} added to SQ Platform Watchlist.`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/analyst?symbol=${symbol}&view=analysis`);
    }
    showFeedback(`SQ Platform analysis link for ${symbol} copied to clipboard!`);
  };

  return (
    <div className="relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Action Buttons Bar */}
      <div className={`p-3 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-3 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0e14] border-slate-800 text-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">SQ Platform Analyst Workspace</h2>
            <p className="text-[10px] text-slate-400 font-mono">Real-time research, technical overlays & SQ Platform insights — Zero trading risk</p>
          </div>
        </div>

        {/* Buttons Grid / Flex */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Report</span>
          </button>

          <button
            onClick={handleExport}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Data</span>
          </button>

          <button
            onClick={handleCompare}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
            <span>Compare Company</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Analysis</span>
          </button>

          <button
            onClick={handleAddWatchlist}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add to Watchlist</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Share Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
