"""TopKHeap — Min-heap for top-K stocks by volume or gain."""

import heapq


class TopKHeap:
    def __init__(self, k=5):
        self.k = k
        self.heap = []

    def push(self, stock_symbol, metric_value):
        """Add stock with metric value. O(log n). Maintains min-heap of top-K."""
        if len(self.heap) < self.k:
            heapq.heappush(self.heap, (metric_value, stock_symbol))
        elif metric_value > self.heap[0][0]:
            heapq.heapreplace(self.heap, (metric_value, stock_symbol))

    def top_k(self):
        """Return top-K items sorted descending by value. O(k log k)."""
        sorted_heap = sorted(self.heap, reverse=True)
        return sorted_heap

    def heapify_all(self, items):
        """Build heap from list of (metric, symbol) tuples. O(n). Keep only top-K."""
        self.heap = []
        for metric, symbol in items:
            self.push(symbol, metric)

    def size(self):
        """Return current heap size. O(1)."""
        return len(self.heap)

    def get_all(self):
        """Return all items in heap (not necessarily sorted). O(n)."""
        return list(self.heap)

    def peek_min(self):
        """Return min value (root) without removing. O(1)."""
        return self.heap[0] if self.heap else None
