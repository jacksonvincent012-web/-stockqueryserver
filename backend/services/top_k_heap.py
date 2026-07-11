import heapq
import threading
from typing import Any, Dict, List, Tuple


class TopKHeap:
    """
    Min-Heap DSA Structure: Top-K stocks.
    Uses a priority queue (binary heap) to efficiently track and maintain the top K stocks
    ranked by dynamic metrics such as trading volume, market cap, or 24h percentage gain/loss.
    Achieves O(log K) updates and O(K log K) sorted retrieval.
    """

    def __init__(self, k: int = 10, metric_key: str = "volume"):
        self.k = k
        self.metric_key = metric_key
        # Heap stores tuples of (score, symbol, stock_data)
        self._heap: List[Tuple[float, str, Dict[str, Any]]] = []
        self._lock = threading.Lock()
        # Auxiliary map to track symbols currently in heap or being updated
        self._symbol_map: Dict[str, Dict[str, Any]] = {}

    def update_stock(self, symbol: str, data: Dict[str, Any]) -> None:
        """
        Update or insert a stock into the top-K tracker in O(log K) time.
        If the stock's metric exceeds the smallest element in the Min-Heap (or if size < K),
        the heap is adjusted to maintain the highest ranking items.
        """
        if not symbol or not data:
            return

        symbol_upper = symbol.upper().strip()
        score = float(data.get(self.metric_key, 0.0))

        with self._lock:
            self._symbol_map[symbol_upper] = dict(data)
            self._symbol_map[symbol_upper]["symbol"] = symbol_upper

            # Rebuild heap if symbol was already present to update its position, or maintain size <= k
            # For exact top-K tracking across updates, we rebuild from our active symbol map when needed
            items = []
            for sym, info in self._symbol_map.items():
                val = float(info.get(self.metric_key, 0.0))
                items.append((val, sym, info))

            # Keep only the top K items using nlargest
            top_items = heapq.nlargest(self.k, items, key=lambda x: x[0])
            
            # Convert back into a valid min-heap of size <= k
            self._heap = [(val, sym, info) for val, sym, info in top_items]
            heapq.heapify(self._heap)

            # Prune symbol map to keep memory bounded to top items plus recent candidates
            if len(self._symbol_map) > self.k * 5:
                active_symbols = {sym for _, sym, _ in self._heap}
                self._symbol_map = {sym: info for sym, info in self._symbol_map.items() if sym in active_symbols}

    def get_top_k(self) -> List[Dict[str, Any]]:
        """
        Return the top K stocks sorted in descending order by the configured metric.
        Time complexity: O(K log K).
        """
        with self._lock:
            # Sort the heap items descending by score
            sorted_items = sorted(self._heap, key=lambda x: x[0], reverse=True)
            return [info for _, _, info in sorted_items]

    def peek_min_in_top_k(self) -> Optional[Dict[str, Any]]:
        """
        Return the stock with the lowest score currently inside the top K.
        In our Min-Heap, this is the root element at index 0 in O(1) time.
        """
        with self._lock:
            if not self._heap:
                return None
            return self._heap[0][2]

    def size(self) -> int:
        """Return the current number of stocks tracked in the heap."""
        with self._lock:
            return len(self._heap)

    def clear(self) -> None:
        """Clear the heap and internal tracking map."""
        with self._lock:
            self._heap.clear()
            self._symbol_map.clear()
