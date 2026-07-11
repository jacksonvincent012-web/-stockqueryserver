// ============================================================================
// Polyglot Database Manager (Unified Connection Orchestrator)
// Coordinates connection pools, health monitoring, multi-database seeding,
// and real-time query audit logging across all 5 database engines.
// ============================================================================

import { DATABASE_CONFIGS } from './config';
import { RelationalDbConnection, UserRecord } from './RelationalDbConnection';
import { TimeSeriesDbConnection } from './TimeSeriesDbConnection';
import { CacheDbConnection } from './CacheDbConnection';
import { DocumentDbConnection } from './DocumentDbConnection';
import { AnalyticalWarehouseConnection } from './AnalyticalWarehouseConnection';

export interface QueryAuditLog {
  id: string;
  timestamp: string;
  engine: 'SQL' | 'TSDB' | 'KEY_VALUE' | 'DOCUMENT' | 'WAREHOUSE';
  operation: string;
  targetTable: string;
  executionTimeMs: number;
  status: 'SUCCESS' | 'ERROR';
  details?: string;
}

export interface PolyglotOverview {
  environment: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  totalActivePoolConnections: number;
  totalMaxPoolCapacity: number;
  averageLatencyMs: number;
  engines: {
    relational: any;
    timeSeries: any;
    cache: any;
    document: any;
    warehouse: any;
  };
  recentQueryLogs: QueryAuditLog[];
}

export class DatabaseManager {
  public relational: RelationalDbConnection;
  public timeSeries: TimeSeriesDbConnection;
  public cache: CacheDbConnection;
  public document: DocumentDbConnection;
  public warehouse: AnalyticalWarehouseConnection;

  private queryLogs: QueryAuditLog[] = [];
  private maxQueryLogs: number = 50;
  private isInitialized: boolean = false;

  constructor() {
    this.relational = new RelationalDbConnection(DATABASE_CONFIGS.engines.relational);
    this.timeSeries = new TimeSeriesDbConnection(DATABASE_CONFIGS.engines.timeSeries);
    this.cache = new CacheDbConnection(DATABASE_CONFIGS.engines.cache);
    this.document = new DocumentDbConnection(DATABASE_CONFIGS.engines.document);
    this.warehouse = new AnalyticalWarehouseConnection(DATABASE_CONFIGS.engines.warehouse);
  }

  public async initializeAll(): Promise<boolean> {
    console.log('[DatabaseManager] Booting polyglot persistence layer across 5 engine tiers...');
    try {
      await Promise.all([
        this.relational.connect(),
        this.timeSeries.connect(),
        this.cache.connect(),
        this.document.connect(),
        this.warehouse.connect()
      ]);

      this.isInitialized = true;
      this.logQuery('SQL', 'CONNECT', 'users, roles, watchlists', 12, 'SUCCESS', 'PostgreSQL pool initialized');
      this.logQuery('TSDB', 'CONNECT', 'live_market_ticks', 8, 'SUCCESS', 'TimescaleDB hypertable bound');
      this.logQuery('KEY_VALUE', 'CONNECT', 'top_movers, session_tokens', 3, 'SUCCESS', 'Redis pub/sub channels open');
      this.logQuery('DOCUMENT', 'CONNECT', 'alert_rules, system_audit', 15, 'SUCCESS', 'Firestore gRPC channel ready');
      this.logQuery('WAREHOUSE', 'CONNECT', 'archive_daily_trades', 24, 'SUCCESS', 'ClickHouse OLAP read-only cluster connected');

      console.log('[DatabaseManager] All 5 database tiers connected and healthy.');
      return true;
    } catch (err: any) {
      console.error('[DatabaseManager] Failed to boot one or more database tiers:', err);
      return false;
    }
  }

  public async shutdownAll(): Promise<void> {
    console.log('[DatabaseManager] Shutting down database connections...');
    await Promise.all([
      this.relational.disconnect(),
      this.timeSeries.disconnect(),
      this.cache.disconnect(),
      this.document.disconnect(),
      this.warehouse.disconnect()
    ]);
    this.isInitialized = false;
  }

  public async pingAll(): Promise<Record<string, number>> {
    const [sql, tsdb, kv, doc, olap] = await Promise.all([
      this.relational.ping().catch(() => -1),
      this.timeSeries.ping().catch(() => -1),
      this.cache.ping().catch(() => -1),
      this.document.ping().catch(() => -1),
      this.warehouse.ping().catch(() => -1)
    ]);

    return { sql, tsdb, kv, doc, olap };
  }

  public async reconnectEngine(engineType: 'SQL' | 'TSDB' | 'KEY_VALUE' | 'DOCUMENT' | 'WAREHOUSE'): Promise<boolean> {
    const start = Date.now();
    try {
      if (engineType === 'SQL') {
        await this.relational.disconnect();
        await this.relational.connect();
        this.logQuery('SQL', 'RECONNECT', 'pool_reset', Date.now() - start, 'SUCCESS');
      } else if (engineType === 'TSDB') {
        await this.timeSeries.disconnect();
        await this.timeSeries.connect();
        this.logQuery('TSDB', 'RECONNECT', 'hypertable_reset', Date.now() - start, 'SUCCESS');
      } else if (engineType === 'KEY_VALUE') {
        await this.cache.disconnect();
        await this.cache.connect();
        this.logQuery('KEY_VALUE', 'RECONNECT', 'redis_socket_reset', Date.now() - start, 'SUCCESS');
      } else if (engineType === 'DOCUMENT') {
        await this.document.disconnect();
        await this.document.connect();
        this.logQuery('DOCUMENT', 'RECONNECT', 'grpc_channel_reset', Date.now() - start, 'SUCCESS');
      } else if (engineType === 'WAREHOUSE') {
        await this.warehouse.disconnect();
        await this.warehouse.connect();
        this.logQuery('WAREHOUSE', 'RECONNECT', 'olap_cluster_reset', Date.now() - start, 'SUCCESS');
      }
      return true;
    } catch (err: any) {
      this.logQuery(engineType, 'RECONNECT', 'pool_reset', Date.now() - start, 'ERROR', err.message);
      return false;
    }
  }

  public async seedAll(initialUsers: UserRecord[], symbols: string[] = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BRK.A']): Promise<void> {
    console.log('[DatabaseManager] Running multi-tier database seeding...');
    const start = Date.now();

    await Promise.all([
      this.relational.seed(initialUsers),
      this.timeSeries.seedWarmBuffer(symbols),
      this.cache.seedTopMovers(
        symbols.slice(0, 4).map(s => ({ symbol: s, change_percent: Number((Math.random() * 5 + 1).toFixed(2)) })),
        symbols.slice(4).map(s => ({ symbol: s, change_percent: Number(-(Math.random() * 4 + 0.5).toFixed(2)) }))
      ),
      this.document.seedDefaultDocuments(),
      this.warehouse.seedHistoricalArchives(symbols)
    ]);

    this.logQuery('SQL', 'SEED', 'users, user_watchlists', 14, 'SUCCESS', `Seeded ${initialUsers.length} user accounts`);
    this.logQuery('TSDB', 'SEED', 'live_market_ticks', 28, 'SUCCESS', `Seeded 60m warm tick buffer across ${symbols.length} tickers`);
    this.logQuery('KEY_VALUE', 'SEED', 'top_movers', 5, 'SUCCESS', 'Cached top gainers and losers');
    this.logQuery('DOCUMENT', 'SEED', 'alert_rules, audit_trails', 18, 'SUCCESS', 'Created default alert rules and boot audit log');
    this.logQuery('WAREHOUSE', 'SEED', 'archive_daily_trades', 45, 'SUCCESS', `Archived 30 days of daily trade histograms for ${symbols.length} symbols`);

    console.log(`[DatabaseManager] Seeding completed in ${Date.now() - start}ms.`);
  }

  public logQuery(
    engine: 'SQL' | 'TSDB' | 'KEY_VALUE' | 'DOCUMENT' | 'WAREHOUSE',
    operation: string,
    targetTable: string,
    executionTimeMs: number,
    status: 'SUCCESS' | 'ERROR' = 'SUCCESS',
    details?: string
  ): void {
    const log: QueryAuditLog = {
      id: `QUERY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      engine,
      operation,
      targetTable,
      executionTimeMs,
      status,
      details
    };
    this.queryLogs.unshift(log);
    if (this.queryLogs.length > this.maxQueryLogs) {
      this.queryLogs.pop();
    }
  }

  public getOverview(): PolyglotOverview {
    const rel = this.relational.getStatus();
    const ts = this.timeSeries.getStatus();
    const kv = this.cache.getStatus();
    const doc = this.document.getStatus();
    const wh = this.warehouse.getStatus();

    const activeConns = rel.activePoolSize + ts.activePoolSize + kv.activePoolSize + doc.activePoolSize + wh.activePoolSize;
    const maxConns = rel.maxPoolSize + ts.maxPoolSize + kv.maxPoolSize + doc.maxPoolSize + wh.maxPoolSize;
    const avgLatency = Number(((rel.latencyMs + ts.latencyMs + kv.latencyMs + doc.latencyMs + wh.latencyMs) / 5).toFixed(2));

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    const statuses = [rel.status, ts.status, kv.status, doc.status, wh.status];
    if (statuses.includes('DISCONNECTED')) {
      overallStatus = statuses.filter(s => s === 'DISCONNECTED').length >= 3 ? 'CRITICAL' : 'DEGRADED';
    } else if (statuses.includes('DEGRADED')) {
      overallStatus = 'DEGRADED';
    }

    return {
      environment: DATABASE_CONFIGS.environment,
      overallStatus,
      totalActivePoolConnections: activeConns,
      totalMaxPoolCapacity: maxConns,
      averageLatencyMs: avgLatency,
      engines: {
        relational: rel,
        timeSeries: ts,
        cache: kv,
        document: doc,
        warehouse: wh
      },
      recentQueryLogs: this.queryLogs
    };
  }
}
