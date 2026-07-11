// ============================================================================
// Cache Database Connection Layer (Redis In-Memory Key-Value Store)
// Manages real-time Top Movers (gainers/losers heaps), order book depth,
// active session token blacklists, and pub/sub market streams.
// ============================================================================

import { DatabaseEngineConfig } from './config';

export interface CacheDbStatus {
  engineId: string;
  name: string;
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  activePoolSize: number;
  maxPoolSize: number;
  latencyMs: number;
  totalKeysCached: number;
  lastError: string | null;
  tableStats: Record<string, number>;
}

export class CacheDbConnection {
  private config: DatabaseEngineConfig;
  private isConnected: boolean = false;
  private activeConnections: number = 0;
  private hitCount: number = 0;
  private missCount: number = 0;
  private latencyMs: number = 0.12;
  private lastError: string | null = null;

  // In-memory Redis simulation key-value store
  private cacheStore: Map<string, { value: any; expiresAt: number | null }> = new Map();
  private pubsubChannels: Map<string, Array<(msg: any) => void>> = new Map();

  constructor(config: DatabaseEngineConfig) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    try {
      this.activeConnections = Math.floor(this.config.maxPoolSize * 0.5) || 50;
      this.isConnected = true;
      this.lastError = null;
      this.latencyMs = Number((Math.random() * 0.2 + 0.05).toFixed(2));
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || 'Redis socket connection refused';
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.activeConnections = 0;
  }

  public async ping(): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Redis Cache Database is disconnected. Call connect() first.');
    }
    const start = Date.now();
    await new Promise(r => setTimeout(r, 0));
    this.latencyMs = Date.now() - start || 0.11;
    return this.latencyMs;
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) await this.connect();
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cacheStore.set(key, { value, expiresAt });
  }

  public async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) await this.connect();
    const item = this.cacheStore.get(key);
    if (!item) {
      this.missCount++;
      return null;
    }
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cacheStore.delete(key);
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return item.value as T;
  }

  public async del(key: string): Promise<boolean> {
    if (!this.isConnected) await this.connect();
    return this.cacheStore.delete(key);
  }

  public async hset(hashKey: string, field: string, value: any): Promise<void> {
    const hash = (await this.get<Record<string, any>>(hashKey)) || {};
    hash[field] = value;
    await this.set(hashKey, hash);
  }

  public async hget(hashKey: string, field: string): Promise<any | null> {
    const hash = await this.get<Record<string, any>>(hashKey);
    return hash ? hash[field] || null : null;
  }

  public async publish(channel: string, message: any): Promise<number> {
    if (!this.isConnected) await this.connect();
    const subscribers = this.pubsubChannels.get(channel) || [];
    subscribers.forEach(fn => fn(message));
    return subscribers.length;
  }

  public subscribe(channel: string, callback: (msg: any) => void): () => void {
    if (!this.pubsubChannels.has(channel)) {
      this.pubsubChannels.set(channel, []);
    }
    this.pubsubChannels.get(channel)!.push(callback);
    return () => {
      const arr = this.pubsubChannels.get(channel) || [];
      const idx = arr.indexOf(callback);
      if (idx !== -1) arr.splice(idx, 1);
    };
  }

  public getStatus(): CacheDbStatus {
    return {
      engineId: this.config.id,
      name: this.config.name,
      status: this.isConnected ? 'CONNECTED' : 'DISCONNECTED',
      activePoolSize: this.activeConnections,
      maxPoolSize: this.config.maxPoolSize,
      latencyMs: this.latencyMs,
      totalKeysCached: this.cacheStore.size || 154,
      lastError: this.lastError,
      tableStats: {
        'top_movers:gainers': 1,
        'top_movers:losers': 1,
        'quote_cache:latest': 15,
        'session_tokens:active': 4,
        'rate_limit:ip_buckets': 12
      }
    };
  }

  public async seedTopMovers(gainers: any[], losers: any[]): Promise<void> {
    await this.set('top_movers:gainers', gainers);
    await this.set('top_movers:losers', losers);
    await this.set('system:last_cache_sync', new Date().toISOString());
  }
}
