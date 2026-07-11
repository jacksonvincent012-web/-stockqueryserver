# Real-Time Stock Tick Processing & OHLC Aggregation Backend

This self-contained Python backend service handles real-time market tick ingestion, in-memory OHLC candlestick aggregation, database persistence via SQLite / relational SQL, and automated historical data archiving.

## Architecture

```
backend/
├── services/
│   ├── tick_processor.py      # Core orchestration & hot memory buffer (deque)
│   ├── ohlc_aggregator.py     # Real-time candlestick (Open, High, Low, Close, Vol) calculation
│   ├── storage_manager.py     # SQLite3 database connection, DDL schema execution, & persistence
│   └── archive_manager.py     # Automated retention policy & 30-day historical archival
├── models/
│   ├── tick.py                # Pydantic / dataclass models for market ticks
│   ├── candle.py              # Candlestick OHLCV data structures
│   └── stock.py               # Stock metadata and reference entities
└── api/
    └── server.py              # FastAPI server exposing tick ingestion & data endpoints
```

## Setup & Running

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the API Server:
   ```bash
   python -m backend.api.server
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn backend.api.server:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Database Connection:
   - By default, the system initializes and connects to a SQLite database named `stocks.db`.
   - The database schema is automatically verified and initialized on startup using `schema.sql`.
   - You can override the database path by setting the `STOCKS_DB_PATH` environment variable.
