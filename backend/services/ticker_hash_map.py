import threading
from typing import Any, Dict, List, Optional


class TickerHashMap:
    """
    HashMap DSA Structure: Fast ticker lookup.
    Provides O(1) average time complexity for storing, indexing, and querying
    stock metadata, real-time price quotes, and symbol references.
    """

    def __init__(self):
        # Internal hash table mapping ticker symbols to stock data dictionaries
        self._table: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()

    def put(self, symbol: str, data: Dict[str, Any]) -> None:
        """Insert or update stock information in O(1) time."""
        if not symbol:
            return
        key = symbol.upper().strip()
        with self._lock:
            if key in self._table:
                # Merge with existing record
                self._table[key].update(data)
            else:
                self._table[key] = dict(data)
                self._table[key]["symbol"] = key

    def get(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Retrieve stock data by symbol in O(1) time."""
        if not symbol:
            return None
        with self._lock:
            return self._table.get(symbol.upper().strip(), None)

    def contains(self, symbol: str) -> bool:
        """Check if a ticker exists in the HashMap in O(1) time."""
        if not symbol:
            return False
        with self._lock:
            return symbol.upper().strip() in self._table

    def remove(self, symbol: str) -> bool:
        """Delete a ticker record from the HashMap in O(1) time."""
        if not symbol:
            return False
        key = symbol.upper().strip()
        with self._lock:
            if key in self._table:
                del self._table[key]
                return True
            return False

    def get_all_symbols(self) -> List[str]:
        """Return a list of all indexed ticker symbols."""
        with self._lock:
            return sorted(list(self._table.keys()))

    def get_all_records(self) -> Dict[str, Dict[str, Any]]:
        """Return a deep copy of all hash map entries."""
        with self._lock:
            return {k: dict(v) for k, v in self._table.items()}

    def size(self) -> int:
        """Return the number of stored tickers."""
        with self._lock:
            return len(self._table)

    def clear(self) -> None:
        """Clear all entries in the HashMap."""
        with self._lock:
            self._table.clear()
