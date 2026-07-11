import os
import sqlite3
import threading
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union


class StorageManager:
    """
    Manages database connection, DDL schema initialization, and transactional persistence
    for high-throughput market ticks and aggregated OHLC candlesticks.
    Supports thread-safe SQLite operations and automated 30-day historical data archiving.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.environ.get("STOCKS_DB_PATH", "stocks.db")
        # Enable thread safety for web server worker threads (FastAPI/Uvicorn)
        self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        self._init_schema()

    def _init_schema(self) -> None:
        """Initialize database schema from schema.sql or fallback DDL if file not found."""
        with self.lock:
            cursor = self.connection.cursor()
            schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")
            
            if os.path.exists(schema_path):
                with open(schema_path, "r", encoding="utf-8") as f:
                    cursor.executescript(f.read())
            else:
                # Built-in fallback schema execution
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ticks (
                        symbol TEXT NOT NULL,
                        price REAL NOT NULL,
                        volume INTEGER NOT NULL,
                        timestamp TEXT NOT NULL
                    );
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_ticks_symbol_timestamp ON ticks (symbol, timestamp);")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ticks_archive (
                        symbol TEXT NOT NULL,
                        price REAL NOT NULL,
                        volume INTEGER NOT NULL,
                        timestamp TEXT NOT NULL,
                        archived_at TEXT DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_archive_symbol_timestamp ON ticks_archive (symbol, timestamp);")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS candles_ohlc (
                        symbol TEXT NOT NULL,
                        timeframe TEXT NOT NULL,
                        open REAL NOT NULL,
                        high REAL NOT NULL,
                        low REAL NOT NULL,
                        close REAL NOT NULL,
                        volume INTEGER NOT NULL,
                        timestamp TEXT NOT NULL,
                        PRIMARY KEY (symbol, timeframe, timestamp)
                    );
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_candles_symbol_tf_time ON candles_ohlc (symbol, timeframe, timestamp);")
            
            self.connection.commit()

    def _get_val(self, item: Union[Dict[str, Any], Any], key: str) -> Any:
        """Helper to safely extract field values from either dictionaries or Pydantic models."""
        if isinstance(item, dict):
            return item[key]
        return getattr(item, key, None) or item[key]

    def store_tick(self, tick: Union[Dict[str, Any], Any]) -> None:
        """Persist a single market tick into the database."""
        symbol = self._get_val(tick, "symbol")
        price = float(self._get_val(tick, "price"))
        volume = int(self._get_val(tick, "volume"))
        timestamp = str(self._get_val(tick, "timestamp"))

        with self.lock:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                INSERT INTO ticks (symbol, price, volume, timestamp)
                VALUES (?, ?, ?, ?)
                """,
                (symbol, price, volume, timestamp)
            )
            self.connection.commit()

    def store_ticks_batch(self, ticks: List[Union[Dict[str, Any], Any]]) -> int:
        """Batch insert multiple ticks in a single transaction for maximum I/O performance."""
        if not ticks:
            return 0
        
        rows = [
            (
                self._get_val(t, "symbol"),
                float(self._get_val(t, "price")),
                int(self._get_val(t, "volume")),
                str(self._get_val(t, "timestamp"))
            )
            for t in ticks
        ]

        with self.lock:
            cursor = self.connection.cursor()
            cursor.executemany(
                """
                INSERT INTO ticks (symbol, price, volume, timestamp)
                VALUES (?, ?, ?, ?)
                """,
                rows
            )
            self.connection.commit()
            return len(rows)

    def store_candle(self, candle: Union[Dict[str, Any], Any], timeframe: str = "1m") -> None:
        """Persist or replace an aggregated OHLC candlestick."""
        symbol = self._get_val(candle, "symbol")
        open_p = float(self._get_val(candle, "open"))
        high_p = float(self._get_val(candle, "high"))
        low_p = float(self._get_val(candle, "low"))
        close_p = float(self._get_val(candle, "close"))
        vol = int(self._get_val(candle, "volume"))
        ts = str(self._get_val(candle, "timestamp") or datetime.utcnow().isoformat())

        with self.lock:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO candles_ohlc (symbol, timeframe, open, high, low, close, volume, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (symbol, timeframe, open_p, high_p, low_p, close_p, vol, ts)
            )
            self.connection.commit()

    def get_recent_ticks(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Query most recent market ticks for a specific ticker symbol."""
        with self.lock:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                SELECT symbol, price, volume, timestamp
                FROM ticks
                WHERE symbol = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (symbol.upper(), limit)
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_candles(self, symbol: str, timeframe: str = "1m", limit: int = 100) -> List[Dict[str, Any]]:
        """Query aggregated OHLC candlesticks for charting and technical analysis."""
        with self.lock:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                SELECT symbol, timeframe, open, high, low, close, volume, timestamp
                FROM candles_ohlc
                WHERE symbol = ? AND timeframe = ?
                ORDER BY timestamp ASC
                LIMIT ?
                """,
                (symbol.upper(), timeframe, limit)
            )
            return [dict(row) for row in cursor.fetchall()]

    def archive_old_ticks(self, retention_days: int = 30) -> int:
        """
        Archive ticks older than retention_days into the archive table,
        then delete them from the primary hot table to maintain optimal query speeds.
        """
        cutoff = (datetime.utcnow() - timedelta(days=retention_days)).isoformat()

        with self.lock:
            cursor = self.connection.cursor()
            
            # Step 1: Copy old ticks to archive table
            cursor.execute(
                """
                INSERT INTO ticks_archive (symbol, price, volume, timestamp)
                SELECT symbol, price, volume, timestamp
                FROM ticks
                WHERE timestamp < ?
                """,
                (cutoff,)
            )
            archived_count = cursor.rowcount if cursor.rowcount != -1 else 0

            # Step 2: Purge from active ticks table
            cursor.execute(
                """
                DELETE FROM ticks
                WHERE timestamp < ?
                """,
                (cutoff,)
            )
            deleted_count = cursor.rowcount if cursor.rowcount != -1 else archived_count

            self.connection.commit()
            return deleted_count

    def close(self) -> None:
        """Safely close the SQLite database connection."""
        with self.lock:
            if self.connection:
                self.connection.close()
