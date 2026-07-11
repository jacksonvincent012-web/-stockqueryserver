// ============================================================================
// Realtime Snapshot Service (Single Source of Truth & Centralized Streaming)
// Implements: Market Tick -> Ingestion Queue -> Tick Processor -> Event Broadcaster
// ============================================================================

import { analystEngine } from './AnalystEngine';
import { controlPlaneService } from './ControlPlaneService';
import { tickEngine, Tick } from './TickEngine';
import { dbManager } from '../database/index';

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

export class RealtimeSnapshotService {
  private latestSnapshot!: MarketSnapshot;
  private sseClients: Set<any> = new Set();
  private alertClients: Set<any> = new Set();
  private sequenceNumber: number = 0;
  private lastBroadcastTime: number = 0;
  private broadcastThrottleMs: number = 250; // max 4Hz broadcast rate for UI smoothness

  private defaultStockNames: Record<string, { name: string; pe: string }> = {
    AAPL: { name: "Apple Inc.", pe: "29.40" },
    MSFT: { name: "Microsoft Corp.", pe: "34.20" },
    NVDA: { name: "NVIDIA Corp.", pe: "68.50" },
    TSLA: { name: "Tesla Inc.", pe: "62.10" },
    GOOGL: { name: "Alphabet Inc.", pe: "24.80" },
    AMZN: { name: "Amazon.com Inc.", pe: "41.30" },
    META: { name: "Meta Platforms", pe: "27.90" },
    "BRK.A": { name: "Berkshire Hathaway", pe: "21.50" },
    INTC: { name: "Intel Corp.", pe: "15.20" },
    IBM: { name: "IBM Corp.", pe: "18.40" },
    JNJ: { name: "Johnson & Johnson", pe: "16.80" },
    AMD: { name: "Adv. Micro Devices", pe: "45.10" },
    NFLX: { name: "Netflix Inc.", pe: "38.60" }
  };

  constructor() {
    this.refreshSnapshot();
    tickEngine.onTicksProcessedCallback = (ticks) => {
      this.onTicksProcessed(ticks);
    };
    // Regular heartbeat and sync loop every 1 second
    setInterval(() => {
      this.refreshSnapshot();
      this.broadcast();
    }, 1000);
  }

  // 1. SINGLE SOURCE OF TRUTH REFRESH ENGINE
  public refreshSnapshot(): MarketSnapshot {
    this.sequenceNumber++;
    const now = new Date().toISOString();
    const allSymbols = Array.from(new Set([
      ...Object.keys(this.defaultStockNames),
      ...analystEngine.tickerMap.getAllSymbols()
    ]));

    const stockPrices: Record<string, StockSnapshotItem> = {};
    const stockList: StockSnapshotItem[] = [];
    let totalVol = 0;

    allSymbols.forEach(sym => {
      const stock = analystEngine.getStock(sym) || {};
      const meta = this.defaultStockNames[sym] || { name: `${sym} Corp.`, pe: "25.00" };
      
      const priceVal = Number(stock.price) || (sym === 'BRK.A' ? 615000 : sym === 'NVDA' ? 128.50 : sym === 'AAPL' ? 191.25 : 180.00);
      const chgVal = Number(stock.change_percent !== undefined ? stock.change_percent : stock.change || 1.25);
      const volVal = Number(stock.volume) || Math.floor(Math.random() * 20000 + 5000);
      totalVol += volVal;

      const item: StockSnapshotItem = {
        symbol: sym,
        name: meta.name,
        price: priceVal.toFixed(2),
        change: `${chgVal >= 0 ? '+' : ''}${chgVal.toFixed(2)}`,
        change_percent: parseFloat(chgVal.toFixed(2)),
        volume: volVal,
        market_cap: stock.market_cap || priceVal * 10000000,
        sector: stock.sector || "Technology Sector",
        peRatio: meta.pe,
        high_24h: (priceVal * 1.025).toFixed(2),
        low_24h: (priceVal * 0.975).toFixed(2)
      };

      stockPrices[sym] = item;
      stockList.push(item);
    });

    // Top Movers from Analyst Engine Heap
    const analytics = analystEngine.getAnalytics();
    const mapToSnapshotItems = (symbols: string[]): StockSnapshotItem[] => {
      return symbols.map(s => stockPrices[s]).filter(Boolean);
    };

    const gainers = mapToSnapshotItems(analytics.top_gainers || ['NVDA', 'TSLA', 'AMZN']);
    const losers = mapToSnapshotItems(analytics.top_losers || ['INTC', 'IBM', 'JNJ']);
    const active = mapToSnapshotItems(analytics.most_active || ['AAPL', 'NVDA', 'TSLA']);

    // Alerts from Analyst Engine & Control Plane
    const alertsData = analystEngine.getAlerts();
    const systemOverview = controlPlaneService.getSystemOverview();

    this.latestSnapshot = {
      timestamp: now,
      sequenceNumber: this.sequenceNumber,
      stockPrices,
      stockList,
      totalVolume: totalVol,
      marketStatus: systemOverview.simRunning ? 'SIMULATION' : 'OPEN',
      topMovers: { gainers, losers, active },
      alerts: {
        active: alertsData.active_rules || [],
        triggered: alertsData.triggered_alerts || [],
        totalCount: (alertsData.triggered_alerts || []).length
      },
      systemStatus: {
        mode: systemOverview.systemMode || 'LIVE',
        cpuUsage: systemOverview.cpuUsage || '34.2%',
        memoryUsage: systemOverview.memoryUsage || '1.85 GB',
        queueSize: systemOverview.queueSize || 0,
        queueCapacity: systemOverview.maxCapacity || 10000,
        processingSpeed: systemOverview.processingSpeed || 1450,
        tickSpeedMs: 100,
        simRunning: Boolean(systemOverview.simRunning),
        uptimeSeconds: Math.floor(process.uptime()),
        activeDashboards: this.sseClients.size + 1,
        latencyMs: Math.floor(6 + Math.random() * 4),
        dbStatus: 'Connected',
        databases: dbManager.getOverview()
      }
    };

    return this.latestSnapshot;
  }

  // 2. CENTRALIZED TICK PROCESSOR HANDLER
  // Called by TickEngine whenever new ticks are ingested and evaluated
  public onTicksProcessed(ticks: Tick[]): void {
    if (!ticks || ticks.length === 0) return;

    // Feed ticks into AnalystEngine for live evaluation
    ticks.forEach(t => {
      const existing = analystEngine.getStock(t.symbol);
      const oldPrice = existing ? Number(existing.price) || t.price : t.price;
      const change = t.price - oldPrice;
      const change_percent = oldPrice > 0 ? (change / oldPrice) * 100 : 0.5;

      analystEngine.evaluateTick({
        symbol: t.symbol,
        price: t.price,
        volume: t.volume,
        change: change.toFixed(2),
        change_percent: parseFloat(change_percent.toFixed(2))
      });
    });

    // Refresh Single Source of Truth
    this.refreshSnapshot();

    // Throttled broadcast to all dashboards
    const now = Date.now();
    if (now - this.lastBroadcastTime >= this.broadcastThrottleMs) {
      this.lastBroadcastTime = now;
      this.broadcast();
    }
  }

  // 3. EVENT BROADCASTER (SSE STREAMING TO ALL DASHBOARDS)
  public broadcast(): void {
    if (this.sseClients.size === 0 && this.alertClients.size === 0) return;

    const payload = JSON.stringify(this.latestSnapshot);
    const sseMessage = `event: snapshot\ndata: ${payload}\n\n`;

    this.sseClients.forEach(client => {
      try {
        client.write(sseMessage);
      } catch (err) {
        this.sseClients.delete(client);
      }
    });

    // Also broadcast latest alerts to dedicated /api/alerts SSE subscribers
    if (this.alertClients.size > 0 && this.latestSnapshot.alerts.triggered.length > 0) {
      const latestAlert = this.latestSnapshot.alerts.triggered[0];
      const alertMsg = `data: ${JSON.stringify(latestAlert)}\n\n`;
      this.alertClients.forEach(client => {
        try {
          client.write(alertMsg);
        } catch (err) {
          this.alertClients.delete(client);
        }
      });
    }
  }

  // 4. CLIENT CONNECTION POOLS
  public addSseClient(res: any): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    this.sseClients.add(res);

    // Immediately send current snapshot upon connection
    const payload = JSON.stringify(this.getLatestSnapshot());
    res.write(`event: snapshot\ndata: ${payload}\n\n`);

    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  public addAlertClient(res: any): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    this.alertClients.add(res);

    // Send recent alerts immediately
    const alerts = this.getLatestSnapshot().alerts.triggered;
    if (alerts.length > 0) {
      res.write(`data: ${JSON.stringify(alerts[0])}\n\n`);
    }

    res.on("close", () => {
      this.alertClients.delete(res);
    });
  }

  public getLatestSnapshot(): MarketSnapshot {
    if (!this.latestSnapshot) {
      return this.refreshSnapshot();
    }
    return this.latestSnapshot;
  }
}

export const realtimeSnapshotService = new RealtimeSnapshotService();
