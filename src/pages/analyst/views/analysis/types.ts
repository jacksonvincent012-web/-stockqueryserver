export type IndicatorType =
  | 'Moving Averages'
  | 'RSI'
  | 'MACD'
  | 'Bollinger Bands'
  | 'Volume'
  | 'EMA'
  | 'SMA'
  | 'VWAP'
  | 'ATR'
  | 'ADX'
  | 'Ichimoku'
  | 'Stochastic';

export type TimeframeType = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

export type ChartLayoutType = 'single' | 'split' | 'top_bottom' | 'grid';

export type ChartStyleType = 'Candlestick' | 'Line' | 'Heikin Ashi' | 'Area' | 'OHLC';

export interface AnalystNewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  url?: string;
}

export interface PatternDetectionItem {
  id: string;
  pattern: string;
  timeframe: string;
  confidence: number;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  targetPrice: string;
  description: string;
}

export interface SupportResistanceLevel {
  id: string;
  level: string;
  price: number;
  type: 'Major Support' | 'Minor Support' | 'Pivot' | 'Minor Resistance' | 'Major Resistance';
  strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface FibonacciLevelItem {
  level: string;
  ratio: string;
  price: number;
  status: 'Support' | 'Resistance' | 'Pivot' | 'Target';
}

export interface IndicatorSummaryItem {
  name: string;
  value: string;
  signal: 'Buy' | 'Sell' | 'Neutral';
  description: string;
}

export interface ChartDataPoint {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema50?: number;
  vwap?: number;
  upperBand?: number;
  lowerBand?: number;
  rsi?: number;
  macd?: number;
  signalLine?: number;
  stochK?: number;
  stochD?: number;
  adx?: number;
  atr?: number;
  ichimokuCloud?: number;
}
