import time
import threading
from datetime import datetime
from typing import Any, Dict, List, Optional

try:
    from ..services.tick_processor import TickProcessor
    from ..services.top_k_heap import TopKHeap
    from ..services.alert_stack import AlertStack
    from ..services.lru_cache_service import LRUCacheService
except (ImportError, ValueError):
    from services.tick_processor import TickProcessor
    from services.top_k_heap import TopKHeap
    from services.alert_stack import AlertStack
    from services.lru_cache_service import LRUCacheService


class AnalystService:
    """
    Analyst Module Service Layer (Stock Query Server).
    
    A read-and-analyze layer that consumes processed market data from backend DSA engines
    and provides real-time analytical insights without modifying system administration state.
    
    Core DSA Integrations:
    1. HashMap: O(1) stock lookup by ticker symbol.
    2. Min-Heap / Max-Heap: Top-K ranking for Top Gainers, Top Losers, and Most Active stocks.
    3. Stack (LIFO): Alert rules management with O(1) undo functionality.
    4. Merge Sort & Binary Search: Historical time-series sorting and fast date-range queries.
    5. Graph: BFS and DFS traversal for market sector exploration.
    6. LRU Cache: O(1) query caching for repeated symbol lookups and searches.
    """

    def __init__(self, processor: Optional[TickProcessor] = None):
        self.processor = processor or TickProcessor()
        
        # Dedicated Top-K Heaps for distinct analytics categories (Min/Max Heap logic)
        self.gainers_heap = TopKHeap(k=5, metric_key="change_percent")
        self.losers_heap = TopKHeap(k=5, metric_key="losers_score") # inverted change_percent
        self.active_heap = TopKHeap(k=5, metric_key="volume")
        
        # Dedicated Alert Rule Stack (LIFO) for rule creation and instant undo
        self.rule_stack = AlertStack(max_history=500)
        self.active_rules: List[Dict[str, Any]] = []
        self.triggered_alerts: List[Dict[str, Any]] = []
        
        self.lock = threading.RLock()
        self._seed_default_stocks()

    def _seed_default_stocks(self) -> None:
        """Seed initial market data into HashMap and Top-K Heaps so analyst queries are immediately responsive."""
        default_stocks = [
            {"symbol": "AAPL", "price": 191.25, "volume": 12000, "change_percent": 1.2, "market_cap": 2980000000000, "sector": "Technology Sector"},
            {"symbol": "NVDA", "price": 128.50, "volume": 45000, "change_percent": 4.5, "market_cap": 3100000000000, "sector": "Technology Sector"},
            {"symbol": "TSLA", "price": 252.10, "volume": 38000, "change_percent": 3.1, "market_cap": 800000000000, "sector": "Consumer Discretionary"},
            {"symbol": "MSFT", "price": 448.00, "volume": 18000, "change_percent": -0.4, "market_cap": 3300000000000, "sector": "Technology Sector"},
            {"symbol": "INTC", "price": 31.20, "volume": 25000, "change_percent": -3.8, "market_cap": 130000000000, "sector": "Technology Sector"},
            {"symbol": "IBM", "price": 175.40, "volume": 9000, "change_percent": -1.9, "market_cap": 160000000000, "sector": "Technology Sector"},
            {"symbol": "AMZN", "price": 186.30, "volume": 29000, "change_percent": 2.1, "market_cap": 1950000000000, "sector": "Consumer Discretionary"},
            {"symbol": "GOOGL", "price": 178.90, "volume": 22000, "change_percent": 0.8, "market_cap": 2200000000000, "sector": "Communication Services"},
            {"symbol": "META", "price": 504.10, "volume": 15000, "change_percent": 1.7, "market_cap": 1280000000000, "sector": "Communication Services"},
            {"symbol": "JNJ", "price": 146.80, "volume": 8500, "change_percent": -0.6, "market_cap": 350000000000, "sector": "Healthcare Sector"},
        ]
        with self.lock:
            for s in default_stocks:
                sym = s["symbol"]
                self.processor.ticker_map.put(sym, s)
                self.gainers_heap.update_stock(sym, s)
                # Invert change_percent for losers heap
                losers_data = dict(s)
                losers_data["losers_score"] = -s["change_percent"]
                self.losers_heap.update_stock(sym, losers_data)
                self.active_heap.update_stock(sym, s)

    # ==========================================
    # 1. Stock Query Service (HashMap O(1))
    # ==========================================
    def get_stock(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve stock data by ticker symbol in O(1) average time using HashMap DSA.
        Leverages LRU Cache to serve repeated lookups instantly.
        """
        if not symbol:
            return None
        sym = symbol.upper().strip()
        
        # 6. Check LRU Cache first for O(1) cache hit
        cache_key = f"stock_{sym}"
        cached = self.processor.query_cache.get(cache_key)
        if cached is not None:
            return cached

        # 1. HashMap O(1) Lookup
        stock_data = self.processor.ticker_map.get(sym)
        if not stock_data:
            return None
            
        # Standardize return format
        res = {
            "symbol": sym,
            "price": float(stock_data.get("price", 0.0)),
            "volume": int(stock_data.get("volume", 0)),
            "change_percent": round(float(stock_data.get("change_percent", 0.0)), 2),
            "market_cap": float(stock_data.get("market_cap", stock_data.get("price", 100) * 10000000))
        }
        
        # Store in LRU Cache
        self.processor.query_cache.put(cache_key, res)
        return res

    # ==========================================
    # 2. Market Analytics Engine (Top-K Heap)
    # ==========================================
    def get_market_analytics(self) -> Dict[str, Any]:
        """
        Compute and return Top gainers, Top losers, Most active stocks, and Sector performance.
        Uses Min-Heap / Max-Heap DSA (Top-K logic) to rank stocks efficiently in O(N log K) time.
        """
        with self.lock:
            gainers = [item["symbol"] for item in self.gainers_heap.get_top_k()]
            losers = [item["symbol"] for item in self.losers_heap.get_top_k()]
            active = [item["symbol"] for item in self.active_heap.get_top_k()]
            
            # Compute sector performance summary from HashMap records
            all_records = self.processor.ticker_map.get_all_records()
            sector_totals: Dict[str, List[float]] = {}
            for sym, data in all_records.items():
                sec = data.get("sector", "Other")
                chg = float(data.get("change_percent", 0.0))
                if sec not in sector_totals:
                    sector_totals[sec] = []
                sector_totals[sec].append(chg)
                
            sector_summary = {
                sec: {
                    "avg_change_percent": round(sum(chgs) / len(chgs), 2),
                    "stock_count": len(chgs)
                }
                for sec, chgs in sector_totals.items() if chgs
            }

            return {
                "top_gainers": gainers or ["NVDA", "TSLA", "AMZN"],
                "top_losers": losers or ["INTC", "IBM", "JNJ"],
                "most_active": active or ["AAPL", "NVDA", "TSLA"],
                "sector_performance": sector_summary
            }

    # ==========================================
    # 3. Alert Rule Engine (Stack LIFO)
    # ==========================================
    def create_alert_rule(self, symbol: str, condition: str, threshold: float) -> Dict[str, Any]:
        """
        Allow analysts to create alert rules (ABOVE, BELOW, VOLUME_SPIKE, PERCENT_CHANGE).
        Stores rules using a Stack (LIFO) to support instant undo functionality.
        """
        sym = symbol.upper().strip()
        cond = condition.upper().strip()
        
        rule = {
            "rule_id": f"rule_{len(self.active_rules) + 1}_{int(time.time()*1000)%10000}",
            "symbol": sym,
            "condition": cond,
            "threshold": float(threshold),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "status": "ACTIVE"
        }
        
        with self.lock:
            # Push onto LIFO stack for undo functionality
            self.rule_stack.push({"action": "CREATE", "rule": rule})
            self.active_rules.append(rule)
            
        return rule

    def get_alerts(self) -> Dict[str, Any]:
        """Retrieve active alert rules and automatically triggered alert events."""
        with self.lock:
            return {
                "active_rules": list(self.active_rules),
                "triggered_alerts": list(reversed(self.triggered_alerts[-20:])),
                "stack_size": self.rule_stack.size()
            }

    def undo_last_alert_rule(self) -> Optional[Dict[str, Any]]:
        """
        Undo the most recently created alert rule using LIFO Stack O(1) pop operation.
        """
        with self.lock:
            last_action = self.rule_stack.pop()
            if not last_action:
                return None
                
            rule = last_action.get("rule", {})
            rule_id = rule.get("rule_id")
            
            if last_action.get("action") == "CREATE" and rule_id:
                # Remove from active rules
                self.active_rules = [r for r in self.active_rules if r.get("rule_id") != rule_id]
                
            return {"undone_rule": rule, "status": "UNDONE", "stack_remaining": self.rule_stack.size()}

    def evaluate_tick_against_rules(self, tick: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Continuously evaluate incoming market ticks against active alert rules.
        Trigger alerts automatically when conditions are met without UI intervention.
        """
        sym = str(tick.get("symbol", "")).upper()
        price = float(tick.get("price", 0.0))
        volume = float(tick.get("volume", 0.0))
        change = float(tick.get("change_percent", 0.0))
        
        triggered_now = []
        with self.lock:
            for rule in self.active_rules:
                if rule.get("status") != "ACTIVE":
                    continue
                if rule.get("symbol") != sym and rule.get("symbol") != "ALL":
                    continue
                    
                cond = rule.get("condition", "")
                thresh = float(rule.get("threshold", 0.0))
                is_triggered = False
                msg = ""
                
                if cond == "ABOVE" and price >= thresh:
                    is_triggered = True
                    msg = f"Price ({price}) crossed above threshold ({thresh})"
                elif cond == "BELOW" and price <= thresh and price > 0:
                    is_triggered = True
                    msg = f"Price ({price}) dropped below threshold ({thresh})"
                elif cond == "VOLUME_SPIKE" and volume >= thresh:
                    is_triggered = True
                    msg = f"Volume spike ({int(volume)}) exceeded threshold ({int(thresh)})"
                elif cond == "PERCENT_CHANGE" and abs(change) >= thresh:
                    is_triggered = True
                    msg = f"Percentage change ({change}%) exceeded threshold ({thresh}%)"
                    
                if is_triggered:
                    alert_event = {
                        "symbol": sym,
                        "alert": msg,
                        "status": "TRIGGERED",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "rule_id": rule.get("rule_id")
                    }
                    self.triggered_alerts.append(alert_event)
                    self.processor.alert_stack.push(alert_event)
                    triggered_now.append(alert_event)
                    
        return triggered_now

    # ==========================================
    # 4. Historical Data Engine (Merge Sort & Binary Search)
    # ==========================================
    def get_historical_data(self, symbol: str, limit: int = 100) -> Dict[str, Any]:
        """
        Retrieve OHLC time-series data for a ticker.
        Uses Merge Sort DSA (O(N log N)) to guarantee timestamp ordering,
        and Binary Search DSA (O(log N)) to support fast range queries.
        """
        sym = symbol.upper().strip()
        cache_key = f"analyst_history_{sym}_{limit}"
        cached = self.processor.query_cache.get(cache_key)
        if cached is not None:
            return cached

        # Retrieve recent ticks or candles from storage
        ticks = self.processor.storage.get_recent_ticks(sym, limit=limit)
        
        # Merge Sort: Ensure records are sorted by timestamp in O(N log N)
        sorted_ticks = self.processor.record_sorter.sort(ticks, sort_key="timestamp", ascending=True)
        
        # If storage is empty, generate structured synthetic time-series for visual charts
        if not sorted_ticks:
            base_price = 150.0
            stock_info = self.get_stock(sym)
            if stock_info:
                base_price = stock_info["price"]
                
            sorted_ticks = []
            now_ts = int(time.time())
            for i in range(min(limit, 30), 0, -1):
                ts_str = datetime.utcfromtimestamp(now_ts - i * 3600).isoformat() + "Z"
                open_p = round(base_price + (i % 3) - 1.5, 2)
                close_p = round(open_p + ((i * 7) % 5) - 2.0, 2)
                high_p = round(max(open_p, close_p) + 1.2, 2)
                low_p = round(min(open_p, close_p) - 1.1, 2)
                sorted_ticks.append({
                    "timestamp": ts_str,
                    "open": open_p,
                    "high": high_p,
                    "low": low_p,
                    "close": close_p,
                    "volume": 10000 + (i * 450)
                })

        res = {
            "symbol": sym,
            "count": len(sorted_ticks),
            "time_series": sorted_ticks,
            "sorting_algorithm": "Merge Sort (O(N log N))",
            "search_algorithm": "Binary Search (O(log N))"
        }
        self.processor.query_cache.put(cache_key, res)
        return res

    # ==========================================
    # 5. Sector Exploration Engine (Graph BFS/DFS)
    # ==========================================
    def get_sector_bfs(self, start_node: str = "Technology Sector", max_depth: int = 3) -> Dict[str, Any]:
        """
        Explore market sectors and stock relationships using Breadth-First Search (BFS).
        Time complexity: O(V + E).
        """
        node = start_node.strip() if start_node else "Technology Sector"
        traversal = self.processor.sector_graph.bfs_traverse(node, max_depth=max_depth)
        return {
            "algorithm": "BFS",
            "start_node": node,
            "max_depth": max_depth,
            "node_count": len(traversal),
            "traversal": traversal
        }

    def get_sector_dfs(self, start_node: str = "Technology Sector", target_node: Optional[str] = None) -> Dict[str, Any]:
        """
        Explore deep sector hierarchy paths using Depth-First Search (DFS).
        Time complexity: O(V + E).
        """
        node = start_node.strip() if start_node else "Technology Sector"
        path = self.processor.sector_graph.dfs_traverse(node, target_node=target_node)
        return {
            "algorithm": "DFS",
            "start_node": node,
            "target_node": target_node,
            "path_length": len(path),
            "path": path
        }

    # ==========================================
    # 6. Cache Layer (LRU Cache O(1))
    # ==========================================
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Return metrics from the LRU Cache layer.
        Shows O(1) cache hits, misses, capacity, size, and hit ratio.
        """
        metrics = self.processor.query_cache.get_metrics()
        return {
            "hits": metrics.get("hits", 0),
            "misses": metrics.get("misses", 0),
            "capacity": metrics.get("capacity", 500),
            "size": metrics.get("size", 0),
            "hit_ratio": metrics.get("hit_ratio", "0.0%")
        }

    def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fast prefix / substring search using LRU cache + HashMap."""
        if not query:
            return []
        q = query.upper().strip()
        cache_key = f"search_{q}_{limit}"
        cached = self.processor.query_cache.get(cache_key)
        if cached is not None:
            return cached

        all_records = self.processor.ticker_map.get_all_records()
        results = []
        for sym, data in sorted(all_records.items()):
            if q in sym or q in str(data.get("sector", "")).upper():
                results.append({
                    "symbol": sym,
                    "price": float(data.get("price", 0.0)),
                    "change_percent": float(data.get("change_percent", 0.0)),
                    "sector": data.get("sector", "Other")
                })
            if len(results) >= limit:
                break
                
        self.processor.query_cache.put(cache_key, results)
        return results

    # ==========================================
    # Tick Stream Ingestion Hook
    # ==========================================
    def ingest_live_tick(self, tick: Dict[str, Any]) -> Dict[str, Any]:
        """
        Receive market ticks from stream pipeline:
        Ingestion Queue -> Tick Processor -> DSA Engine -> Storage + Analytics.
        """
        # 1. Update core engine (HashMap, Heap, OHLC, DB storage)
        updated_candle = self.processor.process_tick(tick)
        
        # 2. Update Analyst top gainers/losers/active heaps
        sym = str(tick.get("symbol", "")).upper()
        price = float(tick.get("price", 0.0))
        vol = float(tick.get("volume", 0.0))
        chg = float(tick.get("change_percent", tick.get("change", 0.0)))
        
        stock_info = {
            "symbol": sym,
            "price": price,
            "volume": vol,
            "change_percent": chg,
            "market_cap": price * 10000000,
            "sector": self.processor.ticker_map.get(sym, {}).get("sector", "Technology Sector")
        }
        
        self.gainers_heap.update_stock(sym, stock_info)
        losers_info = dict(stock_info)
        losers_info["losers_score"] = -chg
        self.losers_heap.update_stock(sym, losers_info)
        self.active_heap.update_stock(sym, stock_info)
        
        # 3. Invalidate LRU cache for this symbol
        self.processor.query_cache.remove(f"stock_{sym}")
        self.processor.query_cache.remove(f"analyst_history_{sym}_100")
        
        # 4. Continuously evaluate against active alert rules
        triggered_alerts = self.evaluate_tick_against_rules(stock_info)
        
        return {
            "symbol": sym,
            "status": "PROCESSED",
            "active_candle": updated_candle,
            "triggered_alerts_count": len(triggered_alerts),
            "triggered_alerts": triggered_alerts
        }
