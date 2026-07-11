import React, { useState } from 'react';
import {
  TrendingUp,
  Edit3,
  Eye,
  GitCompare,
  Activity,
  Layers,
  Calculator,
  Check,
  X,
  HelpCircle,
  Sliders,
  Sparkles
} from 'lucide-react';
import { IndicatorType } from './types';
import { motion, AnimatePresence } from 'motion/react';

interface AnalystToolboxProps {
  activeIndicators: IndicatorType[];
  onToggleIndicator: (ind: IndicatorType) => void;
  onOpenCompare: () => void;
  onOpenCalculator: () => void;
  onSelectDrawingTool?: (tool: string) => void;
  theme?: 'light' | 'dark';
  isAttached?: boolean;
}

const TOOLBOX_CATEGORIES = [
  {
    id: 'indicators',
    label: 'Technical Indicators',
    icon: TrendingUp,
    badge: '12',
    description: 'Oscillators, Moving Averages, Volatility & Momentum bands'
  },
  {
    id: 'drawings',
    label: 'Drawing Tools',
    icon: Edit3,
    badge: '8',
    description: 'Trend lines, Ray channels, Pitchforks, Shapes & Annotations'
  },
  {
    id: 'patterns',
    label: 'Pattern Recognition',
    icon: Eye,
    badge: 'AI',
    description: 'Auto-detect Head & Shoulders, Wedges, Triangles & Flags'
  },
  {
    id: 'compare',
    label: 'Compare Assets',
    icon: GitCompare,
    badge: 'New',
    description: 'Overlay benchmark indices, peers, and sector ETFs'
  },
  {
    id: 'trend',
    label: 'Trend Analysis',
    icon: Activity,
    badge: 'Live',
    description: 'Linear regression channels, directional slope & momentum'
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci Tools',
    icon: Layers,
    badge: '5',
    description: 'Retracements, Extensions, Fans, Arcs & Time Zones'
  },
  {
    id: 'calculators',
    label: 'Calculators',
    icon: Calculator,
    badge: 'Calc',
    description: 'Risk/Reward ratio, Expected Return, Volatility & Pivot Points'
  }
];

const ALL_INDICATORS: IndicatorType[] = [
  'Moving Averages',
  'RSI',
  'MACD',
  'Bollinger Bands',
  'Volume',
  'EMA',
  'SMA',
  'VWAP',
  'ATR',
  'ADX',
  'Ichimoku',
  'Stochastic'
];

export default function AnalystToolbox({
  activeIndicators,
  onToggleIndicator,
  onOpenCompare,
  onOpenCalculator,
  onSelectDrawingTool,
  theme = 'dark',
  isAttached = false
}: AnalystToolboxProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeDrawing, setActiveDrawing] = useState<string>('Cursor');

  const isLight = theme === 'light';

  const handleCategoryClick = (catId: string) => {
    if (catId === 'compare') {
      onOpenCompare();
    } else if (catId === 'calculators') {
      onOpenCalculator();
    } else {
      setActiveModal(catId);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col border-r transition-all duration-300 w-14 shrink-0 ${
          isAttached
            ? isLight
              ? 'bg-slate-50/60 border-slate-200 text-slate-800'
              : 'bg-[#090c13] border-slate-800/80 text-slate-200'
            : isLight
            ? 'bg-white border-slate-200 text-slate-800 rounded-2xl shadow-sm'
            : 'bg-[#0b0e14] border-slate-800 text-slate-200 rounded-2xl shadow-sm'
        }`}
      >
        {/* Toolbox Header */}
        <div className={`py-3.5 border-b flex items-center justify-center ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500" title="Research Toolbox">
            <Sliders className="w-4 h-4" />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-2 custom-scrollbar">
          {TOOLBOX_CATEGORIES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModal === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />

                {/* Clean Function Name Tooltip on Hover */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-xl border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-[100] flex items-center gap-1.5 font-bold">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flyout Modals for Toolbox Items */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f141f] border-slate-800 text-white'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0b0e14]'}`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {TOOLBOX_CATEGORIES.find(c => c.id === activeModal)?.label || 'Toolbox Option'}
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {activeModal === 'indicators' && (
                  <div>
                    <p className={`text-xs mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Select technical indicators to overlay on your primary SQ Platform price chart.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {ALL_INDICATORS.map((ind) => {
                        const active = activeIndicators.includes(ind);
                        return (
                          <button
                            key={ind}
                            onClick={() => onToggleIndicator(ind)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-blue-600/10 border-blue-500 text-blue-500'
                                : isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{ind}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${
                              active ? 'bg-blue-600 text-white' : isLight ? 'bg-slate-200' : 'bg-slate-800'
                            }`}>
                              {active && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeModal === 'drawings' && (
                  <div className="space-y-3">
                    <p className={`text-xs mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Choose a drawing tool for structural annotation:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Trend Line', 'Horizontal Ray', 'Fibonacci Retracement', 'Linear Regression Channel', 'Price Label / Callout', 'Rectangle Zone', 'Parallel Channel', 'Elliot Wave Tool'].map((tool) => (
                        <button
                          key={tool}
                          onClick={() => {
                            setActiveDrawing(tool);
                            onSelectDrawingTool?.(tool);
                            setActiveModal(null);
                          }}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDrawing === tool
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'patterns' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>AI Pattern Engine is continuously scanning multiple timeframe intervals for geometric chart patterns.</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Double Bottom Support', conf: '92%', status: 'Bullish', target: '$184.50' },
                        { name: 'Bullish Flag Breakout', conf: '88%', status: 'Bullish', target: '$192.00' },
                        { name: 'Ascending Triangle', conf: '81%', status: 'Bullish', target: '$188.00' },
                        { name: 'Volume Divergence Wedge', conf: '74%', status: 'Neutral', target: '$165.00' }
                      ].map((pat, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span>{pat.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">{pat.status}</span>
                            </div>
                            <span className="text-slate-400 text-[11px]">Est. Target: {pat.target}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Confidence</span>
                            <span className="font-mono font-bold text-blue-400">{pat.conf}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'trend' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">Trend directional metrics and regression bands:</p>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex justify-between"><span>Linear Slope (50D):</span> <span className="text-emerald-400">+0.48% / day</span></div>
                      <div className="flex justify-between"><span>ADX Trend Strength:</span> <span className="text-blue-400">28.4 (Strong Trend)</span></div>
                      <div className="flex justify-between"><span>200D Moving Average:</span> <span className="text-slate-300">Above (+8.4% premium)</span></div>
                      <div className="flex justify-between"><span>Hurst Exponent:</span> <span className="text-purple-400">0.68 (Persistent)</span></div>
                    </div>
                  </div>
                )}

                {activeModal === 'fibonacci' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">Fibonacci retracement intervals anchored to recent swing high/low:</p>
                    <div className="space-y-1.5 text-xs font-mono">
                      {[
                        { ratio: '0.0%', level: '$199.62', note: '52-Week High' },
                        { ratio: '23.6%', level: '$181.82', note: 'Minor Resistance' },
                        { ratio: '38.2%', level: '$170.80', note: 'Pivot Zone' },
                        { ratio: '50.0%', level: '$161.89', note: 'Equilibrium' },
                        { ratio: '61.8%', level: '$152.98', note: 'Golden Ratio Support' },
                        { ratio: '100.0%', level: '$124.17', note: '52-Week Low Support' }
                      ].map((fib, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <span className="font-bold text-amber-400">{fib.ratio}</span>
                          <span className="text-white">{fib.level}</span>
                          <span className="text-slate-400 text-[11px]">{fib.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t flex justify-end ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0b0e14]'}`}>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
