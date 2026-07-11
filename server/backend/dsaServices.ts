// ============================================================================
// Core Backend Data Structure Architectures (DSA) for Market Data Computation
// ============================================================================

import { Tick, Candle } from '../../src/types';

/**
 * 1. HashMap DSA Structure: Fast ticker lookup O(1)
 */
export class TickerHashMap<T = any> {
  private map = new Map<string, T>();

  public put(symbol: string, data: T): void {
    if (!symbol) return;
    this.map.set(symbol.toUpperCase().trim(), data);
  }

  public get(symbol: string): T | undefined {
    if (!symbol) return undefined;
    return this.map.get(symbol.toUpperCase().trim());
  }

  public contains(symbol: string): boolean {
    if (!symbol) return false;
    return this.map.has(symbol.toUpperCase().trim());
  }

  public remove(symbol: string): boolean {
    if (!symbol) return false;
    return this.map.delete(symbol.toUpperCase().trim());
  }

  public getAllSymbols(): string[] {
    return Array.from(this.map.keys()).sort();
  }

  public size(): number {
    return this.map.size;
  }

  public clear(): void {
    this.map.clear();
  }
}

/**
 * 2. Queue DSA Structure: Buffer incoming ticks FIFO
 */
export class TickQueue {
  private queue: Tick[] = [];
  private totalEnqueued = 0;
  private totalDequeued = 0;

  constructor(private maxCapacity = 10000) {}

  public enqueue(tick: Tick): boolean {
    if (!tick) return false;
    if (this.queue.length >= this.maxCapacity) {
      this.queue.shift(); // Drop oldest if at max capacity
    }
    this.queue.push(tick);
    this.totalEnqueued++;
    return true;
  }

  public dequeue(): Tick | undefined {
    if (this.queue.length === 0) return undefined;
    this.totalDequeued++;
    return this.queue.shift();
  }

  public dequeueBatch(batchSize = 500): Tick[] {
    const batch = this.queue.splice(0, batchSize);
    this.totalDequeued += batch.length;
    return batch;
  }

  public peek(): Tick | undefined {
    return this.queue[0];
  }

  public size(): number {
    return this.queue.length;
  }

  public getMetrics() {
    return {
      currentSize: this.queue.length,
      maxCapacity: this.maxCapacity,
      totalEnqueued: this.totalEnqueued,
      totalDequeued: this.totalDequeued,
      utilizationPct: Number(((this.queue.length / this.maxCapacity) * 100).toFixed(2))
    };
  }
}

/**
 * 3. Stack DSA Structure: Alert history and undo LIFO
 */
export interface AlertEvent {
  id?: string;
  type: string;
  symbol: string;
  price?: number;
  volume?: number;
  timestamp: string;
  message?: string;
}

export class AlertStack {
  private stack: AlertEvent[] = [];
  private redoStack: AlertEvent[] = [];

  constructor(private maxHistory = 1000) {}

  public push(alert: AlertEvent): void {
    if (!alert) return;
    this.stack.push(alert);
    if (this.stack.length > this.maxHistory) {
      this.stack.shift();
    }
    this.redoStack = []; // Clear redo stack on new action
  }

  public pop(): AlertEvent | undefined {
    if (this.stack.length === 0) return undefined;
    const item = this.stack.pop()!;
    this.redoStack.push(item);
    return item;
  }

  public undo(): AlertEvent | undefined {
    return this.pop();
  }

  public redo(): AlertEvent | undefined {
    if (this.redoStack.length === 0) return undefined;
    const item = this.redoStack.pop()!;
    this.stack.push(item);
    return item;
  }

  public getHistory(limit = 20): AlertEvent[] {
    return this.stack.slice(-limit).reverse();
  }

  public size(): number {
    return this.stack.length;
  }
}

/**
 * 4. Min-Heap / Priority Queue DSA Structure: Top-K stocks O(log K)
 */
export interface StockScoreItem {
  symbol: string;
  score: number;
  data: any;
}

export class TopKHeap {
  private heap: StockScoreItem[] = [];
  private symbolMap = new Map<string, StockScoreItem>();

  constructor(public k = 10, private metricKey = 'volume') {}

  public updateStock(symbol: string, data: any): void {
    if (!symbol || !data) return;
    const sym = symbol.toUpperCase().trim();
    const score = Number(data[this.metricKey] || 0);

    const item: StockScoreItem = { symbol: sym, score, data: { ...data, symbol: sym } };
    this.symbolMap.set(sym, item);

    // Rebuild top K
    const allItems = Array.from(this.symbolMap.values());
    allItems.sort((a, b) => b.score - a.score);
    this.heap = allItems.slice(0, this.k);
  }

  public getTopK(): any[] {
    return this.heap.map(item => item.data);
  }

  public size(): number {
    return this.heap.length;
  }
}

/**
 * 5. Graph DSA Structure: Sector relationships (BFS/DFS)
 */
export interface GraphEdge {
  target: string;
  relationship: string;
  weight: number;
}

export class SectorGraph {
  private adj = new Map<string, GraphEdge[]>();
  private nodes = new Map<string, any>();

  public addNode(id: string, metadata: any = {}): void {
    const key = id.toUpperCase().trim();
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { id: key, ...metadata });
      this.adj.set(key, []);
    } else {
      Object.assign(this.nodes.get(key), metadata);
    }
  }

  public addEdge(source: string, target: string, relType = 'CORRELATION', weight = 1.0, bidirectional = true): void {
    const src = source.toUpperCase().trim();
    const tgt = target.toUpperCase().trim();
    this.addNode(src);
    this.addNode(tgt);

    const srcEdges = this.adj.get(src)!;
    if (!srcEdges.some(e => e.target === tgt && e.relationship === relType)) {
      srcEdges.push({ target: tgt, relationship: relType, weight });
    }

    if (bidirectional) {
      const tgtEdges = this.adj.get(tgt)!;
      if (!tgtEdges.some(e => e.target === src && e.relationship === relType)) {
        tgtEdges.push({ target: src, relationship: relType, weight });
      }
    }
  }

  public bfsTraverse(startNode: string, maxDepth = 3): any[] {
    const start = startNode.toUpperCase().trim();
    if (!this.nodes.has(start)) return [];

    const visited = new Set<string>([start]);
    const queue: Array<{ id: string; depth: number }> = [{ id: start, depth: 0 }];
    const result: any[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth > 0) {
        result.push({ ...this.nodes.get(id), degreesOfSeparation: depth });
      }

      if (depth < maxDepth) {
        const edges = this.adj.get(id) || [];
        for (const edge of edges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            queue.push({ id: edge.target, depth: depth + 1 });
          }
        }
      }
    }
    return result;
  }

  public dfsTraverse(startNode: string, targetNode?: string, visited = new Set<string>()): string[] {
    const start = startNode.toUpperCase().trim();
    if (!this.nodes.has(start)) return [];

    visited.add(start);
    const path: string[] = [start];

    if (targetNode && start === targetNode.toUpperCase().trim()) {
      return path;
    }

    const edges = this.adj.get(start) || [];
    for (const edge of edges) {
      if (!visited.has(edge.target)) {
        const subPath = this.dfsTraverse(edge.target, targetNode, visited);
        if (subPath.length > 0) {
          if (targetNode) return [start, ...subPath];
          path.push(...subPath);
        }
      }
    }
    return path;
  }

  public size(): number {
    return this.nodes.size;
  }
}

/**
 * 6. Binary Search DSA Structure: Search sorted historical data O(log N)
 */
export class HistoricalBinarySearch {
  public static findByTimestamp<T extends { timestamp?: string }>(records: T[], targetTimestamp: string): T | null {
    if (!records || records.length === 0 || !targetTimestamp) return null;

    let left = 0;
    let right = records.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midTs = String(records[mid].timestamp || '');

      if (midTs === targetTimestamp) return records[mid];
      if (midTs < targetTimestamp) left = mid + 1;
      else right = mid - 1;
    }
    return null;
  }

  public static findClosestTimestamp<T extends { timestamp?: string }>(records: T[], targetTimestamp: string): T | null {
    if (!records || records.length === 0 || !targetTimestamp) return null;

    let left = 0;
    let right = records.length - 1;
    let closest = records[0];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const current = records[mid];
      const midTs = String(current.timestamp || '');

      closest = current; // Keep tracking closest
      if (midTs === targetTimestamp) return current;
      if (midTs < targetTimestamp) left = mid + 1;
      else right = mid - 1;
    }
    return closest;
  }
}

/**
 * 7. Merge Sort DSA Structure: Sort historical records O(N log N)
 */
export class MergeSortRecords {
  public static sort<T extends Record<string, any>>(records: T[], sortKey = 'timestamp', ascending = true): T[] {
    if (!records || records.length <= 1) return records.slice();

    const mid = Math.floor(records.length / 2);
    const leftHalf = this.sort(records.slice(0, mid), sortKey, ascending);
    const rightHalf = this.sort(records.slice(mid), sortKey, ascending);

    return this.merge(leftHalf, rightHalf, sortKey, ascending);
  }

  private static merge<T extends Record<string, any>>(left: T[], right: T[], sortKey: string, ascending: boolean): T[] {
    const merged: T[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      const valL = left[i][sortKey];
      const valR = right[j][sortKey];

      let cmp: boolean;
      if (typeof valL === 'number' && typeof valR === 'number') {
        cmp = ascending ? valL <= valR : valL >= valR;
      } else {
        const strL = String(valL ?? '');
        const strR = String(valR ?? '');
        cmp = ascending ? strL <= strR : strL >= strR;
      }

      if (cmp) {
        merged.push(left[i++]);
      } else {
        merged.push(right[j++]);
      }
    }

    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);

    return merged;
  }
}

/**
 * 8. LRU Cache DSA Structure: Cache recent searches O(1)
 */
export class LRUCacheService<V = any> {
  private cache = new Map<string, V>();
  private hits = 0;
  private misses = 0;

  constructor(private capacity = 500) {}

  public get(key: string): V | undefined {
    if (!key) return undefined;
    const k = key.trim().toLowerCase();
    if (this.cache.has(k)) {
      const val = this.cache.get(k)!;
      // Refresh LRU order by deleting and re-setting
      this.cache.delete(k);
      this.cache.set(k, val);
      this.hits++;
      return val;
    }
    this.misses++;
    return undefined;
  }

  public put(key: string, value: V): void {
    if (!key) return;
    const k = key.trim().toLowerCase();
    if (this.cache.has(k)) {
      this.cache.delete(k);
    }
    this.cache.set(k, value);
    if (this.cache.size > this.capacity) {
      // Evict least recently used (first inserted item in ES6 Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  public contains(key: string): boolean {
    if (!key) return false;
    return this.cache.has(key.trim().toLowerCase());
  }

  public remove(key: string): boolean {
    if (!key) return false;
    return this.cache.delete(key.trim().toLowerCase());
  }

  public size(): number {
    return this.cache.size;
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getMetrics() {
    const total = this.hits + this.misses;
    return {
      capacity: this.capacity,
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatePct: total > 0 ? Number(((this.hits / total) * 100).toFixed(2)) : 0,
      utilizationPct: Number(((this.cache.size / this.capacity) * 100).toFixed(2))
    };
  }
}
