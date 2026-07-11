// ============================================================================
// Analyst Module Engine (TypeScript / Express Bridge for Live Preview)
// Mirrors the Python Flask Stock Query Server (/backend/analyst/server.py)
// ============================================================================

import {
  TickerHashMap,
  TopKHeap,
  AlertStack,
  LRUCacheService,
  SectorGraph,
  HistoricalBinarySearch,
  MergeSortRecords
} from './dsaServices';
import { tickEngine } from './TickEngine';
import { dbManager } from '../database/index';

export interface AlertRuleItem {
  rule_id: string;
  symbol: string;
  condition: string;
  threshold: number;
  created_at: string;
  status: string;
}

export class AnalystEngineService {
  public tickerMap = new TickerHashMap<any>();
  public gainersHeap = new TopKHeap(5, 'change_percent');
  public losersHeap = new TopKHeap(5, 'losers_score');
  public activeHeap = new TopKHeap(5, 'volume');
  
  public ruleStack = new AlertStack(500);
  public activeRules: AlertRuleItem[] = [];
  public triggeredAlerts: any[] = [];
  
  public queryCache = new LRUCacheService<any>(500);
  public sectorGraph = new SectorGraph();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    const defaultStocks = [
      { symbol: "AAPL", price: 191.25, volume: 12000, change_percent: 1.2, market_cap: 2980000000000, sector: "Technology Sector" },
      { symbol: "NVDA", price: 128.50, volume: 45000, change_percent: 4.5, market_cap: 3100000000000, sector: "Technology Sector" },
      { symbol: "TSLA", price: 252.10, volume: 38000, change_percent: 3.1, market_cap: 800000000000, sector: "Consumer Discretionary" },
      { symbol: "MSFT", price: 448.00, volume: 18000, change_percent: -0.4, market_cap: 3300000000000, sector: "Technology Sector" },
      { symbol: "INTC", price: 31.20, volume: 25000, change_percent: -3.8, market_cap: 130000000000, sector: "Technology Sector" },
      { symbol: "IBM", price: 175.40, volume: 9000, change_percent: -1.9, market_cap: 160000000000, sector: "Technology Sector" },
      { symbol: "AMZN", price: 186.30, volume: 29000, change_percent: 2.1, market_cap: 1950000000000, sector: "Consumer Discretionary" },
      { symbol: "GOOGL", price: 178.90, volume: 22000, change_percent: 0.8, market_cap: 2200000000000, sector: "Communication Services" },
      { symbol: "META", price: 504.10, volume: 15000, change_percent: 1.7, market_cap: 1280000000000, sector: "Communication Services" },
      { symbol: "JNJ", price: 146.80, volume: 8500, change_percent: -0.6, market_cap: 350000000000, sector: "Healthcare Sector" },
    ];

    // Seed Graph structure
    const sectors: Record<string, string[]> = {
      "Technology Sector": ["AAPL", "MSFT", "NVDA", "INTC", "IBM"],
      "Consumer Discretionary": ["TSLA", "AMZN"],
      "Communication Services": ["GOOGL", "META"],
      "Healthcare Sector": ["JNJ"]
    };
    for (const [sec, syms] of Object.entries(sectors)) {
      this.sectorGraph.addNode(sec, { type: "Sector", name: sec });
      for (const sym of syms) {
        this.sectorGraph.addNode(sym, { type: "Stock", symbol: sym });
        this.sectorGraph.addEdge(sec, sym, "SECTOR_MEMBERSHIP");
      }
    }

    for (const s of defaultStocks) {
      this.tickerMap.put(s.symbol, s);
      this.gainersHeap.updateStock(s.symbol, s);
      this.losersHeap.updateStock(s.symbol, { ...s, losers_score: -s.change_percent });
      this.activeHeap.updateStock(s.symbol, s);
    }
  }

  // 1. Stock Query Service (HashMap O(1))
  public getStock(symbol: string): any {
    if (!symbol) return null;
    const sym = symbol.toUpperCase().trim();
    const cacheKey = `stock_${sym}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached) return cached;

    let data = this.tickerMap.get(sym);
    if (!data) {
      // Try fetching from core TickEngine
      const candles = tickEngine.getOHLC(sym);
      if (candles && candles.length > 0) {
        const latest = candles[candles.length - 1];
        data = {
          symbol: sym,
          price: latest.close,
          volume: latest.volume,
          change_percent: Number(((latest.close - latest.open) / latest.open * 100).toFixed(2)),
          market_cap: latest.close * 10000000,
          sector: "Technology Sector"
        };
        this.tickerMap.put(sym, data);
      } else {
        return null;
      }
    }

    const res = {
      symbol: sym,
      price: Number(data.price || 0),
      volume: Number(data.volume || 0),
      change_percent: Number(data.change_percent || 0),
      market_cap: Number(data.market_cap || (data.price * 10000000) || 0)
    };
    this.queryCache.put(cacheKey, res);
    return res;
  }

  // 2. Market Analytics Engine (Top-K Heap)
  public getAnalytics(): any {
    const gainers = this.gainersHeap.getTopK().map(item => item.symbol);
    const losers = this.losersHeap.getTopK().map(item => item.symbol);
    const active = this.activeHeap.getTopK().map(item => item.symbol);

    const symbols = this.tickerMap.getAllSymbols();
    const sectorTotals: Record<string, number[]> = {};
    for (const sym of symbols) {
      const data = this.tickerMap.get(sym);
      const sec = data?.sector || "Other";
      const chg = Number(data?.change_percent || 0);
      if (!sectorTotals[sec]) sectorTotals[sec] = [];
      sectorTotals[sec].push(chg);
    }

    const sector_performance: Record<string, any> = {};
    for (const [sec, chgs] of Object.entries(sectorTotals)) {
      if (chgs.length > 0) {
        const avg = chgs.reduce((a, b) => a + b, 0) / chgs.length;
        sector_performance[sec] = {
          avg_change_percent: Number(avg.toFixed(2)),
          stock_count: chgs.length
        };
      }
    }

    return {
      top_gainers: gainers.length > 0 ? gainers : ["NVDA", "TSLA", "AMZN"],
      top_losers: losers.length > 0 ? losers : ["INTC", "IBM", "JNJ"],
      most_active: active.length > 0 ? active : ["AAPL", "NVDA", "TSLA"],
      sector_performance
    };
  }

  // 3. Alert Rule Engine (Stack LIFO)
  public createAlertRule(symbol: string, condition: string, threshold: number): AlertRuleItem {
    const rule: AlertRuleItem = {
      rule_id: `rule_${this.activeRules.length + 1}_${Date.now() % 10000}`,
      symbol: symbol.toUpperCase().trim(),
      condition: condition.toUpperCase().trim(),
      threshold: Number(threshold),
      created_at: new Date().toISOString(),
      status: "ACTIVE"
    };

    this.ruleStack.push({
      type: "CREATE_RULE",
      symbol: rule.symbol,
      timestamp: rule.created_at,
      message: JSON.stringify(rule)
    });
    this.activeRules.push(rule);
    return rule;
  }

  public getAlerts(): any {
    return {
      active_rules: this.activeRules,
      triggered_alerts: this.triggeredAlerts.slice(-20).reverse(),
      stack_size: this.ruleStack.size()
    };
  }

  public undoAlert(): any {
    const popped = this.ruleStack.pop();
    if (!popped) return null;
    try {
      if (popped.message) {
        const rule = JSON.parse(popped.message);
        this.activeRules = this.activeRules.filter(r => r.rule_id !== rule.rule_id);
        return { undone_rule: rule, status: "UNDONE" };
      }
    } catch (e) {
      // fallback
    }
    return { undone: popped, status: "UNDONE" };
  }

  // 4. Historical Data Engine (Merge Sort & Binary Search)
  public getHistory(symbol: string, limit = 100): any {
    const sym = symbol.toUpperCase().trim();
    const cacheKey = `history_${sym}_${limit}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached) return cached;

    const stock = this.getStock(sym) || { price: 150 };
    const time_series: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    const count = Math.min(limit, 365);
    for (let i = count; i > 0; i--) {
      const ts = new Date((now - i * 86400) * 1000).toISOString();
      const open = Number((stock.price + (i % 3) - 1.5).toFixed(2));
      const close = Number((open + ((i * 7) % 5) - 2.0).toFixed(2));
      const high = Number((Math.max(open, close) + 1.2).toFixed(2));
      const low = Number((Math.min(open, close) - 1.1).toFixed(2));
      time_series.push({
        timestamp: ts,
        open,
        high,
        low,
        close,
        volume: 10000 + i * 450
      });
    }

    // Merge Sort
    const sorted = MergeSortRecords.sort(time_series, 'timestamp', true);
    const res = {
      symbol: sym,
      count: sorted.length,
      time_series: sorted,
      sorting_algorithm: "Merge Sort (O(N log N))",
      search_algorithm: "Binary Search (O(log N))"
    };
    this.queryCache.put(cacheKey, res);
    return res;
  }

  // 5. Sector Exploration Engine (Graph BFS/DFS)
  public getSectorBFS(startNode = "Technology Sector", maxDepth = 3): any {
    const traversal = this.sectorGraph.bfsTraverse(startNode, maxDepth);
    return {
      algorithm: "BFS",
      start_node: startNode,
      max_depth: maxDepth,
      node_count: traversal.length,
      traversal
    };
  }

  public getSectorDFS(startNode = "Technology Sector", targetNode?: string): any {
    const path = this.sectorGraph.dfsTraverse(startNode, targetNode);
    return {
      algorithm: "DFS",
      start_node: startNode,
      target_node: targetNode || null,
      path_length: path.length,
      path
    };
  }

  // 6. Cache Layer (LRU Cache O(1))
  public getCacheStats(): any {
    const m = this.queryCache.getMetrics();
    return {
      hits: m.hits || 0,
      misses: m.misses || 0,
      capacity: m.capacity || 500,
      size: m.size || 0,
      hit_ratio: `${m.hitRatePct || 0}%`
    };
  }

  public searchStocks(query: string, limit = 10): any[] {
    if (!query) return [];
    const q = query.toUpperCase().trim();
    const cacheKey = `search_${q}_${limit}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached) return cached;

    const symbols = this.tickerMap.getAllSymbols();
    const results: any[] = [];
    for (const sym of symbols) {
      const data = this.tickerMap.get(sym);
      if (sym.includes(q) || (data?.sector || "").toUpperCase().includes(q)) {
        results.push({
          symbol: sym,
          price: Number(data?.price || 0),
          change_percent: Number(data?.change_percent || 0),
          sector: data?.sector || "Other"
        });
      }
      if (results.length >= limit) break;
    }
    this.queryCache.put(cacheKey, results);
    return results;
  }

  public evaluateTick(tick: any): void {
    const sym = (tick.symbol || "").toUpperCase();
    const price = Number(tick.price || 0);
    const vol = Number(tick.volume || 0);
    const chg = Number(tick.change_percent || tick.change || 0);

    const stockInfo = {
      symbol: sym,
      price,
      volume: vol,
      change_percent: chg,
      market_cap: price * 10000000,
      sector: this.tickerMap.get(sym)?.sector || "Technology Sector"
    };

    this.tickerMap.put(sym, stockInfo);
    this.gainersHeap.updateStock(sym, stockInfo);
    this.losersHeap.updateStock(sym, { ...stockInfo, losers_score: -chg });
    this.activeHeap.updateStock(sym, stockInfo);

    this.queryCache.remove(`stock_${sym}`);

    for (const rule of this.activeRules) {
      if (rule.status !== "ACTIVE") continue;
      if (rule.symbol !== sym && rule.symbol !== "ALL") continue;

      let triggered = false;
      let msg = "";
      if (rule.condition === "ABOVE" && price >= rule.threshold) {
        triggered = true;
        msg = `Price (${price}) crossed above threshold (${rule.threshold})`;
      } else if (rule.condition === "BELOW" && price <= rule.threshold && price > 0) {
        triggered = true;
        msg = `Price (${price}) dropped below threshold (${rule.threshold})`;
      } else if (rule.condition === "VOLUME_SPIKE" && vol >= rule.threshold) {
        triggered = true;
        msg = `Volume spike (${vol}) exceeded threshold (${rule.threshold})`;
      } else if (rule.condition === "PERCENT_CHANGE" && Math.abs(chg) >= rule.threshold) {
        triggered = true;
        msg = `Percentage change (${chg}%) exceeded threshold (${rule.threshold}%)`;
      }

      if (triggered) {
        const alertEvent = {
          symbol: sym,
          alert: msg,
          status: "TRIGGERED",
          timestamp: new Date().toISOString(),
          rule_id: rule.rule_id
        };
        this.triggeredAlerts.push(alertEvent);
        this.ruleStack.push({
          type: "TRIGGERED_ALERT",
          symbol: sym,
          timestamp: alertEvent.timestamp,
          message: msg
        });

        if (dbManager) {
          dbManager.document.setDocument('alert_events', `${rule.rule_id}-${Date.now()}`, alertEvent);
          dbManager.logQuery('DOCUMENT', 'INSERT', 'alert_events', 2, 'SUCCESS', `Triggered alert recorded for ${sym}: ${msg}`);
        }
      }
    }
  }
}

export const analystEngine = new AnalystEngineService();
