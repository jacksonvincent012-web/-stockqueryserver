// ============================================================================
// Database Configuration & Environment Profiles (Polyglot Persistence Layer)
// Sets up connection parameters, pooling limits, timeouts, and SSL policies
// for SQL, Time-Series, Key-Value Cache, NoSQL Document, and Warehouse tiers.
// ============================================================================

export interface DatabaseEngineConfig {
  id: string;
  name: string;
  type: 'SQL' | 'TSDB' | 'KEY_VALUE' | 'DOCUMENT' | 'WAREHOUSE';
  driver: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  maxPoolSize: number;
  connectionTimeoutMs: number;
  sslEnabled: boolean;
  retries: number;
  description: string;
  tablesOrCollections: string[];
}

export interface PolyglotDatabaseConfig {
  environment: 'development' | 'staging' | 'production';
  engines: Record<string, DatabaseEngineConfig>;
}

const ENV = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';

export const DATABASE_CONFIGS: PolyglotDatabaseConfig = {
  environment: ENV,
  engines: {
    relational: {
      id: 'db-sql-primary',
      name: 'PostgreSQL Relational Engine',
      type: 'SQL',
      driver: 'pg-pool / drizzle-orm',
      host: process.env.SQL_HOST || 'localhost',
      port: Number(process.env.SQL_PORT || 5432),
      databaseName: process.env.SQL_DB_NAME || 'ais_trading_rbac',
      username: process.env.SQL_USER || 'ais_app_user',
      maxPoolSize: 20,
      connectionTimeoutMs: 15000,
      sslEnabled: ENV === 'production',
      retries: 3,
      description: 'Primary relational store for User Accounts, RBAC Roles, User Watchlists, and Control Plane Configurations.',
      tablesOrCollections: ['users', 'roles', 'user_watchlists', 'system_configs', 'auth_audit_logs']
    },
    timeSeries: {
      id: 'db-tsdb-market',
      name: 'TimescaleDB / Warm Ring Buffer',
      type: 'TSDB',
      driver: 'timescaledb-hypertable',
      host: process.env.TSDB_HOST || 'localhost',
      port: Number(process.env.TSDB_PORT || 5433),
      databaseName: process.env.TSDB_NAME || 'ais_market_ticks',
      username: process.env.TSDB_USER || 'ts_ingestion_svc',
      maxPoolSize: 50,
      connectionTimeoutMs: 10000,
      sslEnabled: ENV === 'production',
      retries: 5,
      description: 'High-frequency time-series database optimized for ultra-low latency tick insertion and automatic OHLC candlestick rollup.',
      tablesOrCollections: ['live_market_ticks', 'ohlc_candlesticks_1m', 'ohlc_candlesticks_5m', 'ohlc_candlesticks_1h', 'volume_profiles']
    },
    cache: {
      id: 'db-redis-cache',
      name: 'Redis In-Memory Key-Value Store',
      type: 'KEY_VALUE',
      driver: 'ioredis-pubsub',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      databaseName: '0',
      username: 'default',
      maxPoolSize: 100,
      connectionTimeoutMs: 5000,
      sslEnabled: ENV === 'production',
      retries: 3,
      description: 'Ultra-fast in-memory cache layer managing real-time Top Movers (gainers/losers heaps), order book depth, and session JWT blacklists.',
      tablesOrCollections: ['top_movers:gainers', 'top_movers:losers', 'quote_cache:latest', 'session_tokens:active', 'rate_limit:ip_buckets']
    },
    document: {
      id: 'db-nosql-alerts',
      name: 'Firestore / Document Store',
      type: 'DOCUMENT',
      driver: 'firebase-admin / nosql-sdk',
      host: process.env.FIRESTORE_HOST || 'firestore.googleapis.com',
      port: 443,
      databaseName: process.env.FIRESTORE_DB_ID || '(default)',
      username: 'service_account_identity',
      maxPoolSize: 30,
      connectionTimeoutMs: 20000,
      sslEnabled: true,
      retries: 4,
      description: 'Flexible JSON document database storing user notification alert rules, triggered historical events, and control plane audit logs.',
      tablesOrCollections: ['alert_rules', 'trigger_history', 'system_audit_trails', 'analyst_notes', 'symbol_metadata']
    },
    warehouse: {
      id: 'db-olap-warehouse',
      name: 'ClickHouse Analytical Warehouse',
      type: 'WAREHOUSE',
      driver: 'clickhouse-client-olap',
      host: process.env.OLAP_HOST || 'warehouse.internal',
      port: 8123,
      databaseName: 'ais_historical_archive',
      username: 'olap_readonly_analyst',
      maxPoolSize: 15,
      connectionTimeoutMs: 30000,
      sslEnabled: true,
      retries: 2,
      description: 'Columnar analytical data warehouse storing multi-year cold historical trade archives for quantitative backtesting and algorithmic evaluation.',
      tablesOrCollections: ['archive_daily_trades', 'sector_correlation_matrix', 'historical_volatility_indices', 'backtest_execution_results']
    }
  }
};
