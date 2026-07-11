// ============================================================================
// Shared Realtime Snapshot Hook (Low-Latency Multi-Dashboard Sync)
// Implements: "Backend shouting updates once, everyone listens"
// ============================================================================

import { useState, useEffect } from 'react';

export interface StockSnapshotItem {
  symbol: string;
  name: string;
  price: string | number;
  change: string | number;
  change_percent: number;
  volume: number;
  market_cap: number;
  sector: string;
  peRatio?: string | number;
  high_24h?: string | number;
  low_24h?: string | number;
}

export interface MarketSnapshot {
  timestamp: string;
  sequenceNumber: number;
  stockPrices: Record<string, StockSnapshotItem>;
  stockList: StockSnapshotItem[];
  totalVolume: number;
  marketStatus: 'OPEN' | 'CLOSED' | 'SIMULATION' | 'PAUSED';
  topMovers: {
    gainers: StockSnapshotItem[];
    losers: StockSnapshotItem[];
    active: StockSnapshotItem[];
  };
  alerts: {
    active: any[];
    triggered: any[];
    totalCount: number;
  };
  systemStatus: {
    mode: string;
    cpuUsage: number | string;
    memoryUsage: number | string;
    queueSize: number;
    queueCapacity: number;
    processingSpeed: number;
    tickSpeedMs: number;
    simRunning: boolean;
    uptimeSeconds: number;
    activeDashboards: number;
    latencyMs: number;
    dbStatus?: string;
    databases?: any;
  };
}

const DEFAULT_SNAPSHOT: MarketSnapshot = {
  timestamp: new Date().toISOString(),
  sequenceNumber: 0,
  stockPrices: {},
  stockList: [],
  totalVolume: 0,
  marketStatus: 'OPEN',
  topMovers: { gainers: [], losers: [], active: [] },
  alerts: { active: [], triggered: [], totalCount: 0 },
  systemStatus: {
    mode: 'LIVE',
    cpuUsage: '34.2%',
    memoryUsage: '1.85 GB',
    queueSize: 0,
    queueCapacity: 10000,
    processingSpeed: 1450,
    tickSpeedMs: 100,
    simRunning: false,
    uptimeSeconds: 0,
    activeDashboards: 1,
    latencyMs: 8,
    dbStatus: 'Connected',
    databases: null
  }
};

let globalSnapshot: MarketSnapshot = DEFAULT_SNAPSHOT;
let globalIsConnected: boolean = false;
let listeners: Set<() => void> = new Set();
let isInitialized: boolean = false;
let es: EventSource | null = null;
let fallbackTimer: any = null;

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function initGlobalConnection() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const fetchSnapshot = async () => {
    try {
      const res = await fetch('/api/snapshot');
      if (res.ok) {
        const data = await res.json();
        if (data && data.stockPrices) {
          globalSnapshot = data;
          globalIsConnected = true;
          notifyListeners();
        }
      }
    } catch (err) {
      console.error('Error fetching snapshot REST:', err);
    }
  };

  const startFallbackPolling = () => {
    if (!fallbackTimer) {
      fetchSnapshot();
      fallbackTimer = setInterval(fetchSnapshot, 4000);
    }
  };

  try {
    es = new EventSource('/api/stream');

    es.addEventListener('snapshot', (e: any) => {
      try {
        const data: MarketSnapshot = JSON.parse(e.data);
        globalSnapshot = data;
        globalIsConnected = true;
        notifyListeners();
      } catch (err) {
        console.error('Error parsing SSE snapshot:', err);
      }
    });

    es.onmessage = (e) => {
      try {
        const data: MarketSnapshot = JSON.parse(e.data);
        if (data && data.stockPrices) {
          globalSnapshot = data;
          globalIsConnected = true;
          notifyListeners();
        }
      } catch (err) {
        // Ignore normal non-JSON messages
      }
    };

    es.onerror = () => {
      globalIsConnected = false;
      notifyListeners();
      if (es && es.readyState === EventSource.CLOSED) {
        startFallbackPolling();
      }
    };
  } catch (err) {
    globalIsConnected = false;
    startFallbackPolling();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('app:refresh-live-data', () => {
      fetchSnapshot();
    });
    window.addEventListener('app:logout', () => {
      if (es) {
        es.close();
        es = null;
      }
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
      globalIsConnected = false;
      isInitialized = false;
      notifyListeners();
    });
  }

  fetchSnapshot();
}

export function useRealtimeSnapshot() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(globalSnapshot);
  const [isConnected, setIsConnected] = useState<boolean>(globalIsConnected);

  useEffect(() => {
    initGlobalConnection();

    const listener = () => {
      setSnapshot(globalSnapshot);
      setIsConnected(globalIsConnected);
    };

    listeners.add(listener);
    if (globalSnapshot !== snapshot) {
      setSnapshot(globalSnapshot);
      setIsConnected(globalIsConnected);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    snapshot,
    liveStocks: snapshot.stockPrices || {},
    stockList: snapshot.stockList || [],
    topMovers: snapshot.topMovers || { gainers: [], losers: [], active: [] },
    alerts: snapshot.alerts || { active: [], triggered: [], totalCount: 0 },
    systemStatus: snapshot.systemStatus || DEFAULT_SNAPSHOT.systemStatus,
    isConnected
  };
}

