// ============================================================================
// Relational Database Connection & Repository Layer (PostgreSQL / SQLite)
// Handles Users, RBAC Roles, User Watchlists, and System Configurations.
// ============================================================================

import { DatabaseEngineConfig } from './config';

export interface UserRecord {
  id: number;
  uid?: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'analyst' | 'viewer';
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin: string;
  createdAt: string;
}

export interface WatchlistRecord {
  id: number;
  userId: number;
  name: string;
  symbols: string[];
  isDefault: boolean;
  updatedAt: string;
}

export interface RelationalDbStatus {
  engineId: string;
  name: string;
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  activePoolSize: number;
  maxPoolSize: number;
  latencyMs: number;
  totalQueriesExecuted: number;
  lastError: string | null;
  tableStats: Record<string, number>;
}

export class RelationalDbConnection {
  private config: DatabaseEngineConfig;
  private isConnected: boolean = false;
  private activeConnections: number = 0;
  private queryCount: number = 0;
  private latencyMs: number = 1.2;
  private lastError: string | null = null;

  // In-memory simulation tables (acts as SQLite / PostgreSQL pool buffer)
  private usersTable: Map<number, UserRecord> = new Map();
  private watchlistsTable: Map<number, WatchlistRecord> = new Map();
  private nextUserId: number = 1;
  private nextWatchlistId: number = 1;

  constructor(config: DatabaseEngineConfig) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    try {
      this.activeConnections = Math.floor(this.config.maxPoolSize * 0.4) || 8;
      this.isConnected = true;
      this.lastError = null;
      this.latencyMs = Number((Math.random() * 1.5 + 0.8).toFixed(2));
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || 'Connection refused by PostgreSQL postmaster';
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.activeConnections = 0;
  }

  public async ping(): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Relational SQL Database is disconnected. Call connect() first.');
    }
    const start = Date.now();
    // Simulate query execution delay
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 3 + 1)));
    this.latencyMs = Date.now() - start || 1.1;
    this.queryCount++;
    return this.latencyMs;
  }

  public async executeQuery(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number; executionTimeMs: number }> {
    const start = Date.now();
    await this.ping();
    const executionTimeMs = Date.now() - start;

    const normalized = sql.trim().toUpperCase();
    if (normalized.startsWith('SELECT * FROM USERS')) {
      const rows = Array.from(this.usersTable.values());
      return { rows, rowCount: rows.length, executionTimeMs };
    } else if (normalized.startsWith('SELECT * FROM USER_WATCHLISTS')) {
      const rows = Array.from(this.watchlistsTable.values());
      return { rows, rowCount: rows.length, executionTimeMs };
    } else if (normalized.startsWith('SELECT COUNT(*) FROM')) {
      return { rows: [{ count: this.usersTable.size + this.watchlistsTable.size }], rowCount: 1, executionTimeMs };
    }

    // Default simulated response
    return { rows: [], rowCount: 0, executionTimeMs };
  }

  // User Repository Operations
  public async getUsers(): Promise<UserRecord[]> {
    await this.ping();
    return Array.from(this.usersTable.values());
  }

  public async getUserById(id: number): Promise<UserRecord | undefined> {
    await this.ping();
    return this.usersTable.get(id);
  }

  public async getUserByUsername(username: string): Promise<UserRecord | undefined> {
    await this.ping();
    return Array.from(this.usersTable.values()).find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public async createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'lastLogin' | 'status'>): Promise<UserRecord> {
    await this.ping();
    const existing = await this.getUserByUsername(user.username);
    if (existing) {
      throw new Error(`User with username "${user.username}" already exists in SQL database.`);
    }
    const id = this.nextUserId++;
    const newRecord: UserRecord = {
      ...user,
      id,
      status: 'Active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString()
    };
    this.usersTable.set(id, newRecord);

    // Create default watchlist for user
    await this.createWatchlist({
      userId: id,
      name: 'Default Watchlist',
      symbols: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BRK.A'],
      isDefault: true
    });

    return newRecord;
  }

  public async updateUser(id: number, updates: Partial<UserRecord>): Promise<UserRecord | undefined> {
    await this.ping();
    const existing = this.usersTable.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.usersTable.set(id, updated);
    return updated;
  }

  public async deleteUser(id: number): Promise<boolean> {
    await this.ping();
    if (id === 1) throw new Error('Cannot delete root system administrator record.');
    return this.usersTable.delete(id);
  }

  // Watchlist Repository Operations
  public async getWatchlistsByUserId(userId: number): Promise<WatchlistRecord[]> {
    await this.ping();
    return Array.from(this.watchlistsTable.values()).filter(w => w.userId === userId);
  }

  public async createWatchlist(watchlist: Omit<WatchlistRecord, 'id' | 'updatedAt'>): Promise<WatchlistRecord> {
    await this.ping();
    const id = this.nextWatchlistId++;
    const record: WatchlistRecord = {
      ...watchlist,
      id,
      updatedAt: new Date().toISOString()
    };
    this.watchlistsTable.set(id, record);
    return record;
  }

  public async updateWatchlistSymbols(id: number, symbols: string[]): Promise<WatchlistRecord | undefined> {
    await this.ping();
    const existing = this.watchlistsTable.get(id);
    if (!existing) return undefined;
    const updated: WatchlistRecord = {
      ...existing,
      symbols: Array.from(new Set(symbols)),
      updatedAt: new Date().toISOString()
    };
    this.watchlistsTable.set(id, updated);
    return updated;
  }

  public getStatus(): RelationalDbStatus {
    return {
      engineId: this.config.id,
      name: this.config.name,
      status: this.isConnected ? 'CONNECTED' : 'DISCONNECTED',
      activePoolSize: this.activeConnections,
      maxPoolSize: this.config.maxPoolSize,
      latencyMs: this.latencyMs,
      totalQueriesExecuted: this.queryCount,
      lastError: this.lastError,
      tableStats: {
        users: this.usersTable.size,
        roles: 3, // admin, analyst, viewer
        user_watchlists: this.watchlistsTable.size,
        system_configs: 14,
        auth_audit_logs: this.queryCount * 2 + 15
      }
    };
  }

  public async seed(initialUsers: UserRecord[]): Promise<void> {
    this.usersTable.clear();
    this.watchlistsTable.clear();
    this.nextUserId = 1;
    this.nextWatchlistId = 1;

    for (const u of initialUsers) {
      const id = this.nextUserId++;
      this.usersTable.set(id, { ...u, id });
      this.createWatchlist({
        userId: id,
        name: `${u.username.toUpperCase()} Primary Portfolio`,
        symbols: u.role === 'analyst' ? ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'BRK.A'] : ['AAPL', 'MSFT', 'NVDA', 'BRK.A'],
        isDefault: true
      });
    }
    this.queryCount += initialUsers.length * 3;
  }
}
