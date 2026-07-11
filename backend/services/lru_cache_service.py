from collections import OrderedDict
import threading
from typing import Any, Dict, List, Optional, Tuple


class LRUCacheService:
    """
    LRU Cache DSA Structure: Cache recent searches.
    A thread-safe Least Recently Used (LRU) cache providing O(1) average time complexity
    for caching recent stock queries, historical chart aggregations, and search results.
    Automatically evicts the oldest unaccessed queries when capacity is reached.
    """

    def __init__(self, capacity: int = 500):
        self.capacity = max(1, capacity)
        self._cache: OrderedDict[str, Any] = OrderedDict()
        self._lock = threading.RLock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a cached search result in O(1) time.
        Moves the accessed key to the most recently used position (rear of OrderedDict).
        """
        if not key:
            return None
        k = key.strip().lower()
        with self._lock:
            if k in self._cache:
                # Move to end (mark as most recently used)
                self._cache.move_to_end(k)
                self._hits += 1
                return self._cache[k]
            self._misses += 1
            return None

    def put(self, key: str, value: Any) -> None:
        """
        Insert or update a search result in O(1) time.
        If cache size exceeds capacity, evicts the least recently used item (front of OrderedDict).
        """
        if not key:
            return
        k = key.strip().lower()
        with self._lock:
            if k in self._cache:
                self._cache.move_to_end(k)
            self._cache[k] = value
            if len(self._cache) > self.capacity:
                # Pop the first item (least recently used)
                self._cache.popitem(last=False)

    def contains(self, key: str) -> bool:
        """Check if a search query is currently cached in O(1) time."""
        if not key:
            return False
        with self._lock:
            return key.strip().lower() in self._cache

    def remove(self, key: str) -> bool:
        """Remove a cached search entry."""
        if not key:
            return False
        k = key.strip().lower()
        with self._lock:
            if k in self._cache:
                del self._cache[k]
                return True
            return False

    def get_most_recent_searches(self, limit: int = 20) -> List[Tuple[str, Any]]:
        """Return the most recently accessed search queries and their cached results."""
        with self._lock:
            items = list(self._cache.items())
            return items[-limit:][::-1]

    def size(self) -> int:
        """Return the current number of cached search entries."""
        with self._lock:
            return len(self._cache)

    def clear(self) -> None:
        """Clear all entries and reset cache statistics."""
        with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0

    def get_metrics(self) -> Dict[str, Any]:
        """Return telemetry metrics including hit rate and utilization."""
        with self._lock:
            total = self._hits + self._misses
            hit_rate = round((self._hits / total) * 100, 2) if total > 0 else 0.0
            return {
                "capacity": self.capacity,
                "size": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate_pct": hit_rate,
                "utilization_pct": round((len(self._cache) / self.capacity) * 100, 2) if self.capacity > 0 else 0.0
            }
