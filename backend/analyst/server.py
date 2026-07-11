import os
from flask import Flask, jsonify, request
try:
    from flask_cors import CORS
except ImportError:
    CORS = None

try:
    from .service import AnalystService
    from .models import (
        StockResponse, AnalyticsResponse, AlertRuleCreate, AlertRule,
        AlertResponse, SearchRequest, CacheStatsResponse
    )
except (ImportError, ValueError):
    from service import AnalystService
    from models import (
        StockResponse, AnalyticsResponse, AlertRuleCreate, AlertRule,
        AlertResponse, SearchRequest, CacheStatsResponse
    )

# Initialize Flask application for Analyst Module
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

if CORS:
    CORS(app, resources={r"/api/*": {"origins": "*"}})

# Singleton Analyst Service wrapped over DSA Backend Engines
analyst_service = AnalystService()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint confirming DSA structures and tick stream pipeline are active."""
    return jsonify({
        "status": "online",
        "module": "Analyst Dashboard (Stock Query Server)",
        "framework": "Python (Flask)",
        "dsa_engines": [
            "HashMap O(1) Lookup",
            "Min-Heap / Max-Heap Top-K Analytics",
            "Alert Stack (LIFO) Undo",
            "Merge Sort & Binary Search History",
            "Sector Graph BFS/DFS",
            "LRU Cache O(1)"
        ]
    }), 200


# ==========================================
# 1. Stock Query Service (HashMap O(1))
# ==========================================
@app.route("/api/stocks/<symbol>", methods=["GET"])
def get_stock(symbol: str):
    """
    Provide fast lookup of stock data by ticker symbol using HashMap (O(1)).
    Returns current price, volume, market cap, and daily change.
    """
    data = analyst_service.get_stock(symbol)
    if not data:
        return jsonify({"error": f"Ticker symbol '{symbol.upper()}' not found in Stock Query Server."}), 404
    return jsonify(data), 200


# ==========================================
# 2. Market Analytics Engine (Top-K Heap)
# ==========================================
@app.route("/api/analytics/top", methods=["GET"])
def get_analytics_top():
    """
    Compute and return Top gainers, Top losers, Most active stocks, and Sector performance summary.
    Uses Min-Heap / Max-Heap (Top-K logic) for ranking stocks efficiently in O(N log K) time.
    """
    analytics = analyst_service.get_market_analytics()
    return jsonify(analytics), 200


# ==========================================
# 3. Alert Rule Engine (Stack LIFO)
# ==========================================
@app.route("/api/alerts/create", methods=["POST"])
def create_alert():
    """
    Allow analysts to create alert rules such as price above/below threshold, volume spike, or % change.
    Stores alert rules using a Stack (LIFO) for undo functionality.
    """
    body = request.get_json(silent=True) or {}
    symbol = body.get("symbol")
    condition = body.get("condition")
    threshold = body.get("threshold")
    
    if not symbol or not condition or threshold is None:
        return jsonify({"error": "Missing required fields: symbol, condition, threshold"}), 400
        
    rule = analyst_service.create_alert_rule(symbol=str(symbol), condition=str(condition), threshold=float(threshold))
    return jsonify(rule), 201


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """
    Retrieve all active alert rules and historical triggered alert events.
    In real time, incoming ticks are continuously evaluated against active rules to trigger alerts.
    """
    return jsonify(analyst_service.get_alerts()), 200


@app.route("/api/alerts/undo", methods=["DELETE"])
def undo_alert():
    """
    Undo the most recently created alert rule using Stack (LIFO) pop functionality.
    """
    res = analyst_service.undo_last_alert_rule()
    if not res:
        return jsonify({"error": "Alert rule stack is empty. No action to undo."}), 404
    return jsonify(res), 200


# ==========================================
# 4. Historical Data Engine (Merge Sort & Binary Search)
# ==========================================
@app.route("/api/history/<symbol>", methods=["GET"])
def get_history(symbol: str):
    """
    Store and return OHLC (Open, High, Low, Close) time-series data per ticker.
    Supports sorted historical retrieval using Merge Sort (O(N log N)) and fast searching using Binary Search (O(log N)).
    """
    limit = request.args.get("limit", default=100, type=int)
    history = analyst_service.get_historical_data(symbol, limit=limit)
    return jsonify(history), 200


# ==========================================
# 5. Sector Exploration Engine (Graph BFS/DFS)
# ==========================================
@app.route("/api/sectors/bfs", methods=["GET"])
def get_sectors_bfs():
    """
    Represent market sectors as a Graph (Nodes = sectors/stocks, Edges = relationships).
    Perform Breadth-First Search (BFS) traversal in O(V + E) time.
    """
    start_node = request.args.get("start_node", default="Technology Sector", type=str)
    max_depth = request.args.get("max_depth", default=3, type=int)
    return jsonify(analyst_service.get_sector_bfs(start_node=start_node, max_depth=max_depth)), 200


@app.route("/api/sectors/dfs", methods=["GET"])
def get_sectors_dfs():
    """
    Represent market sectors as a Graph and perform Depth-First Search (DFS) traversal in O(V + E) time.
    """
    start_node = request.args.get("start_node", default="Technology Sector", type=str)
    target_node = request.args.get("target_node", default=None, type=str)
    return jsonify(analyst_service.get_sector_dfs(start_node=start_node, target_node=target_node)), 200


# ==========================================
# 6. Cache Layer (LRU Cache O(1))
# ==========================================
@app.route("/api/cache/stats", methods=["GET"])
def get_cache_stats():
    """
    Return LRU Cache layer metrics (hits, misses, capacity, size, hit ratio).
    Improves response time for repeated requests to O(1).
    """
    return jsonify(analyst_service.get_cache_stats()), 200


@app.route("/api/search", methods=["POST"])
def search_stocks():
    """
    Fast ticker and company name search utilizing LRU Cache for O(1) repeated query retrieval.
    """
    body = request.get_json(silent=True) or {}
    query = body.get("query", "")
    limit = body.get("limit", 10)
    results = analyst_service.search_stocks(query=str(query), limit=int(limit))
    return jsonify({"query": query, "count": len(results), "results": results}), 200


# ==========================================
# Tick Ingestion Hook (Stream-Based Architecture)
# ==========================================
@app.route("/api/ticks/ingest", methods=["POST"])
def ingest_tick():
    """
    Ingest continuous market ticks through the processing pipeline:
    Ingestion Queue -> Tick Processor -> DSA Engine -> Storage + Analytics.
    Automatically evaluates ticks against active alert rules.
    """
    body = request.get_json(silent=True) or {}
    symbol = body.get("symbol")
    price = body.get("price")
    
    if not symbol or price is None:
        return jsonify({"error": "Missing required fields: symbol, price"}), 400
        
    res = analyst_service.ingest_live_tick(body)
    return jsonify(res), 201


@app.route("/api/simulate-data", methods=["GET"])
def simulate_data():
    """Simulate tick stream data for testing analyst dashboard live feeds."""
    symbols_param = request.args.get("symbols", "AAPL,NVDA,TSLA,MSFT,AMZN")
    syms = [s.strip().upper() for s in symbols_param.split(",") if s.strip()]
    
    results = {}
    for sym in syms:
        stock = analyst_service.get_stock(sym) or {"price": 150.0, "volume": 10000, "change_percent": 0.0}
        # Simulate small tick fluctuation
        new_price = round(stock["price"] + (0.5 if id(sym) % 2 == 0 else -0.3), 2)
        new_vol = int(stock["volume"]) + 500
        new_chg = round(stock.get("change_percent", 0.0) + 0.1, 2)
        
        tick = {
            "symbol": sym,
            "price": new_price,
            "volume": new_vol,
            "change_percent": new_chg
        }
        analyst_service.ingest_live_tick(tick)
        results[sym] = {
            "price": str(new_price),
            "volume": new_vol,
            "change": str(new_chg),
            "peRatio": "24.5"
        }
        
    return jsonify(results), 200


def run_analyst_server(host: str = "0.0.0.0", port: int = 5000):
    """Launch the Python Flask Stock Query Server."""
    print(f"Starting Analyst Module Stock Query Server (Flask) on http://{host}:{port}")
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    run_analyst_server()
