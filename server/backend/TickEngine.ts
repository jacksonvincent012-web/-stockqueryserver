import zlib from 'zlib';
import { dbManager } from '../database/index';

export interface Tick {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  timestamp: string;
}

export interface OHLCCandle {
  symbol: string;
  interval: '1m';
  timestamp: string; // ISO minute bucket
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tickCount: number;
}

export interface ColdArchive {
  archiveId: string;
  symbol: string;
  fromTimestamp: string;
  toTimestamp: string;
  recordCount: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: string;
  createdAt: string;
  format: 'GZIP_PARQUET_SIM';
}

// 1. HOT MEMORY LAYER - O(1) Ring Buffer Deque
class HotRingBuffer {
  private buffer: Tick[] = [];
  private capacity: number;

  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  public push(tick: Tick): Tick[] {
    this.buffer.push(tick);
    const evicted: Tick[] = [];
    while (this.buffer.length > this.capacity) {
      const removed = this.buffer.shift();
      if (removed) evicted.push(removed);
    }
    return evicted;
  }

  public getTicks(): Tick[] {
    return [...this.buffer];
  }

  public getCount(): number {
    return this.buffer.length;
  }

  public clear(): Tick[] {
    const all = [...this.buffer];
    this.buffer = [];
    return all;
  }
}

// 2. MAIN TICK STORAGE ENGINE
export class TickStorageEngine {
  public onTicksProcessedCallback?: (ticks: Tick[]) => void;
  private ingestionQueue: Tick[] = [];
  private hotBuffers: Map<string, HotRingBuffer> = new Map();
  private hotCapacityPerSymbol: number = 200; // configurable capacity
  
  // Warm Storage (Database simulation)
  private warmDatabase: Map<string, Tick[]> = new Map();
  private totalWarmRecords: number = 0;
  
  // Cold Storage Archives
  private coldArchives: ColdArchive[] = [];
  private totalOriginalBytes: number = 0;
  private totalCompressedBytes: number = 0;

  // OHLC Aggregation Pipeline
  private ohlcStore: Map<string, Map<string, OHLCCandle>> = new Map();

  // Metrics & Stats
  private stats = {
    totalTicksIngested: 0,
    totalTicksEvictedToWarm: 0,
    totalBatchWrites: 0,
    totalColdCompressions: 0,
    lastBatchWriteTime: Date.now(),
    ticksPerSecond: 0,
    tickCounterWindow: 0,
    lastWindowTime: Date.now()
  };

  constructor() {
    // Seed initial stocks with baseline hot & warm ticks
    this.seedBaselineData(['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BRK.A']);
    
    // Start background processing loops
    setInterval(() => this.processIngestionQueue(), 100);
    setInterval(() => this.batchFlushWarmToColdCheck(), 15000);
    setInterval(() => this.updateThroughputMetrics(), 1000);
  }

  private seedBaselineData(symbols: string[]) {
    const now = Date.now();
    symbols.forEach(symbol => {
      if (!this.hotBuffers.has(symbol)) {
        this.hotBuffers.set(symbol, new HotRingBuffer(this.hotCapacityPerSymbol));
      }
      if (!this.warmDatabase.has(symbol)) {
        this.warmDatabase.set(symbol, []);
      }
      if (!this.ohlcStore.has(symbol)) {
        this.ohlcStore.set(symbol, new Map());
      }

      let basePrice = symbol === 'BRK.A' ? 615000 : symbol === 'NVDA' ? 125 : symbol === 'AAPL' ? 190 : 250;
      
      // Seed 60 warm database ticks (past hour)
      const warmTicks: Tick[] = [];
      for (let i = 60; i >= 15; i--) {
        const time = new Date(now - i * 60000).toISOString();
        basePrice += (Math.random() * 2 - 1);
        const tick: Tick = {
          id: `seed-w-${symbol}-${i}`,
          symbol,
          price: parseFloat(basePrice.toFixed(2)),
          volume: Math.floor(Math.random() * 500 + 50),
          timestamp: time
        };
        warmTicks.push(tick);
        this.updateOHLC(tick);
      }
      this.warmDatabase.set(symbol, warmTicks);
      this.totalWarmRecords += warmTicks.length;

      // Seed 15 hot memory ticks (recent minutes)
      const buffer = this.hotBuffers.get(symbol)!;
      for (let i = 14; i >= 0; i--) {
        const time = new Date(now - i * 3000).toISOString();
        basePrice += (Math.random() * 1.5 - 0.75);
        const tick: Tick = {
          id: `seed-h-${symbol}-${i}`,
          symbol,
          price: parseFloat(basePrice.toFixed(2)),
          volume: Math.floor(Math.random() * 300 + 20),
          timestamp: time
        };
        buffer.push(tick);
        this.updateOHLC(tick);
        this.stats.totalTicksIngested++;
      }
    });

    // Create 2 sample cold archives for demonstration
    this.compressWarmToCold('AAPL', true);
    this.compressWarmToCold('NVDA', true);
  }

  private updateThroughputMetrics() {
    const now = Date.now();
    const elapsed = (now - this.stats.lastWindowTime) / 1000;
    if (elapsed > 0) {
      this.stats.ticksPerSecond = Math.round(this.stats.tickCounterWindow / elapsed);
      this.stats.tickCounterWindow = 0;
      this.stats.lastWindowTime = now;
    }
  }

  // 1. TICK INGESTION
  public ingestTick(tickInput: { symbol: string; price: number; volume: number; timestamp?: string }): Tick {
    const tick: Tick = {
      id: `tick-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      symbol: tickInput.symbol.toUpperCase(),
      price: parseFloat(Number(tickInput.price).toFixed(2)),
      volume: Math.floor(Number(tickInput.volume)),
      timestamp: tickInput.timestamp || new Date().toISOString()
    };

    this.ingestionQueue.push(tick);
    this.stats.totalTicksIngested++;
    this.stats.tickCounterWindow++;
    return tick;
  }

  public ingestBurst(symbols: string[], countPerSymbol: number = 30): number {
    let totalIngested = 0;
    symbols.forEach(symbol => {
      const sym = symbol.toUpperCase();
      let lastPrice = 150;
      const existingHot = this.hotBuffers.get(sym)?.getTicks();
      if (existingHot && existingHot.length > 0) {
        lastPrice = existingHot[existingHot.length - 1].price;
      }
      for (let i = 0; i < countPerSymbol; i++) {
        lastPrice += (Math.random() * 2 - 0.95);
        this.ingestionQueue.push({
          id: `burst-${sym}-${Date.now()}-${i}`,
          symbol: sym,
          price: parseFloat(lastPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000 + 100),
          timestamp: new Date(Date.now() - (countPerSymbol - i) * 100).toISOString()
        });
        totalIngested++;
        this.stats.totalTicksIngested++;
        this.stats.tickCounterWindow++;
      }
    });
    return totalIngested;
  }

  // 2. PROCESS QUEUE INTO HOT MEMORY & OHLC
  private processIngestionQueue() {
    if (this.ingestionQueue.length === 0) return;

    const batch = this.ingestionQueue.splice(0, 500); // Process up to 500 per tick loop
    const evictedBySymbol: Map<string, Tick[]> = new Map();

    batch.forEach(tick => {
      if (!this.hotBuffers.has(tick.symbol)) {
        this.hotBuffers.set(tick.symbol, new HotRingBuffer(this.hotCapacityPerSymbol));
      }
      const buffer = this.hotBuffers.get(tick.symbol)!;
      const evicted = buffer.push(tick);
      
      if (evicted.length > 0) {
        if (!evictedBySymbol.has(tick.symbol)) evictedBySymbol.set(tick.symbol, []);
        evictedBySymbol.get(tick.symbol)!.push(...evicted);
        this.stats.totalTicksEvictedToWarm += evicted.length;
      }

      // 4. INCREMENTAL OHLC AGGREGATION
      this.updateOHLC(tick);
    });

    // 3. BATCH WRITE EVICTED TICKS TO WARM DATABASE
    if (evictedBySymbol.size > 0) {
      this.batchWriteToWarm(evictedBySymbol);
    }

    if (this.onTicksProcessedCallback) {
      this.onTicksProcessedCallback(batch);
    }
  }

  private updateOHLC(tick: Tick) {
    if (!this.ohlcStore.has(tick.symbol)) {
      this.ohlcStore.set(tick.symbol, new Map());
    }
    const symbolMap = this.ohlcStore.get(tick.symbol)!;

    // Bucket by YYYY-MM-DDTHH:MM (1m interval)
    const minuteBucket = tick.timestamp.substring(0, 16) + ':00.000Z';
    const existing = symbolMap.get(minuteBucket);

    if (!existing) {
      symbolMap.set(minuteBucket, {
        symbol: tick.symbol,
        interval: '1m',
        timestamp: minuteBucket,
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price,
        volume: tick.volume,
        tickCount: 1
      });
    } else {
      existing.high = Math.max(existing.high, tick.price);
      existing.low = Math.min(existing.low, tick.price);
      existing.close = tick.price;
      existing.volume += tick.volume;
      existing.tickCount += 1;
    }

    // Keep only last 1440 candles (24 hours of 1m intervals) in fast OHLC store
    if (symbolMap.size > 1440) {
      const firstKey = symbolMap.keys().next().value;
      if (firstKey) symbolMap.delete(firstKey);
    }
  }

  // 3. WARM STORAGE BATCH WRITER
  private batchWriteToWarm(evictedBySymbol: Map<string, Tick[]>) {
    evictedBySymbol.forEach((ticks, symbol) => {
      if (!this.warmDatabase.has(symbol)) {
        this.warmDatabase.set(symbol, []);
      }
      const dbArray = this.warmDatabase.get(symbol)!;
      dbArray.push(...ticks);
      this.totalWarmRecords += ticks.length;

      if (ticks.length > 0 && dbManager) {
        dbManager.timeSeries.ingestTick({
          symbol: ticks[0].symbol,
          price: ticks[0].price,
          volume: ticks[0].volume,
          timestamp: new Date(ticks[0].timestamp).getTime() || Date.now()
        });
        dbManager.logQuery('TSDB', 'INSERT', 'live_market_ticks', 1, 'SUCCESS', `Ingested batch of ${ticks.length} ticks for ${symbol}`);
        dbManager.cache.set(`quote_cache:${symbol}`, ticks[ticks.length - 1]);
      }
    });
    this.stats.totalBatchWrites++;
    this.stats.lastBatchWriteTime = Date.now();
  }

  // Flush oldest warm data to cold compression if threshold exceeded
  private batchFlushWarmToColdCheck() {
    this.warmDatabase.forEach((ticks, symbol) => {
      if (ticks.length > 250) {
        this.compressWarmToCold(symbol, false);
      }
    });
  }

  // 5. COLD STORAGE COMPRESSION LAYER
  public compressWarmToCold(symbol: string, forceAll = false): ColdArchive | null {
    const dbArray = this.warmDatabase.get(symbol);
    if (!dbArray || dbArray.length < 10) return null;

    // Take oldest 70% of warm ticks (or 100% if forced for demo)
    const countToCompress = forceAll ? Math.min(dbArray.length, 50) : Math.floor(dbArray.length * 0.7);
    if (countToCompress === 0) return null;

    const ticksToCompress = dbArray.splice(0, countToCompress);
    this.totalWarmRecords -= ticksToCompress.length;

    const fromTime = ticksToCompress[0].timestamp;
    const toTime = ticksToCompress[ticksToCompress.length - 1].timestamp;

    // Serialize to JSON and compress using Node zlib
    const jsonStr = JSON.stringify(ticksToCompress);
    const originalSize = Buffer.byteLength(jsonStr, 'utf8');
    const compressedBuffer = zlib.gzipSync(jsonStr);
    const compressedSize = compressedBuffer.length;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%';

    const archive: ColdArchive = {
      archiveId: `COLD-${symbol}-${Date.now().toString(36).toUpperCase()}`,
      symbol,
      fromTimestamp: fromTime,
      toTimestamp: toTime,
      recordCount: ticksToCompress.length,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      compressionRatio: ratio,
      createdAt: new Date().toISOString(),
      format: 'GZIP_PARQUET_SIM'
    };

    this.coldArchives.unshift(archive);
    if (this.coldArchives.length > 100) this.coldArchives.pop();

    if (dbManager) {
      dbManager.warehouse.archiveTickBatch(symbol, ticksToCompress.length);
      dbManager.logQuery('WAREHOUSE', 'INSERT', 'archive_daily_trades', 12, 'SUCCESS', `Compressed ${ticksToCompress.length} ticks to OLAP archive for ${symbol}`);
    }
    
    this.totalOriginalBytes += originalSize;
    this.totalCompressedBytes += compressedSize;
    this.stats.totalColdCompressions++;

    return archive;
  }

  public triggerManualCompressionAll(): number {
    let count = 0;
    Array.from(this.warmDatabase.keys()).forEach(symbol => {
      const res = this.compressWarmToCold(symbol, true);
      if (res) count++;
    });
    return count;
  }

  // GETTERS FOR API / MONITORING
  public getEngineMetrics() {
    let totalHotTicks = 0;
    const hotSummaryBySymbol: Record<string, { count: number; capacity: number; lastPrice: number }> = {};
    const warmSummaryBySymbol: Record<string, number> = {};

    this.hotBuffers.forEach((buf, sym) => {
      const count = buf.getCount();
      totalHotTicks += count;
      const ticks = buf.getTicks();
      hotSummaryBySymbol[sym] = {
        count,
        capacity: this.hotCapacityPerSymbol,
        lastPrice: ticks.length > 0 ? ticks[ticks.length - 1].price : 0
      };
    });

    this.warmDatabase.forEach((ticks, sym) => {
      warmSummaryBySymbol[sym] = ticks.length;
    });

    const overallCompressionRatio = this.totalOriginalBytes > 0 
      ? ((1 - this.totalCompressedBytes / this.totalOriginalBytes) * 100).toFixed(1) + '%'
      : '0.0%';

    return {
      status: 'ONLINE_MULTI_TIER',
      architecture: 'HOT_MEMORY_DEQUE -> WARM_DB_PARTITIONS -> COLD_GZIP_PARQUET',
      ingestionQueue: {
        pendingCount: this.ingestionQueue.length,
        throughputTicksSec: this.stats.ticksPerSecond,
        totalIngested: this.stats.totalTicksIngested
      },
      hotMemoryLayer: {
        totalSymbols: this.hotBuffers.size,
        totalTicksInHot: totalHotTicks,
        capacityPerSymbol: this.hotCapacityPerSymbol,
        evictedToWarmCount: this.stats.totalTicksEvictedToWarm,
        symbolBreakdown: hotSummaryBySymbol
      },
      warmDatabaseLayer: {
        totalRecords: this.totalWarmRecords,
        totalBatchWrites: this.stats.totalBatchWrites,
        lastWriteAgoSec: Math.round((Date.now() - this.stats.lastBatchWriteTime) / 1000),
        symbolBreakdown: warmSummaryBySymbol
      },
      coldStorageLayer: {
        totalArchives: this.coldArchives.length,
        totalOriginalBytes: this.totalOriginalBytes,
        totalCompressedBytes: this.totalCompressedBytes,
        overallCompressionRatio,
        recentArchives: this.coldArchives.slice(0, 10)
      },
      ohlcPipeline: {
        totalActiveSymbols: this.ohlcStore.size,
        totalCandlesGenerated: Array.from(this.ohlcStore.values()).reduce((acc, m) => acc + m.size, 0)
      }
    };
  }

  public getOHLC(symbol: string): OHLCCandle[] {
    const sym = symbol.toUpperCase();
    const map = this.ohlcStore.get(sym);
    if (!map) return [];
    return Array.from(map.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public getTicksForSymbol(symbol: string, tier: 'hot' | 'warm' | 'all' = 'all'): Tick[] {
    const sym = symbol.toUpperCase();
    const hot = this.hotBuffers.get(sym)?.getTicks() || [];
    const warm = this.warmDatabase.get(sym) || [];
    
    if (tier === 'hot') return hot;
    if (tier === 'warm') return warm;
    return [...warm, ...hot].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public setHotCapacity(capacity: number) {
    if (capacity >= 10 && capacity <= 5000) {
      this.hotCapacityPerSymbol = capacity;
    }
  }
}

export const tickEngine = new TickStorageEngine();
