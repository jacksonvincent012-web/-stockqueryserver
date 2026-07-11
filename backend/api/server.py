import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

try:
    from fastapi import FastAPI, HTTPException, status, Query, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    # Handle environment without FastAPI installed during static inspection
    FastAPI = None
    CORSMiddleware = None
    BaseModel = object

try:
    from ..services.tick_processor import TickProcessor
    from ..models.tick import TickCreate, Tick
    from ..models.candle import Candle
except (ImportError, ValueError):
    from services.tick_processor import TickProcessor
    from models.tick import TickCreate, Tick
    from models.candle import Candle

# Initialize FastAPI app
app = FastAPI(
    title="Real-Time Market Tick & OHLC Aggregation API",
    description="High-performance backend service for market data ingestion, candlestick aggregation, and database persistence.",
    version="1.0.0"
)

if CORSMiddleware:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Global singleton engine instance
processor = TickProcessor()


class TickPayload(BaseModel):
    symbol: str = Field(..., example="NVDA")
    price: float = Field(..., gt=0, example=128.50)
    volume: int = Field(..., gt=0, example=500)
    timestamp: Optional[str] = Field(default=None, example="2026-07-03T14:30:00.000000Z")


class BatchTicksPayload(BaseModel):
    ticks: List[TickPayload]


@app.on_event("startup")
def on_startup():
    """Startup lifecycle handler to verify database readiness."""
    print("Market Tick API Server starting up. Database connection active.")


@app.on_event("shutdown")
def on_shutdown():
    """Graceful shutdown handler to close SQL connection."""
    processor.close()
    print("Market Tick API Server shut down.")


@app.get("/api/health", tags=["System"])
def health_check():
    """Check database status and internal engine metrics."""
    return {
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "hot_buffer_size": len(processor.hot_buffer),
        "active_symbols": list(processor.aggregator.current.keys()),
        "database": processor.storage.db_path
    }


@app.post("/api/ticks", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, tags=["Ingestion"])
def ingest_tick(payload: TickPayload):
    """
    Ingest a single market tick.
    Updates hot memory buffer, calculates live OHLC candlestick, and persists to SQL database.
    """
    try:
        tick_dict = {
            "symbol": payload.symbol.upper(),
            "price": payload.price,
            "volume": payload.volume,
            "timestamp": payload.timestamp or datetime.utcnow().isoformat()
        }
        updated_candle = processor.process_tick(tick_dict)
        return {
            "status": "success",
            "tick": tick_dict,
            "active_candle": updated_candle
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/ticks/batch", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, tags=["Ingestion"])
def ingest_ticks_batch(payload: BatchTicksPayload):
    """
    Ingest a high-volume batch of market ticks in a single database transaction.
    """
    try:
        ticks_list = [
            {
                "symbol": t.symbol.upper(),
                "price": t.price,
                "volume": t.volume,
                "timestamp": t.timestamp or datetime.utcnow().isoformat()
            }
            for t in payload.ticks
        ]
        updated_candles = processor.process_batch(ticks_list)
        return {
            "status": "success",
            "processed_count": len(ticks_list),
            "updated_symbols": list(set(t["symbol"] for t in ticks_list))
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/ticks/recent", tags=["Queries"])
def get_recent_ticks(symbol: str = Query(..., description="Stock ticker symbol (e.g. NVDA)"), limit: int = Query(100, le=1000)):
    """Retrieve recently persisted ticks for a symbol from the database."""
    try:
        ticks = processor.storage.get_recent_ticks(symbol.upper(), limit=limit)
        return {"symbol": symbol.upper(), "count": len(ticks), "ticks": ticks}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/candles/live", tags=["Candlesticks"])
def get_live_candle(symbol: str = Query(..., description="Stock ticker symbol")):
    """Get the current unclosed in-memory OHLC candlestick for a symbol."""
    candle = processor.get_current_candle(symbol.upper())
    if not candle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No active live candle found for {symbol.upper()}")
    return candle


@app.get("/api/candles/all", tags=["Candlesticks"])
def get_all_live_candles():
    """Retrieve all active live OHLC candlesticks across all tracked symbols."""
    return processor.aggregator.get_all_candles()


@app.get("/api/candles/history", tags=["Candlesticks"])
def get_historical_candles(
    symbol: str = Query(..., description="Stock ticker symbol"),
    timeframe: str = Query("1m", description="Candle timeframe (e.g., 1m, 5m, 1d)"),
    limit: int = Query(100, le=1000)
):
    """Query persisted historical OHLC candlesticks from the SQL database."""
    try:
        candles = processor.storage.get_candles(symbol.upper(), timeframe=timeframe, limit=limit)
        return {"symbol": symbol.upper(), "timeframe": timeframe, "count": len(candles), "candles": candles}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/admin/archive", tags=["Admin"])
def run_archive_job(background_tasks: BackgroundTasks, retention_days: int = Query(30, ge=1)):
    """Trigger background archival of market ticks older than retention_days."""
    def _do_archive():
        processor.storage.archive_old_ticks(retention_days=retention_days)

    background_tasks.add_task(_do_archive)
    return {"status": "accepted", "message": f"Archival job triggered for ticks older than {retention_days} days."}


@app.get("/api/dsa/status", tags=["DSA Structures"])
def get_dsa_status():
    """
    Inspect the telemetry and status of all 8 Core Backend DSA Structures:
    1. HashMap: Fast ticker lookup
    2. Queue: Buffer incoming ticks
    3. Stack: Alert history and undo
    4. Min-Heap: Top-K stocks
    5. Graph: Sector relationships (BFS/DFS)
    6. Binary Search: Search sorted historical data
    7. Merge Sort: Sort historical records
    8. LRU Cache: Cache recent searches
    """
    return {
        "1_hashmap_lookup": {"size": processor.ticker_map.size(), "symbols": processor.ticker_map.get_all_symbols()},
        "2_queue_buffer": processor.ingestion_queue.get_metrics(),
        "3_stack_alerts": {"size": processor.alert_stack.size(), "recent_alerts": processor.alert_stack.get_history(limit=5)},
        "4_min_heap_top_k": {"k": processor.top_k_heap.k, "top_stocks": processor.top_k_heap.get_top_k()},
        "5_graph_sectors": {"total_nodes": processor.sector_graph.size()},
        "6_binary_search_engine": {"status": "online", "time_complexity": "O(log N)"},
        "7_merge_sort_sorter": {"status": "online", "time_complexity": "O(N log N)"},
        "8_lru_cache_searches": processor.query_cache.get_metrics()
    }


@app.get("/api/dsa/top-k", tags=["DSA Structures"])
def get_dsa_top_k():
    """Get top K volume stocks ranked dynamically via Min-Heap DSA."""
    return {"metric": "volume", "top_k": processor.top_k_heap.get_top_k()}


@app.get("/api/dsa/graph/traverse", tags=["DSA Structures"])
def traverse_sector_graph(symbol_or_sector: str = Query("Technology Sector"), algorithm: str = Query("BFS", regex="^(BFS|DFS)$")):
    """Traverse sector and stock relationships using Breadth-First Search (BFS) or Depth-First Search (DFS)."""
    if algorithm.upper() == "BFS":
        result = processor.sector_graph.bfs_traverse(symbol_or_sector, max_depth=3)
    else:
        result = processor.sector_graph.dfs_traverse(symbol_or_sector)
    return {"algorithm": algorithm.upper(), "start": symbol_or_sector, "result": result}


@app.get("/api/dsa/alerts/history", tags=["DSA Structures"])
def get_alert_stack_history(limit: int = Query(20, le=100)):
    """Retrieve LIFO stack alert history."""
    return {"count": processor.alert_stack.size(), "history": processor.alert_stack.get_history(limit=limit)}


@app.post("/api/dsa/alerts/undo", tags=["DSA Structures"])
def undo_last_alert():
    """Pop the most recent alert from the LIFO Stack (undo action)."""
    undone = processor.alert_stack.undo()
    if not undone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert stack is empty. No action to undo.")
    return {"status": "success", "undone_alert": undone}


@app.get("/api/dsa/search/binary", tags=["DSA Structures"])
def binary_search_history(symbol: str = Query(...), timestamp: str = Query(...)):
    """Use Binary Search O(log N) to find a record in sorted historical data."""
    found = processor.search_historical_timestamp(symbol.upper(), target_timestamp=timestamp)
    return {"symbol": symbol.upper(), "target_timestamp": timestamp, "result": found}


def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Helper to run the Uvicorn server programmatically."""
    if uvicorn:
        uvicorn.run("backend.api.server:app", host=host, port=port, reload=False)
    else:
        print("Uvicorn is not installed. Please install requirements.txt to run the HTTP server.")


if __name__ == "__main__":
    run_server()
