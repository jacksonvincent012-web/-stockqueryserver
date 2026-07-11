-- Database Schema for Market Tick Ingestion & OHLC Aggregation
-- Connects SQLite / Relational DB for real-time and historical stock data storage

CREATE TABLE IF NOT EXISTS ticks (
    symbol TEXT NOT NULL,
    price REAL NOT NULL,
    volume INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);

-- Index for rapid query retrieval by symbol and time range
CREATE INDEX IF NOT EXISTS idx_ticks_symbol_timestamp ON ticks (symbol, timestamp);

-- Archived Ticks Table for historical retention (30+ days old ticks)
CREATE TABLE IF NOT EXISTS ticks_archive (
    symbol TEXT NOT NULL,
    price REAL NOT NULL,
    volume INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    archived_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_archive_symbol_timestamp ON ticks_archive (symbol, timestamp);

-- Aggregated OHLCV Candlesticks Table
CREATE TABLE IF NOT EXISTS candles_ohlc (
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL, -- e.g., '1m', '5m', '1h', '1d'
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    PRIMARY KEY (symbol, timeframe, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_candles_symbol_tf_time ON candles_ohlc (symbol, timeframe, timestamp);
