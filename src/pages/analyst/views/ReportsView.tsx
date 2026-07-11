import React, { useState } from 'react';
import {
  FileText,
  Save,
  Eye,
  Download,
  Share2,
  Calendar,
  Check,
  Search,
  Plus,
  X,
  Sparkles,
  Copy,
  Mail,
  Users,
  Trash2,
  Edit3,
  Clock,
  TrendingUp,
  BarChart2,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Image,
  Maximize2,
  Undo,
  Redo,
  Activity
} from 'lucide-react';
import { INDEXED_STOCKS } from '../../../search';

interface ReportsViewProps {
  watchlistSymbols: string[];
  theme?: 'light' | 'dark';
}

interface SavedReport {
  id: string;
  title: string;
  type: string;
  created: string;
  status: 'Draft' | 'Published' | 'Shared';
  lastUpdated: string;
}

export default function ReportsView({ watchlistSymbols, theme = 'dark' }: ReportsViewProps) {
  // Section 1: Report Details
  const [reportTitle, setReportTitle] = useState<string>('Weekly Technology Market Review');
  const [reportType, setReportType] = useState<string>('Market Summary');
  const [dateRange, setDateRange] = useState<string>('May 21, 2026 - May 28, 2026');

  // Section 2: Choose Information
  const [selectedData, setSelectedData] = useState<string[]>([
    'Stock Prices',
    'Price History',
    'Company Information',
    'Technical Indicators',
    'Trading Volume',
    'Market News',
    'Sector Performance'
  ]);

  const allDataOptions = [
    'Stock Prices',
    'Price History',
    'Company Information',
    'Technical Indicators',
    'Trading Volume',
    'Market News',
    'Sector Performance',
    'Portfolio Performance',
    'Dividend Information',
    'Crypto Holdings',
    'Economic Indicators',
    'Analyst Ratings'
  ];

  const handleToggleData = (option: string) => {
    if (selectedData.includes(option)) {
      setSelectedData(selectedData.filter(d => d !== option));
    } else {
      setSelectedData([...selectedData, option]);
    }
  };

  // Section 3: Choose Stocks & Charts
  const [stockSearch, setStockSearch] = useState<string>('');
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA']);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'Price Chart',
    'Performance Chart',
    'Volume Chart',
    'Sector Breakdown',
    'Moving Average'
  ]);

  const chartOptions = [
    'Price Chart',
    'Performance Chart',
    'Volume Chart',
    'Sector Breakdown',
    'Moving Average',
    'RSI',
    'MACD'
  ];

  const handleAddStock = (symbol: string) => {
    if (!selectedStocks.includes(symbol)) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
    setStockSearch('');
  };

  const handleRemoveStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(s => s !== symbol));
  };

  const handleToggleChart = (chart: string) => {
    if (selectedCharts.includes(chart)) {
      setSelectedCharts(selectedCharts.filter(c => c !== chart));
    } else {
      setSelectedCharts([...selectedCharts, chart]);
    }
  };

  // Section 4 & 5: Notes & AI Insights
  const [notesText, setNotesText] = useState<string>(
    'NVIDIA continued its strong upward trend after reporting better-than-expected earnings.\n\nMicrosoft remains steady with consistent growth across cloud services.\n\nThe technology sector shows overall positive momentum with increased investor confidence.\n\nKey risks include global macroeconomic uncertainty and interest rate decisions.'
  );

  const [aiInsightsText, setAiInsightsText] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'Draft' | 'Published' | 'Shared'>('Draft');
  const [enableScheduling, setEnableScheduling] = useState<boolean>(false);

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setAiInsightsText(
        `• Technology and high-growth sectors gained +3.85% over the selected period.\n` +
        `• SQ Platform inflow detected in ${selectedStocks[0] || 'AAPL'} and ${selectedStocks[1] || 'MSFT'}.\n` +
        `• Momentum oscillators indicate strong support at 50-day moving averages.\n` +
        `• Sector leadership remains concentrated in artificial intelligence hardware.\n` +
        `• Short-term volatility warning issued ahead of upcoming Federal Reserve comments.`
      );
      setIsGeneratingAI(false);
      showToast('New AI insights generated! You can now edit the text directly.');
    }, 1200);
  };

  // Section 9: Saved Reports
  const [savedReports, setSavedReports] = useState<SavedReport[]>([
    {
      id: '1',
      title: 'Weekly Technology Market Review',
      type: 'Market Summary',
      created: 'May 28, 2026',
      status: 'Draft',
      lastUpdated: '2 minutes ago'
    },
    {
      id: '2',
      title: 'Q2 Portfolio Performance Analysis',
      type: 'Portfolio Review',
      created: 'May 27, 2026',
      status: 'Published',
      lastUpdated: '1 day ago'
    },
    {
      id: '3',
      title: 'AI Sector Deep Dive',
      type: 'Sector Report',
      created: 'May 26, 2026',
      status: 'Shared',
      lastUpdated: '2 days ago'
    },
    {
      id: '4',
      title: 'Monthly Market Outlook',
      type: 'Market Summary',
      created: 'May 25, 2026',
      status: 'Draft',
      lastUpdated: '3 days ago'
    }
  ]);

  const [savedReportsSearch, setSavedReportsSearch] = useState<string>('');
  const [savedReportsFilter, setSavedReportsFilter] = useState<string>('All Types');

  // Section 10: Schedule Report
  const [scheduleFreq, setScheduleFreq] = useState<string>('Every Week');
  const [scheduleDay, setScheduleDay] = useState<string>('Monday');
  const [scheduleTime, setScheduleTime] = useState<string>('08:00 AM');
  const [scheduleDelivery, setScheduleDelivery] = useState<string>('Email');
  const [recipientsList, setRecipientsList] = useState<string[]>(['analyst@company.com']);
  const [newRecipient, setNewRecipient] = useState<string>('');
  const [sendEvenIfNoChanges, setSendEvenIfNoChanges] = useState<boolean>(true);

  const handleAddRecipient = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newRecipient.trim()) {
      e.preventDefault();
      if (!recipientsList.includes(newRecipient.trim())) {
        setRecipientsList([...recipientsList, newRecipient.trim()]);
      }
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipientsList(recipientsList.filter(r => r !== email));
  };

  // Modals & Feedback
  const [fullPreviewOpen, setFullPreviewOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveDraft = () => {
    setSaveStatus('Draft');
    setSaveModalOpen(true);
  };

  const handleSaveReportSubmit = () => {
    const newReport: SavedReport = {
      id: String(Date.now()),
      title: reportTitle || 'Untitled Analyst Report',
      type: reportType,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: saveStatus,
      lastUpdated: 'Just now'
    };
    setSavedReports([newReport, ...savedReports]);
    setSaveModalOpen(false);
    if (enableScheduling) {
      showToast(`Report saved as "${saveStatus}" & scheduled (${scheduleFreq} on ${scheduleDay} at ${scheduleTime})!`);
    } else {
      showToast(`Report saved successfully as "${saveStatus}" to Saved Reports!`);
    }
  };

  const handleExport = (format: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const content = `STOCK QUERY SERVER - ANALYST MARKET REPORT\nTitle: ${reportTitle}\nType: ${reportType}\nDate Range: ${dateRange}\n\nAI INSIGHTS:\n${aiInsightsText || 'No AI insights generated.'}\n\nNOTES & ANALYSIS:\n${notesText}\n\nMONITORED STOCKS: ${selectedStocks.join(', ')}\n\nEnd of Report. Generated on ${dateStr}.`;

    if (format === 'Print') {
      window.print();
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${dateStr}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Report exported in ${format.toUpperCase()} format!`);
  };

  const handleShare = (method: string) => {
    if (method === 'Copy Link') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Report share link copied to clipboard!');
    } else if (method === 'Email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(reportTitle)}&body=${encodeURIComponent(`Please review the analyst report: ${reportTitle}\n\nDate Range: ${dateRange}`)}`;
      showToast('Opening email client to share report...');
    } else {
      showToast('Report shared with team workspace!');
    }
  };

  const handleScheduleSubmit = () => {
    showToast(`Report scheduled to run ${scheduleFreq.toLowerCase()} on ${scheduleDay} at ${scheduleTime}!`);
  };

  // Filtered saved reports
  const filteredSavedReports = savedReports.filter(r => {
    const matchesSearch = !savedReportsSearch || r.title.toLowerCase().includes(savedReportsSearch.toLowerCase()) || r.type.toLowerCase().includes(savedReportsSearch.toLowerCase());
    const matchesFilter = savedReportsFilter === 'All Types' || r.type === savedReportsFilter || (savedReportsFilter === 'Drafts' && r.status === 'Draft');
    return matchesSearch && matchesFilter;
  });

  // Calculate word count
  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Confirmation */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border border-blue-500/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer text-slate-400 hover:text-white"
            title="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Create Report</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build professional market reports with live data and AI insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { setSaveStatus('Draft'); setSaveModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save Report...</span>
          </button>

          <button
            type="button"
            onClick={() => setFullPreviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Preview</span>
          </button>

          <div className="relative group">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#131b2e] border border-slate-700 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-30">
              <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-400" /> PDF Document
              </button>
              <button onClick={() => handleExport('xlsx')} className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel Spreadsheet
              </button>
              <button onClick={() => handleExport('docx')} className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Word Document
              </button>
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> CSV Data Table
              </button>
              <button onClick={() => handleExport('Print')} className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 border-t border-slate-800 mt-1 pt-2">
                <Printer className="w-3.5 h-3.5 text-slate-400" /> Print Report
              </button>
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => handleShare('Copy Link')}
              className="px-4 py-2 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 8 columns builder, 4 columns preview/export */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT / MIDDLE COLUMNS: BUILDER TOOLS (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Report Details Section */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Enter report title..."
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Market Summary">Market Summary</option>
                  <option value="Sector Analysis">Sector Analysis</option>
                  <option value="Portfolio Review">Portfolio Review</option>
                  <option value="Stock Deep Dive">Stock Deep Dive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Date Range
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 1. Select Data to Include */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>1. Select Data to Include</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allDataOptions.map((option) => {
                const isSelected = selectedData.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleData(option)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white border-white text-black font-bold shadow-md'
                        : 'bg-[#0b0f19] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-black border-black text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs truncate">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Stocks / Assets & 3. Choose Charts to Include */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 2. Select Stocks / Assets */}
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight mb-3">
                  2. Select Stocks / Assets
                </h2>
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Search company or symbol..."
                    className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  {stockSearch && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#0b0f19] border border-slate-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto z-20 p-1 space-y-1">
                      {INDEXED_STOCKS.filter(s => s.symbol.toLowerCase().includes(stockSearch.toLowerCase()) || s.name.toLowerCase().includes(stockSearch.toLowerCase())).slice(0, 5).map(s => (
                        <button
                          key={s.symbol}
                          type="button"
                          onClick={() => handleAddStock(s.symbol)}
                          className="w-full px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"
                        >
                          <span className="font-mono font-bold text-white">{s.symbol}</span>
                          <span className="text-[11px] text-slate-400 truncate ml-2">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedStocks.map(symbol => (
                    <span
                      key={symbol}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-xs font-mono font-bold text-white shadow-sm"
                    >
                      <span>{symbol}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStock(symbol)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = INDEXED_STOCKS.find(s => !selectedStocks.includes(s.symbol));
                      if (next) handleAddStock(next.symbol);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Choose Charts to Include */}
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight">
                3. Choose Charts to Include
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {chartOptions.map(chart => {
                  const isSelected = selectedCharts.includes(chart);
                  return (
                    <button
                      key={chart}
                      type="button"
                      onClick={() => handleToggleChart(chart)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/40 text-white font-bold shadow-sm'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{chart}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => showToast('Additional chart horizons enabled!')}
                  className="p-2.5 rounded-xl border border-slate-800 bg-[#0b0f19] text-xs font-medium text-slate-400 hover:text-white flex items-center justify-between"
                >
                  <span>More Charts</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. Notes & Analysis & 5. AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 4. Notes & Analysis */}
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-3 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight mb-3">
                  4. Notes & Analysis
                </h2>

                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-[#0b0f19] border border-slate-800 mb-3 text-slate-400 text-xs">
                  <select className="bg-transparent border-r border-slate-800 pr-2 py-0.5 text-slate-300 font-medium focus:outline-none text-xs">
                    <option>Normal</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  <button type="button" onClick={() => showToast('Applied bold formatting')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => showToast('Applied italic formatting')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => showToast('Applied underline formatting')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Underline className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-4 bg-slate-800 mx-0.5" />
                  <button type="button" onClick={() => showToast('Inserted bullet list')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => showToast('Inserted link')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Link className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => showToast('Inserted image')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Image className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-4 bg-slate-800 mx-0.5" />
                  <button type="button" onClick={() => showToast('Undo action')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Undo className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => showToast('Redo action')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded"><Redo className="w-3.5 h-3.5" /></button>
                </div>

                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={8}
                  placeholder="Add analyst commentary, sector observations, or executive summaries here..."
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans resize-none"
                />
              </div>

              <div className="text-right text-[11px] text-slate-500 font-mono pt-1">
                {wordCount} words
              </div>
            </div>

            {/* 5. AI Insights (Optional) */}
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>5. AI Insights</span>
                    <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'Generating...' : 'Generate Insights'}</span>
                  </button>
                </div>

                {/* AI Summary Card (Only shown when generated, and editable!) */}
                {!aiInsightsText.trim() && !isGeneratingAI ? (
                  <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-purple-400/60 mx-auto animate-pulse" />
                    <p className="text-xs font-semibold text-slate-300">No AI Insights Generated Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Click the "Generate Insights" button above to automatically synthesize market data into an editable AI summary.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Editable AI Summary
                      </span>
                      <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        You can edit this text directly
                      </span>
                    </div>
                    <textarea
                      value={aiInsightsText}
                      onChange={(e) => setAiInsightsText(e.target.value)}
                      rows={6}
                      placeholder="AI generated insights will appear here and can be edited..."
                      className="w-full bg-[#0b0f19]/80 border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 italic pt-2">
                AI insights are generated and may not be 100% accurate.
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMNS: PREVIEW, EXPORT, SHARE (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 6. Report Preview */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                6. Report Preview
              </h2>
              <button
                type="button"
                onClick={() => setFullPreviewOpen(true)}
                className="px-3 py-1 rounded-lg bg-[#0b0f19] hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Full Preview</span>
              </button>
            </div>

            {/* Live Document Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200 select-none">
              
              {/* Doc Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3.5">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {reportTitle || 'Untitled Analyst Report'}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {dateRange}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-700">
                    Your Logo
                  </span>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Prepared by<br /><strong className="text-slate-700">John Analyst</strong>
                  </div>
                </div>
              </div>

              {/* Market Overview Preview */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Market Overview
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {aiInsightsText ? aiInsightsText.split('\n')[0] : 'The technology sector showed positive momentum this week, led by strong earnings and increased investor confidence.'} {notesText.slice(0, 120)}...
                </p>
              </div>

              {/* Mini Charts Preview Side by Side */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-700 mb-1.5">Price Performance</div>
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-200/80 p-2 flex items-end justify-between gap-1 relative overflow-hidden">
                    {/* SVG mini curves */}
                    <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M 0 35 Q 25 25 50 20 T 100 5" fill="none" stroke="#2563eb" strokeWidth="2" />
                      <path d="M 0 38 Q 30 30 60 25 T 100 12" fill="none" stroke="#10b981" strokeWidth="1.5" />
                      <path d="M 0 39 Q 40 35 70 30 T 100 22" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />
                    </svg>
                    <span className="text-[8px] text-blue-600 font-bold z-10 self-start">+15%</span>
                    <span className="text-[8px] text-slate-400 z-10">May 28</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-700 mb-1.5">Sector Breakdown</div>
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-200/80 p-2 flex items-center justify-around gap-1">
                    {/* CSS Donut */}
                    <div className="w-12 h-12 rounded-full border-[5px] border-blue-600 border-r-emerald-500 border-b-amber-500 border-l-purple-500 shrink-0 shadow-inner" />
                    <div className="text-[8px] text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" /> Tech 62%</div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Comm 18%</div>
                      <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Other 20%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Movers Preview Table */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-800">Top Movers</div>
                <div className="space-y-1">
                  {selectedStocks.slice(0, 4).map((sym, idx) => {
                    const stock = INDEXED_STOCKS.find(s => s.symbol === sym) || { name: sym + ' Corp', sector: 'Technology' };
                    const isPos = idx !== 3;
                    return (
                      <div key={sym} className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-100 last:border-0">
                        <span className="font-mono font-bold text-blue-600">{sym}</span>
                        <span className="text-slate-500 truncate max-w-[90px]">{stock.name.split(' ')[0]}</span>
                        <span className="font-mono text-slate-700">${(185 + (sym.charCodeAt(0) % 60)).toFixed(2)}</span>
                        <span className={`font-mono font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPos ? '+3.4%' : '-1.2%'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 7. Export Report */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              7. Export Report
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'pdf', label: 'PDF', icon: <FileText className="w-3.5 h-3.5 text-rose-400" /> },
                { id: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: 'docx', label: 'Word', icon: <FileText className="w-3.5 h-3.5 text-blue-400" /> },
                { id: 'csv', label: 'CSV', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
                { id: 'Print', label: 'Print', icon: <Printer className="w-3.5 h-3.5 text-slate-300" /> },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleExport(item.id)}
                  className="py-2.5 px-2 rounded-xl bg-[#0b0f19] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 8. Share Report */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              8. Share Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Copy Link', label: 'Copy Link', icon: <Copy className="w-4 h-4 text-slate-300" /> },
                { id: 'Email', label: 'Email Report', icon: <Mail className="w-4 h-4 text-blue-400" /> },
                { id: 'Team', label: 'Share to Team', icon: <Users className="w-4 h-4 text-purple-400" /> },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleShare(item.id)}
                  className="py-3 px-3 rounded-xl bg-[#0b0f19] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM SECTIONS: 9. Saved Reports */}
      <div className="pt-6 border-t border-slate-800/80 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 9. Saved Reports (Full 12 cols) */}
          <div className="lg:col-span-12 bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-white tracking-tight">
                  9. Saved Reports & Document Archive
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={savedReportsSearch}
                      onChange={(e) => setSavedReportsSearch(e.target.value)}
                      placeholder="Search reports..."
                      className="bg-[#0b0f19] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium w-36 sm:w-44"
                    />
                  </div>
                  <select
                    value={savedReportsFilter}
                    onChange={(e) => setSavedReportsFilter(e.target.value)}
                    className="bg-[#0b0f19] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Market Summary">Market Summary</option>
                    <option value="Portfolio Review">Portfolio Review</option>
                    <option value="Sector Report">Sector Report</option>
                    <option value="Drafts">Drafts Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                      <th className="pb-2 pr-4">Report Title</th>
                      <th className="pb-2 px-2">Type</th>
                      <th className="pb-2 px-2">Created</th>
                      <th className="pb-2 px-2">Status</th>
                      <th className="pb-2 px-2">Last Updated</th>
                      <th className="pb-2 pl-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSavedReports.map(report => (
                      <tr key={report.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 pr-4 font-bold text-white truncate max-w-[200px]">
                          {report.title}
                        </td>
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{report.type}</td>
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{report.created}</td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            report.status === 'Published'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : report.status === 'Shared'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 text-[11px] whitespace-nowrap">{report.lastUpdated}</td>
                        <td className="py-3 pl-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => { setReportTitle(report.title); setReportType(report.type); showToast(`Loaded "${report.title}" into builder!`); }}
                              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                              title="Edit Report"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFullPreviewOpen(true)}
                              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                              title="View Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSavedReports(savedReports.filter(r => r.id !== report.id)); showToast('Report removed from saved table.'); }}
                              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSavedReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No saved reports found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Save Report & Optional Schedule Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#131b2e] border border-slate-700 text-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Save Report & Scheduling</h2>
                  <p className="text-xs text-slate-400">Configure report status and optional automated schedule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Save As Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Draft', 'Published', 'Shared'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSaveStatus(st)}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                        saveStatus === st
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Scheduling Toggle */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0b0f19] border border-slate-800 cursor-pointer" onClick={() => setEnableScheduling(!enableScheduling)}>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-slate-200">Schedule Report Delivery (Optional)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableScheduling}
                    onChange={(e) => setEnableScheduling(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Optional Scheduling Fields */}
              {enableScheduling && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#0b0f19]/80 border border-purple-500/30 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Frequency</label>
                      <select
                        value={scheduleFreq}
                        onChange={(e) => setScheduleFreq(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Every Day">Every Day</option>
                        <option value="Every Week">Every Week</option>
                        <option value="Every Month">Every Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Day</label>
                      <select
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Friday">Friday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Time</label>
                      <select
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Delivery Method</label>
                      <select
                        value={scheduleDelivery}
                        onChange={(e) => setScheduleDelivery(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Email">Email Delivery</option>
                        <option value="Slack">Slack Workspace</option>
                        <option value="PDF Attachment">PDF Attachment</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Recipients</label>
                    <input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyDown={handleAddRecipient}
                      placeholder="Type email and press Enter..."
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 mb-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                      {recipientsList.map(email => (
                        <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#131b2e] border border-slate-700 text-[10px] text-slate-300">
                          <span>{email}</span>
                          <button type="button" onClick={() => handleRemoveRecipient(email)} className="text-slate-500 hover:text-rose-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReportSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Report Preview Modal */}
      {fullPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6 relative my-auto">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">SQ Platform Report Preview</h2>
                  <p className="text-xs text-slate-500">Live preview of generated document for client distribution</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('Print')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullPreviewOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-blue-600 block mb-1">
                    {reportType}
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {reportTitle || 'Untitled Analyst Report'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Monitoring Horizon: {dateRange}
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-lg border-2 border-blue-600 bg-blue-50 text-xs font-bold text-blue-700 inline-block mb-1">
                    Your Logo
                  </div>
                  <div className="text-xs text-slate-500">
                    Prepared by <strong className="text-slate-800">John Analyst</strong><br />
                    Senior Financial Analyst
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-blue-600 pl-3">
                  Executive AI Summary
                </h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiInsightsText || 'No AI executive summary generated for this report.'}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-blue-600 pl-3">
                  Analyst Commentary & Notes
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-2xl border border-slate-200">
                  {notesText || 'No additional analyst commentary entered.'}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-blue-600 pl-3">
                  Monitored Equities & Price Discovery
                </h3>
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                      <th className="p-3 border border-slate-200">Symbol</th>
                      <th className="p-3 border border-slate-200">Company Name</th>
                      <th className="p-3 border border-slate-200">Sector</th>
                      <th className="p-3 border border-slate-200">Current Price</th>
                      <th className="p-3 border border-slate-200">Period Momentum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStocks.map((sym, idx) => {
                      const st = INDEXED_STOCKS.find(s => s.symbol === sym) || { name: sym + ' Corp', sector: 'Technology' };
                      const isPos = idx % 2 === 0;
                      return (
                        <tr key={sym} className="hover:bg-slate-50">
                          <td className="p-3 border border-slate-200 font-mono font-bold text-blue-600">{sym}</td>
                          <td className="p-3 border border-slate-200 text-slate-800 font-medium">{st.name}</td>
                          <td className="p-3 border border-slate-200 text-slate-600">{st.sector}</td>
                          <td className="p-3 border border-slate-200 font-mono text-slate-800">${(185 + (sym.charCodeAt(0) % 60)).toFixed(2)}</td>
                          <td className={`p-3 border border-slate-200 font-mono font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPos ? '+4.2% Bullish' : '-1.5% Consolidation'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 border-t border-slate-200 text-center text-[11px] text-slate-400 space-y-1">
                <p>This report was generated via the SQ Platform Analyst Workspace using real-time market data.</p>
                <p>Confidential • For Internal and Client Distribution Only • {new Date().toLocaleDateString()}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
