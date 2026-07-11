// ============================================================================
// Database Abstraction & Polyglot Connection Layer Export
// Exposes the singleton dbManager and types for use across server and engines.
// ============================================================================

import { DatabaseManager } from './DatabaseManager';

export const dbManager = new DatabaseManager();

export * from './config';
export * from './RelationalDbConnection';
export * from './TimeSeriesDbConnection';
export * from './CacheDbConnection';
export * from './DocumentDbConnection';
export * from './AnalyticalWarehouseConnection';
export * from './DatabaseManager';
