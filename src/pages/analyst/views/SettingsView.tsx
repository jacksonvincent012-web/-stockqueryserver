import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  DollarSign, 
  Bell, 
  BarChart2, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Volume2, 
  Sliders, 
  Layout, 
  Eye,
  TrendingUp,
  X
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onThemeChange: (newTheme: 'light' | 'dark') => void;
}

export default function SettingsView({ theme, onThemeChange }: SettingsViewProps) {
  // Analyst Customization Preferences stored in localStorage
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem('analyst_currency') || 'USD';
  });

  const [chartColorTheme, setChartColorTheme] = useState<'standard' | 'colorblind' | 'monochrome'>(() => {
    return (localStorage.getItem('analyst_chart_colors') as any) || 'standard';
  });

  const [defaultTimeframe, setDefaultTimeframe] = useState<'7D' | '30D' | '1Y'>(() => {
    return (localStorage.getItem('analyst_timeframe') as any) || '30D';
  });

  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('analyst_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [refreshInterval, setRefreshInterval] = useState<'2s' | '4s' | 'manual'>(() => {
    return (localStorage.getItem('analyst_refresh') as any) || '4s';
  });

  const [defaultReportFormat, setDefaultReportFormat] = useState<'csv' | 'txt'>(() => {
    return (localStorage.getItem('analyst_report_format') as any) || 'csv';
  });

  const [includeSummaryInReports, setIncludeSummaryInReports] = useState<boolean>(() => {
    const saved = localStorage.getItem('analyst_report_summary');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeSection, setActiveSection] = useState<'theme' | 'charts' | 'quotes'>('theme');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('analyst_currency', currencySymbol);
    localStorage.setItem('analyst_chart_colors', chartColorTheme);
    localStorage.setItem('analyst_timeframe', defaultTimeframe);
    localStorage.setItem('analyst_sound', JSON.stringify(enableSoundAlerts));
    localStorage.setItem('analyst_refresh', refreshInterval);
    localStorage.setItem('analyst_report_format', defaultReportFormat);
    localStorage.setItem('analyst_report_summary', JSON.stringify(includeSummaryInReports));

    setToastMsg('Your analyst preferences and visual theme have been successfully saved!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleResetDefaults = () => {
    onThemeChange('dark');
    setCurrencySymbol('USD');
    setChartColorTheme('standard');
    setDefaultTimeframe('30D');
    setEnableSoundAlerts(true);
    setRefreshInterval('4s');
    setDefaultReportFormat('csv');
    setIncludeSummaryInReports(true);

    localStorage.removeItem('analyst_currency');
    localStorage.removeItem('analyst_chart_colors');
    localStorage.removeItem('analyst_timeframe');
    localStorage.removeItem('analyst_sound');
    localStorage.removeItem('analyst_refresh');
    localStorage.removeItem('analyst_report_format');
    localStorage.removeItem('analyst_report_summary');

    setToastMsg('All settings restored to standard Analyst defaults.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Confirmation */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Analyst Workspace Customization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Preferences & Theme Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize your visual display mode, chart color accents, and alert notifications in plain English.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-[#131b2e] hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
          <div className="bg-[#131b2e] rounded-2xl border border-slate-800/80 p-4 space-y-2 shadow-xl">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              SETTINGS SECTIONS
            </div>
            <button
              type="button"
              data-tab="true"
              data-active={activeSection === 'theme'}
              onClick={() => setActiveSection('theme')}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 sidebar-tab ${
                activeSection === 'theme'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold shadow-lg shadow-blue-500/10'
                  : 'bg-[#0b0f19]/60 border-transparent text-slate-400 hover:text-white hover:bg-[#0b0f19]'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeSection === 'theme' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm">Visual Theme</div>
                <div className="text-[11px] text-slate-500 font-normal">Display mode & canvas</div>
              </div>
            </button>

            <button
              type="button"
              data-tab="true"
              data-active={activeSection === 'charts'}
              onClick={() => setActiveSection('charts')}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 sidebar-tab ${
                activeSection === 'charts'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold shadow-lg shadow-blue-500/10'
                  : 'bg-[#0b0f19]/60 border-transparent text-slate-400 hover:text-white hover:bg-[#0b0f19]'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeSection === 'charts' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm">Chart Formatting</div>
                <div className="text-[11px] text-slate-500 font-normal">Colors & horizons</div>
              </div>
            </button>

            <button
              type="button"
              data-tab="true"
              data-active={activeSection === 'quotes'}
              onClick={() => setActiveSection('quotes')}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 sidebar-tab ${
                activeSection === 'quotes'
                  ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold shadow-lg shadow-blue-500/10'
                  : 'bg-[#0b0f19]/60 border-transparent text-slate-400 hover:text-white hover:bg-[#0b0f19]'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeSection === 'quotes' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm">Live Quotes</div>
                <div className="text-[11px] text-slate-500 font-normal">Refresh & sound alerts</div>
              </div>
            </button>


          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Section 1: Visual Theme & Appearance */}
            {activeSection === 'theme' && (
            <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">1. Visual Theme & Display Mode</h2>
              <p className="text-xs text-slate-400">Choose the lighting and canvas style for your analysis environment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Mode Card */}
            <div
              onClick={() => onThemeChange('dark')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                theme === 'dark'
                  ? 'bg-[#0b0f19] border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                  : 'bg-[#0b0f19]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">Dark Mode (Midnight Slate)</span>
                  {theme === 'dark' && <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded uppercase">Active</span>}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deep charcoal canvas designed to reduce glare during intensive market monitoring and evening research sessions.
                </p>
              </div>
            </div>

            {/* Light Mode Card */}
            <div
              onClick={() => onThemeChange('light')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                theme === 'light'
                  ? 'bg-[#0b0f19] border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                  : 'bg-[#0b0f19]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">White Theme (SQ Platform White)</span>
                  {theme === 'light' && <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase">Active</span>}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean white background with crisp black text and bluish tab labelling with white text on hover. Optimized for daytime reading & presentations.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Section 2: Chart & Financial Formatting */}
        {activeSection === 'charts' && (
        <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Chart & Price Display Formatting</h2>
              <p className="text-xs text-slate-400">Configure how stock prices, momentum colors, and timelines are rendered</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Currency Option */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Primary Currency Symbol
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-800 rounded-2xl bg-[#080c14]">
                {[
                  { id: 'KES', label: 'KES (KSh - Kenya)' },
                  { id: 'NGN', label: 'NGN (₦ - Nigeria)' },
                  { id: 'ZAR', label: 'ZAR (R - S. Africa)' },
                  { id: 'EGP', label: 'EGP (E£ - Egypt)' },
                  { id: 'GHS', label: 'GHS (GH₵ - Ghana)' },
                  { id: 'TZS', label: 'TZS (TSh - Tanzania)' },
                  { id: 'UGX', label: 'UGX (USh - Uganda)' },
                  { id: 'RWF', label: 'RWF (FRw - Rwanda)' },
                  { id: 'MAD', label: 'MAD (DH - Morocco)' },
                  { id: 'DZD', label: 'DZD (DA - Algeria)' },
                  { id: 'ETB', label: 'ETB (Br - Ethiopia)' },
                  { id: 'ZMW', label: 'ZMW (ZK - Zambia)' },
                  { id: 'XOF', label: 'XOF (CFA - W. Africa)' },
                  { id: 'ZWL', label: 'ZWL ($ - Zimbabwe)' },
                  { id: 'TND', label: 'TND (DT - Tunisia)' },
                  { id: 'BWP', label: 'BWP (P - Botswana)' },
                  { id: 'MUR', label: 'MUR (₨ - Mauritius)' },
                  { id: 'XAF', label: 'XAF (FCFA - C. Africa)' },
                  { id: 'AOA', label: 'AOA (Kz - Angola)' },
                  { id: 'MZN', label: 'MZN (MT - Mozambique)' },
                  { id: 'NAD', label: 'NAD (N$ - Namibia)' },
                  { id: 'MWK', label: 'MWK (MK - Malawi)' },
                  { id: 'MGA', label: 'MGA (Ar - Madagascar)' },
                  { id: 'USD', label: 'USD ($)' },
                  { id: 'EUR', label: 'EUR (€)' },
                  { id: 'GBP', label: 'GBP (£)' },
                ].map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => setCurrencySymbol(curr.id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center truncate ${
                      currencySymbol === curr.id
                        ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Momentum Candle Colors */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Momentum Color Scheme
              </label>
              <select
                value={chartColorTheme}
                onChange={(e) => setChartColorTheme(e.target.value as any)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-3 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (Green for Gain / Red for Loss)</option>
                <option value="colorblind">High Contrast (Blue for Gain / Orange for Loss)</option>
                <option value="monochrome">Classic Monochrome (White for Gain / Gray for Loss)</option>
              </select>
            </div>

            {/* Default Timeframe */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Default Chart Horizon
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '7D', label: '7 Days' },
                  { id: '30D', label: '30 Days' },
                  { id: '1Y', label: '1 Year' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setDefaultTimeframe(tf.id as any)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      defaultTimeframe === tf.id
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-md'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        )}

        {/* Section 3: Live Quotes & Alert Notifications */}
        {activeSection === 'quotes' && (
        <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3. Real-Time Quotes & Alert Sounds</h2>
              <p className="text-xs text-slate-400">Control how frequently stock prices refresh and how trigger alerts notify you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Quote Refresh Rate */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Real-Time Quote Refresh Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2s', label: 'Fast (Every 2s)' },
                  { id: '4s', label: 'Standard (Every 4s)' },
                  { id: 'manual', label: 'Manual Only' },
                ].map((speed) => (
                  <button
                    key={speed.id}
                    type="button"
                    onClick={() => setRefreshInterval(speed.id as any)}
                    className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                      refreshInterval === speed.id
                        ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-md'
                        : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle Card */}
            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Audible Trigger Chime</h4>
                  <p className="text-[11px] text-slate-400">Play a subtle sound when a custom price condition is met</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEnableSoundAlerts(!enableSoundAlerts)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  enableSoundAlerts ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    enableSoundAlerts ? 'right-1 translate-x-0' : 'left-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>
        )}



        {/* Footer Note */}
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Settings are saved automatically to your local Analyst profile storage</span>
          <span className="text-blue-400 font-semibold">Plain English Interface Guaranteed</span>
        </div>

      </form>
      </div>
      </div>
    </div>
  );
}
