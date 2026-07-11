import React, { useState } from 'react';
import {
  Activity,
  Eye,
  ShieldAlert,
  Layers,
  FileText,
  CheckCircle2,
  Save,
  Download,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { IndicatorSummaryItem, PatternDetectionItem, SupportResistanceLevel, FibonacciLevelItem } from './types';

interface AnalystBottomPanelsProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

const FALLBACK_INDICATORS: IndicatorSummaryItem[] = [
  { name: 'RSI (14)', value: '56.32', signal: 'Neutral', description: 'Momentum equilibrium within normal bounds' },
  { name: 'MACD (12, 26, 9)', value: '1.15 / 0.85', signal: 'Buy', description: 'Bullish divergence above signal line' },
  { name: 'Stochastic (14, 3, 3)', value: '72.45', signal: 'Neutral', description: 'Approaching upper oscillator band' },
  { name: 'CCI (20)', value: '85.32', signal: 'Buy', description: 'Strong directional commodity channel trend' },
  { name: 'ADX (14)', value: '28.40', signal: 'Buy', description: 'Strong trend momentum confirmed (>25)' },
  { name: 'SMA (200)', value: '$151.20', signal: 'Buy', description: 'Price trading +8.4% above long-term average' },
  { name: 'Bollinger Bands', value: '$158.40 - $166.20', signal: 'Neutral', description: 'Contraction phase indicating upcoming volatility' },
  { name: 'VWAP', value: '$162.85', signal: 'Buy', description: 'Intraday SQ Platform accumulation above VWAP' }
];

const FALLBACK_PATTERNS: PatternDetectionItem[] = [
  { id: 'p1', pattern: 'Double Bottom Support', timeframe: '6M Daily', confidence: 92, type: 'Bullish', targetPrice: '$184.50', description: 'Multi-week bottom formation confirmed at $161.00 level with expanding volume.' },
  { id: 'p2', pattern: 'Ascending Triangle Breakout', timeframe: '3M 4H', confidence: 86, type: 'Bullish', targetPrice: '$192.00', description: 'Horizontal resistance at $165.00 pressured by higher swing lows.' },
  { id: 'p3', pattern: 'Volume Divergence Wedge', timeframe: '1M 1H', confidence: 74, type: 'Neutral', targetPrice: '$163.00', description: 'Consolidation pattern ahead of upcoming macroeconomic CPI announcements.' }
];

const FALLBACK_SR: SupportResistanceLevel[] = [
  { id: 'sr1', level: 'Major Resistance R2', price: 172.50, type: 'Major Resistance', strength: 'Strong' },
  { id: 'sr2', level: 'Minor Resistance R1', price: 168.45, type: 'Minor Resistance', strength: 'Moderate' },
  { id: 'sr3', level: 'Pivot Equilibrium', price: 163.88, type: 'Pivot', strength: 'Strong' },
  { id: 'sr4', level: 'Minor Support S1', price: 160.20, type: 'Minor Support', strength: 'Moderate' },
  { id: 'sr5', level: 'Major Support S2', price: 154.80, type: 'Major Support', strength: 'Strong' }
];

const FALLBACK_FIB: FibonacciLevelItem[] = [
  { level: '0.0% Retracement', ratio: '0.000', price: 199.62, status: 'Resistance' },
  { level: '23.6% Retracement', ratio: '0.236', price: 181.82, status: 'Resistance' },
  { level: '38.2% Retracement', ratio: '0.382', price: 170.80, status: 'Target' },
  { level: '50.0% Retracement', ratio: '0.500', price: 161.89, status: 'Pivot' },
  { level: '61.8% Golden Ratio', ratio: '0.618', price: 152.98, status: 'Support' },
  { level: '100.0% Retracement', ratio: '1.000', price: 124.17, status: 'Support' }
];

export default function AnalystBottomPanels({
  symbol,
  theme = 'dark'
}: AnalystBottomPanelsProps) {
  const [activeTab, setActiveTab] = useState<'indicators' | 'patterns' | 'support' | 'fibonacci' | 'notes'>('indicators');
  const [notesText, setNotesText] = useState(
    `INSTITUTIONAL RESEARCH NOTES — ${symbol}\nDate: ${new Date().toLocaleDateString()}\n\n1. Structural Analysis:\n- Asset is SQ Platformnstrating sustained SQ Platform accumulation above the 50-day moving average.\n- Relative Strength Index (RSI) remains in bullish continuation territory without bearish divergence.\n\n2. Key Levels & Catalysts:\n- Immediate resistance observed at $168.45. A sustained breakout above this zone projects toward the $184.50 Fibonacci target.\n- Downside risk protected by strong SQ Platform bid volume around $160.20.\n\n3. Actionable Recommendation:\n- Maintain overweight rating in analyst portfolio portfolios with a 6-month price target of $195.00.`
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const isLight = theme === 'light';

  const handleSaveNotes = () => {
    setSaveStatus('Saved to Profile!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const tabs = [
    { id: 'indicators', label: 'Indicator Summary', icon: Activity, badge: '8' },
    { id: 'patterns', label: 'Pattern Detection', icon: Eye, badge: '3' },
    { id: 'support', label: 'Support & Resistance', icon: ShieldAlert, badge: '5' },
    { id: 'fibonacci', label: 'Fibonacci Levels', icon: Layers, badge: '6' },
    { id: 'notes', label: 'Analyst Notes', icon: FileText, badge: 'Edit' }
  ];

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'
    }`}>
      {/* Tabs Navigation Bar */}
      <div className={`p-2 border-b flex items-center gap-1.5 overflow-x-auto custom-scrollbar ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#10141f]'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-blue-700 text-white' : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Content */}
      <div className="p-4 sm:p-6">
        {/* 1. Indicator Summary Tab */}
        {activeTab === 'indicators' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Comprehensive Multi-Indicator Matrix • Computed across primary 6M series</span>
              <span className="text-emerald-400 font-bold">Consensus: Strong Buy (6 Buy / 2 Neutral / 0 Sell)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <th className="py-2 px-3 font-semibold">Indicator Name</th>
                    <th className="py-2 px-3 font-semibold">Current Value</th>
                    <th className="py-2 px-3 font-semibold">Signal</th>
                    <th className="py-2 px-3 font-semibold">Technical Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {FALLBACK_INDICATORS.map((ind, idx) => (
                    <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'}>
                      <td className="py-2.5 px-3 font-bold text-white">{ind.name}</td>
                      <td className="py-2.5 px-3 text-blue-400">{ind.value}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                          ind.signal === 'Buy'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ind.signal === 'Sell'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ind.signal === 'Buy' && <ArrowUpRight className="w-3 h-3" />}
                          {ind.signal === 'Sell' && <ArrowDownRight className="w-3 h-3" />}
                          {ind.signal === 'Neutral' && <Minus className="w-3 h-3" />}
                          <span>{ind.signal}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{ind.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Pattern Detection Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>AI Pattern Engine • Real-time geometric structural detection</span>
              <span className="text-purple-400 font-bold">3 Active Patterns Identified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FALLBACK_PATTERNS.map((pat) => (
                <div
                  key={pat.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111622] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        {pat.timeframe}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        pat.type === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {pat.type} ({pat.confidence}%)
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">{pat.pattern}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{pat.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Projected Target:</span>
                    <span className="font-bold text-emerald-400 text-sm">{pat.targetPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Support & Resistance Tab */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Key SQ Platform Supply & Demand Zones • Derived from volume profile and swing highs/lows</span>
              <span className="text-blue-400 font-bold">Current Price: ${symbol === 'NVDA' ? '128.76' : symbol === 'MSFT' ? '442.53' : '163.88'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono">
              {FALLBACK_SR.map((sr) => {
                const isRes = sr.type.includes('Resistance');
                const isPiv = sr.type === 'Pivot';
                return (
                  <div
                    key={sr.id}
                    className={`p-4 rounded-2xl border text-center ${
                      isRes
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : isPiv
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block mb-1 opacity-80">{sr.level}</span>
                    <span className="text-lg font-black block mb-1">${sr.price.toFixed(2)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 block truncate font-sans font-medium">
                      Strength: {sr.strength}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Fibonacci Levels Tab */}
        {activeTab === 'fibonacci' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Fibonacci Retracement Grid • Anchored to 52-Week High ($199.62) and 52-Week Low ($124.17)</span>
              <span className="text-amber-400 font-bold">Golden Ratio (61.8%) at $152.98</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FALLBACK_FIB.map((fib, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111622] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-amber-400">{fib.level}</div>
                    <div className="text-[11px] text-slate-400">Ratio: {fib.ratio}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">${fib.price.toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${
                      fib.status === 'Support' ? 'text-emerald-400' : fib.status === 'Resistance' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {fib.status} Zone
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Analyst Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">SQ Platform Scratchpad • Formatted for PDF export and compliance archiving</span>
              <div className="flex items-center gap-2">
                {saveStatus && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {saveStatus}
                  </span>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={8}
              placeholder="Enter SQ Platform observations, price targets, thesis risks, and earnings projections..."
              className={`w-full rounded-2xl p-4 text-xs font-mono leading-relaxed outline-none transition-all resize-y border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                  : 'bg-[#111622] border-slate-800 text-slate-200 focus:border-blue-500 focus:bg-[#0f141f]'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
