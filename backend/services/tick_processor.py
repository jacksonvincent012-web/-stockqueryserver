from collections import deque
from typing import Any, Dict, List, Optional, Union
import threading

try:
    from .ohlc_aggregator import OHLCAggregator
    from .storage_manager import StorageManager
    from .archive_manager import ArchiveManager
    from .ticker_hash_map import TickerHashMap
    from .tick_queue import TickQueue
    from .alert_stack import AlertStack
    from .top_k_heap import TopKHeap
    from .sector_graph import SectorGraph
    from .historical_binary_search import HistoricalBinarySearch
    from .merge_sort_records import MergeSortRecords
    from .lru_cache_service import LRUCacheService
except ImportError:
    from services.ohlc_aggregator import OHLCAggregator
    from services.storage_manager import StorageManager
    from services.archive_manager import ArchiveManager
    from services.ticker_hash_map import TickerHashMap
    from services.tick_queue import TickQueue
    from services.alert_stack import AlertStack
    from services.top_k_heap import TopKHeap
    from services.sector_graph import SectorGraph
    from services.historical_binary_search import HistoricalBinarySearch
    from services.merge_sort_records import MergeSortRecords
    from services.lru_cache_service import LRUCacheService


class TickProcessor:
    """
    Core ingestion engine for real-time market ticks.
    Orchestrates hot memory buffering, live OHLC candlestick calculation, SQLite persistence,
    and all 8 core Data Structure Architectures (DSA) required for high-performance financial computation:
    1. HashMap: Fast ticker lookup
    2. Queue: Buffer incoming ticks
    3. Stack: Alert history and undo
    4. Min-Heap: Top-K stocks
    5. Graph: Sector relationships (BFS/DFS)
    6. Binary Search: Search sorted historical data
    7. Merge Sort: Sort historical records
    8. LRU Cache: Cache recent searches
    """

    def __init__(self, storage: Optional[StorageManager] = None, aggregator: Optional[OHLCAggregator] = None):
        self.hot_buffer = deque(maxlen=5000)
        self.aggregator = aggregator or OHLCAggregator()
        self.storage = storage or StorageManager()
        self.archive_manager = ArchiveManager(self.storage)
        
        # Initialize all 8 Core DSA Structures
        self.ticker_map = TickerHashMap()          # 1. HashMap: Fast ticker lookup
        self.ingestion_queue = TickQueue(10000)    # 2. Queue: Buffer incoming ticks
        self.alert_stack = AlertStack(1000)        # 3. Stack: Alert history and undo
        self.top_k_heap = TopKHeap(k=10, metric_key="volume")  # 4. Min-Heap: Top-K stocks
        self.sector_graph = SectorGraph()          # 5. Graph: Sector relationships (BFS/DFS)
        self.binary_search = HistoricalBinarySearch()  # 6. Binary Search: Search sorted historical data
        self.record_sorter = MergeSortRecords()    # 7. Merge Sort: Sort historical records
        self.query_cache = LRUCacheService(500)    # 8. LRU Cache: Cache recent searches
        
        self.lock = threading.Lock()
        self._tick_counter = 0
        self._init_default_graph()

    def _init_default_graph(self) -> None:
        """Seed initial sector hierarchy and relationships in the Graph DSA."""
        sectors = {
            "Technology Sector": ["AAPL", "MSFT", "NVDA"],
            "Consumer Discretionary": ["TSLA", "AMZN"],
            "Communication Services": ["GOOGL", "META"],
            "Financials & Banking": ["BRK.A", "JPM", "V"],
            "Healthcare Sector": ["JNJ", "UNH"],
            "Energy Sector": ["XOM", "CVX"]
        }
        for sector, stocks in sectors.items():
            self.sector_graph.add_node(sector, {"type": "Sector", "name": sector})
            for sym in stocks:
                self.sector_graph.add_node(sym, {"type": "Stock", "symbol": sym})
                self.sector_graph.add_edge(sector, sym, rel_type="SECTOR_MEMBERSHIP")
                self.ticker_map.put(sym, {"symbol": sym, "sector": sector})

    def process_tick(self, tick: Union[Dict[str, Any], Any]) -> Dict[str, Any]:
        """
        Process an incoming tick through the complete ingestion line:
        1. Enqueue in FIFO queue buffer
        2. Store in hot memory deque
        3. Index in HashMap and update Top-K Heap
        4. Update live OHLC candlestick
        5. Persist to SQL database and invalidate relevant LRU cache entries
        """
        if isinstance(tick, dict):
            tick_dict = tick
        else:
            tick_dict = getattr(tick, "__dict__", {})

        symbol = str(tick_dict.get("symbol", "")).upper()
        price = float(tick_dict.get("price", 0.0))
        volume = float(tick_dict.get("volume", 0.0))

        # 1. Queue: Buffer incoming ticks
        self.ingestion_queue.enqueue(tick_dict)

        with self.lock:
            # Pop from ingestion queue into hot memory
            dequeued = self.ingestion_queue.dequeue() or tick_dict
            self.hot_buffer.append(dequeued)
            self._tick_counter += 1

        # 2. HashMap: Fast ticker lookup update
        self.ticker_map.put(symbol, {"price": price, "volume": volume, "last_updated": tick_dict.get("timestamp")})

        # 3. Min-Heap: Top-K stocks ranking update
        self.top_k_heap.update_stock(symbol, {"symbol": symbol, "price": price, "volume": volume})

        # 4. Stack: Check threshold rules for alerts (e.g. high volume spike)
        if volume > 100000:
            self.alert_stack.push({
                "type": "VOLUME_SPIKE",
                "symbol": symbol,
                "volume": volume,
                "price": price,
                "timestamp": tick_dict.get("timestamp")
            })

        # 5. Update OHLC candle
        updated_candle = self.aggregator.update(tick_dict)

        # 6. Persist tick to SQL database
        self.storage.store_tick(tick_dict)

        # 7. Invalidate stale LRU cache for this symbol
        self.query_cache.remove(f"history_{symbol}")
        self.query_cache.remove(f"recent_{symbol}")

        # Archive if necessary
        if self._tick_counter % 500 == 0:
            self.storage.archive_old_ticks()

        return updated_candle

    def process_batch(self, ticks: List[Union[Dict[str, Any], Any]]) -> List[Dict[str, Any]]:
        """High-throughput batch processing utilizing Queue buffering and batch DB insertion."""
        if not ticks:
            return []

        updated_candles = []
        for t in ticks:
            if isinstance(t, dict):
                self.ingestion_queue.enqueue(t)
            else:
                self.ingestion_queue.enqueue(getattr(t, "__dict__", {}))

        batch_to_process = self.ingestion_queue.dequeue_batch(len(ticks))
        with self.lock:
            for t in batch_to_process:
                self.hot_buffer.append(t)
                self._tick_counter += 1
                symbol = str(t.get("symbol", "")).upper()
                self.ticker_map.put(symbol, {"price": t.get("price"), "volume": t.get("volume")})
                self.top_k_heap.update_stock(symbol, {"symbol": symbol, "volume": t.get("volume", 0)})
                updated_candles.append(self.aggregator.update(t))

        self.storage.store_ticks_batch(batch_to_process)

        if self._tick_counter % 500 == 0:
            self.storage.archive_old_ticks()

        return updated_candles

    def get_sorted_history(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve historical ticks, leveraging LRU Cache and Merge Sort DSA
        to ensure records are precisely ordered by timestamp.
        """
        cache_key = f"sorted_history_{symbol.upper()}_{limit}"
        cached = self.query_cache.get(cache_key)
        if cached is not None:
            return cached

        raw_ticks = self.storage.get_recent_ticks(symbol.upper(), limit=limit)
        # 7. Merge Sort: Sort historical records by timestamp
        sorted_ticks = self.record_sorter.sort(raw_ticks, sort_key="timestamp", ascending=True)
        self.query_cache.put(cache_key, sorted_ticks)
        return sorted_ticks

    def search_historical_timestamp(self, symbol: str, target_timestamp: str) -> Optional[Dict[str, Any]]:
        """
        Use Binary Search DSA to locate a historical tick by exact or closest timestamp.
        """
        sorted_history = self.get_sorted_history(symbol, limit=1000)
        # 6. Binary Search: Search sorted historical data
        return self.binary_search.find_closest_timestamp(sorted_history, target_timestamp)

    def get_hot_buffer(self) -> List[Any]:
        """Return snapshot of the latest ticks currently sitting in hot memory."""
        with self.lock:
            return list(self.hot_buffer)

    def get_current_candle(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get the live OHLC candlestick for a specific ticker symbol."""
        return self.aggregator.get_candle(symbol)

    def close(self) -> None:
        """Safely shutdown resources and database connections."""
        self.storage.close()
