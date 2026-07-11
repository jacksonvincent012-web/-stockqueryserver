import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  ReferenceLine,
  Cell
} from 'recharts';
import { ChartDataPoint, IndicatorType, ChartStyleType, ChartLayoutType } from './types';
import { format, parseISO } from 'date-fns';
import { Activity, BarChart2, TrendingUp, Layers } from 'lucide-react';

interface AnalystChartWorkspaceProps {
  data: ChartDataPoint[];
  symbol: string;
  chartStyle: ChartStyleType;
  chartLayout: ChartLayoutType;
  activeIndicators: IndicatorType[];
  compareSymbols?: string[];
  compareData?: Record<string, ChartDataPoint[]>;
  theme?: 'light' | 'dark';
  isAttached?: boolean;
}

export default function AnalystChartWorkspace({
  data,
  symbol,
  chartStyle,
  chartLayout,
  activeIndicators,
  compareSymbols = [],
  compareData = {},
  theme = 'dark',
  isAttached = false
}: AnalystChartWorkspaceProps) {
  const isLight = theme === 'light';

  // Calculate Y-axis domain with generous padding
  const priceDomain = useMemo(() => {
    if (!data || data.length === 0) return [100, 200];
    let min = Infinity;
    let max = -Infinity;
    data.forEach((d) => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (d.lowerBand && d.lowerBand < min) min = d.lowerBand;
      if (d.upperBand && d.upperBand > max) max = d.upperBand;
    });
    const padding = (max - min) * 0.08;
    return [Math.max(0, Math.floor((min - padding) * 10) / 10), Math.ceil((max + padding) * 10) / 10];
  }, [data]);

  const showSMA = activeIndicators.includes('SMA') || activeIndicators.includes('Moving Averages');
  const showEMA = activeIndicators.includes('EMA') || activeIndicators.includes('Moving Averages');
  const showVWAP = activeIndicators.includes('VWAP');
  const showBollinger = activeIndicators.includes('Bollinger Bands');
  const showIchimoku = activeIndicators.includes('Ichimoku');
  const showVolume = activeIndicators.includes('Volume');

  const showRSI = activeIndicators.includes('RSI');
  const showMACD = activeIndicators.includes('MACD');
  const showStoch = activeIndicators.includes('Stochastic');
  const showADX = activeIndicators.includes('ADX');
  const showATR = activeIndicators.includes('ATR');

  // Custom SQ Platform tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt: ChartDataPoint = payload[0].payload;

    return (
      <div className={`p-3 rounded-xl border shadow-xl text-xs font-mono space-y-1.5 ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#0b0e14]/95 border-slate-800 text-slate-200'
      }`}>
        <div className="font-bold border-b pb-1 flex justify-between gap-4 text-blue-400">
          <span>{symbol}</span>
          <span>{pt.date || pt.timestamp}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>Open: <span className="font-bold">{pt.open}</span></div>
          <div>High: <span className="font-bold text-emerald-400">{pt.high}</span></div>
          <div>Low: <span className="font-bold text-rose-400">{pt.low}</span></div>
          <div>Close: <span className="font-bold text-blue-400">{pt.close}</span></div>
          <div>Volume: <span className="text-slate-400">{pt.volume?.toLocaleString()}</span></div>
          {pt.sma20 && <div>SMA (20): <span className="text-amber-400">{pt.sma20}</span></div>}
          {pt.ema50 && <div>EMA (50): <span className="text-purple-400">{pt.ema50}</span></div>}
          {pt.vwap && <div>VWAP: <span className="text-cyan-400">{pt.vwap}</span></div>}
          {pt.rsi && <div>RSI (14): <span className="text-amber-400">{pt.rsi}</span></div>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Price Chart Box */}
      <div className={`${isAttached ? 'p-4 relative overflow-hidden border-0 bg-transparent rounded-none shadow-none flex-1 min-w-0' : `rounded-2xl border p-4 shadow-sm relative overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}`}>
        {/* Chart Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="text-8xl font-black font-mono tracking-tighter uppercase">{symbol}</span>
        </div>

        {/* Chart Header Status info */}
        <div className="flex items-center justify-between mb-3 relative z-10 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm tracking-tight">{symbol} • SQ Platform Primary Series</span>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
              isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'
            }`}>
              {chartStyle} View
            </span>
            {chartLayout !== 'single' && (
              <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/20 text-purple-300">
                {chartLayout.toUpperCase()} LAYOUT
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            {showSMA && <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>SMA (20)</span>}
            {showEMA && <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-purple-400 inline-block"></span>EMA (50)</span>}
            {showVWAP && <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>VWAP</span>}
            {showBollinger && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500/20 border border-blue-500/50 inline-block rounded-xs"></span>Bollinger</span>}
          </div>
        </div>

        {/* Recharts Primary Chart */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorIchimoku" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: isLight ? '#64748b' : '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val) return '';
                  try {
                    return val.length > 7 ? val.substring(5) : val;
                  } catch { return val; }
                }}
              />
              <YAxis
                domain={priceDomain}
                orientation="right"
                tick={{ fill: isLight ? '#64748b' : '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Line type="monotone" dataKey="upperBand" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="lowerBand" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="upperBand" baseValue="dataMin" fill="#3b82f6" fillOpacity={0.05} stroke="none" isAnimationActive={false} />
                </>
              )}

              {/* Ichimoku Cloud */}
              {showIchimoku && (
                <Area type="monotone" dataKey="ichimokuCloud" fill="url(#colorIchimoku)" stroke="#10b981" strokeWidth={1} strokeDasharray="2 2" dot={false} isAnimationActive={false} />
              )}

              {/* Volume Bars (if Volume indicator active) */}
              {showVolume && (
                <Bar dataKey="volume" yAxisId="vol" fill={isLight ? '#cbd5e1' : '#1e293b'} opacity={0.4} />
              )}
              {showVolume && <YAxis yAxisId="vol" orientation="left" domain={[0, 'dataMax * 4']} hide={true} />}

              {/* Chart Styles: Area / Candlestick simulated / Line */}
              {chartStyle === 'Area' && (
                <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
              )}
              {chartStyle === 'Line' && (
                <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              )}
              {(chartStyle === 'Candlestick' || chartStyle === 'Heikin Ashi' || chartStyle === 'OHLC') && (
                <>
                  {/* Candlestick line simulation */}
                  <Line type="linear" dataKey="high" stroke="#94a3b8" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="linear" dataKey="low" stroke="#94a3b8" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Bar
                    dataKey="close"
                    isAnimationActive={false}
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      const isUp = payload.close >= payload.open;
                      const color = isUp ? '#10b981' : '#f43f5e';
                      const candleHeight = Math.max(2, Math.abs(height || 4));
                      return <rect x={x - width / 2 + 2} y={y} width={Math.max(4, width - 4)} height={candleHeight} fill={color} rx={1} />;
                    }}
                  />
                </>
              )}

              {/* Moving Averages */}
              {showSMA && <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
              {showEMA && <Line type="monotone" dataKey="ema50" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
              {showVWAP && <Line type="monotone" dataKey="vwap" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}

              {/* Comparison Overlays */}
              {compareSymbols.map((sym, idx) => {
                const colors = ['#ec4899', '#8b5cf6', '#eab308', '#14b8a6'];
                const color = colors[idx % colors.length];
                return (
                  <Line
                    key={sym}
                    type="monotone"
                    dataKey="close"
                    data={compareData[sym] || []}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    name={sym}
                    isAnimationActive={false}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-Charts for Oscillators (RSI, MACD, Stochastic, ADX, ATR) */}
      {(showRSI || showMACD || showStoch || showADX || showATR) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showRSI && (
            <div className={`p-3 rounded-2xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                <span className="font-bold text-amber-400">RSI (14) • Momentum Oscillator</span>
                <span className="text-slate-400">Overbought 70 / Oversold 30</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                    <YAxis domain={[0, 100]} orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showMACD && (
            <div className={`p-3 rounded-2xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                <span className="font-bold text-blue-400">MACD (12, 26, 9) • Trend Momentum</span>
                <span className="text-slate-400">Signal Line & Histogram</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                    <YAxis orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar
                      dataKey="macd"
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        const isPos = payload.macd >= 0;
                        return <rect x={x} y={y} width={Math.max(2, width)} height={Math.abs(height || 2)} fill={isPos ? '#10b981' : '#f43f5e'} opacity={0.6} />;
                      }}
                      isAnimationActive={false}
                    />
                    <Line type="monotone" dataKey="signalLine" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showStoch && (
            <div className={`p-3 rounded-2xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                <span className="font-bold text-purple-400">Stochastic (14, 3, 3)</span>
                <span className="text-slate-400">%K / %D Lines</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                    <YAxis domain={[0, 100]} orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" />
                    <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="stochK" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="stochD" stroke="#06b6d4" strokeWidth={1} strokeDasharray="2 2" dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showADX && (
            <div className={`p-3 rounded-2xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                <span className="font-bold text-cyan-400">ADX (14) • Average Directional Index</span>
                <span className="text-slate-400">&gt;25 Indicates Strong Trend</span>
              </div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                    <YAxis domain={[0, 60]} orientation="right" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={25} stroke="#3b82f6" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="adx" stroke="#06b6d4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
