from datetime import datetime
from typing import Any, Dict, Optional, Union
import threading


class OHLCAggregator:
    """
    Real-time candlestick aggregator that computes Open, High, Low, Close, and Volume (OHLCV)
    from incoming market ticks. Maintains in-memory thread-safe state per symbol.
    """

    def __init__(self):
        self.current: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()

    def _get_val(self, item: Union[Dict[str, Any], Any], key: str, default: Any = None) -> Any:
        if isinstance(item, dict):
            return item.get(key, default)
        return getattr(item, key, default)

    def update(self, tick: Union[Dict[str, Any], Any]) -> Dict[str, Any]:
        """
        Ingest a new tick and update the active OHLC candlestick for the symbol.
        Returns the updated candlestick dictionary.
        """
        symbol = str(self._get_val(tick, "symbol")).upper()
        price = float(self._get_val(tick, "price"))
        volume = int(self._get_val(tick, "volume"))
        timestamp = str(self._get_val(tick, "timestamp") or datetime.utcnow().isoformat())

        with self.lock:
            if symbol not in self.current:
                self.current[symbol] = {
                    "symbol": symbol,
                    "open": price,
                    "high": price,
                    "low": price,
                    "close": price,
                    "volume": volume,
                    "timestamp": timestamp,
                    "trades_count": 1
                }
                return self.current[symbol]

            candle = self.current[symbol]
            candle["high"] = max(candle["high"], price)
            candle["low"] = min(candle["low"], price)
            candle["close"] = price
            candle["volume"] += volume
            candle["timestamp"] = timestamp
            candle["trades_count"] = candle.get("trades_count", 0) + 1

            return candle

    def get_candle(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Retrieve the current in-memory candle for a symbol."""
        with self.lock:
            return self.current.get(symbol.upper(), None)

    def get_all_candles(self) -> Dict[str, Dict[str, Any]]:
        """Retrieve all active in-memory candles across all tickers."""
        with self.lock:
            return dict(self.current)

    def reset_candle(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Flush and reset the candle for a given symbol (e.g., when a 1-minute interval closes).
        Returns the closed candle before reset.
        """
        with self.lock:
            if symbol.upper() in self.current:
                closed_candle = dict(self.current[symbol.upper()])
                del self.current[symbol.upper()]
                return closed_candle
            return None

    def reset_all(self) -> Dict[str, Dict[str, Any]]:
        """Flush and clear all active candles."""
        with self.lock:
            closed_candles = dict(self.current)
            self.current.clear()
            return closed_candles
