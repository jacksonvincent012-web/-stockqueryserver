export interface AlertEvent {
  type: string;
  symbol: string;
  change: string;
  reason: string;
}

export interface Tick {
  symbol: string;
  price: number;
  volume: number;
  timestamp?: string | number;
  [key: string]: any;
}

export interface Candle {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string | number;
}

export interface StockData {
  price: string;
  change: string;
  volume: number;
  peRatio: string;
}

export interface AnalysisResponse {
  symbols: string[];
  insights: string;
  comparison?: {
    winner: string;
    rationale: string;
  };
  sentiment: 'Bullish' | 'Bearish' | 'Neutral' | string;
}

export interface IndexedStock {
  symbol: string;
  name: string;
  sector: string;
  marketCap: string;
  popularity?: number;
  trending?: boolean;
}

