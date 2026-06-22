"""Flask REST API for Stock Query Server."""

import os
import sys
import time
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

# Ensure backend/ is on path so 'structures' imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from structures.stock_map import StockHashMap
from structures.ingestion_queue import IngestionQueue
from structures.alert_stack import AlertStack, Alert
from structures.top_k_heap import TopKHeap
from structures.sector_graph import SectorGraph
from structures.merge_sort import merge_sort
from structures.binary_search import binary_search
from structures.benchmarks import run_benchmarks
from simulator import Simulator, StockRecord
from auth import auth_bp, jwt_required, require_role, optional_auth

app = Flask(__name__)
CORS(app)

# Register auth blueprint
app.register_blueprint(auth_bp)

# Initialize DSA structures
stock_map = StockHashMap()
ingestion_queue = IngestionQueue()
alert_stack = AlertStack()
top_k_heap = TopKHeap(k=10)
sector_graph = SectorGraph()

# Initialize graph with sector relationships
def _init_graph():
    sectors = ["TECH", "FINANCE", "ENERGY", "RETAIL", "PHARMA", "AUTO", "MEDIA", "MOBILITY", "CYBERSEC"]
    for sector in sectors:
        sector_graph.add_node(sector)
    sector_graph.add_edge("TECH", "FINANCE")
    sector_graph.add_edge("FINANCE", "ENERGY")
    sector_graph.add_edge("ENERGY", "RETAIL")
    sector_graph.add_edge("RETAIL", "PHARMA")
    sector_graph.add_edge("PHARMA", "AUTO")
    sector_graph.add_edge("AUTO", "MEDIA")
    sector_graph.add_edge("MEDIA", "CYBERSEC")

_init_graph()

def _seed_static_data():
    """Populate stocks with seed data for serverless deployments."""
    import random
    from datetime import datetime, timedelta
    sectors = ["TECH", "FINANCE", "ENERGY", "RETAIL", "PHARMA", "AUTO", "MEDIA", "MOBILITY", "CYBERSEC"]
    symbols_data = [
        ("AAPL", 178.50, 52_000_000, "TECH"), ("GOOGL", 141.20, 28_000_000, "TECH"),
        ("MSFT", 378.90, 22_000_000, "TECH"), ("AMZN", 178.25, 40_000_000, "RETAIL"),
        ("TSLA", 248.50, 95_000_000, "AUTO"), ("JPM", 198.30, 12_000_000, "FINANCE"),
        ("V", 275.60, 8_000_000, "FINANCE"), ("JNJ", 156.80, 7_000_000, "PHARMA"),
        ("WMT", 172.40, 6_000_000, "RETAIL"), ("PG", 158.20, 5_000_000, "RETAIL"),
        ("XOM", 118.90, 15_000_000, "ENERGY"), ("CVX", 155.30, 9_000_000, "ENERGY"),
        ("PFE", 28.75, 18_000_000, "PHARMA"), ("TMO", 582.40, 2_000_000, "PHARMA"),
        ("COST", 725.80, 4_000_000, "RETAIL"), ("NFLX", 485.60, 6_000_000, "MEDIA"),
        ("DIS", 112.30, 11_000_000, "MEDIA"), ("ADBE", 495.20, 3_000_000, "TECH"),
        ("NVDA", 875.30, 45_000_000, "TECH"), ("META", 505.70, 20_000_000, "MEDIA"),
        ("UBER", 72.40, 14_000_000, "MOBILITY"), ("LYFT", 16.80, 5_000_000, "MOBILITY"),
        ("CRWD", 345.60, 4_000_000, "CYBERSEC"), ("ZS", 182.40, 3_000_000, "CYBERSEC"),
    ]
    today = datetime.now()
    for sym, price, vol, sector in symbols_data:
        rec = StockRecord(sym, price + random.uniform(-5, 5), vol + random.randint(-1_000_000, 1_000_000), sector)
        for day in range(90):
            d = (today - timedelta(days=90 - day)).strftime("%Y-%m-%d")
            p = price + random.uniform(-15, 15)
            rec.price_history.append((d, f"{p:.2f}"))
        stock_map.put(sym, rec)

# Start simulator (skipped in serverless mode — no persistent threads)
if not os.environ.get('VERCEL_SERVERLESS'):
    simulator = Simulator(stock_map, ingestion_queue, top_k_heap, alert_stack)
    simulator.start()
else:
    # Seed static data for serverless deployment
    _seed_static_data()

# Cache stats
cache_hits = 0
cache_misses = 0


@app.route('/api/stocks', methods=['GET'])
@jwt_required
def get_stocks():
    """GET /api/stocks — Return all stocks."""
    records = stock_map.all_records()
    return jsonify([{
        'symbol': r.symbol,
        'price': r.price,
        'volume': r.volume,
        'sector': r.sector
    } for r in records])


@app.route('/api/stocks/<symbol>', methods=['GET'])
@jwt_required
def get_stock(symbol):
    """GET /api/stocks/<symbol> — Return stock detail + 7-day metrics."""
    global cache_hits, cache_misses
    record = stock_map.get(symbol.upper())

    if not record:
        cache_misses += 1
        return jsonify({'error': 'Stock not found'}), 404

    cache_hits += 1
    history = record.price_history

    # 7-day metrics
    if history:
        last_7 = history[-7:] if len(history) >= 7 else history
        prices = [float(p[1]) for p in last_7]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        pct_change = ((prices[-1] - prices[0]) / prices[0] * 100) if prices[0] > 0 else 0
    else:
        avg_price = min_price = max_price = pct_change = 0

    return jsonify({
        'symbol': record.symbol,
        'price': record.price,
        'volume': record.volume,
        'sector': record.sector,
        'avg_7d': round(avg_price, 2),
        'min_7d': round(min_price, 2),
        'max_7d': round(max_price, 2),
        'pct_change_7d': round(pct_change, 2),
        'history_length': len(history)
    })


@app.route('/api/stocks/<symbol>/history', methods=['GET'])
@jwt_required
def get_history(symbol):
    """GET /api/stocks/<symbol>/history — Merge-sorted price history."""
    record = stock_map.get(symbol.upper())
    if not record:
        return jsonify({'error': 'Stock not found'}), 404

    history = record.price_history
    if not history:
        return jsonify({'history': []})

    # Extract prices, sort with merge_sort
    prices = [float(p[1]) for p in history]
    sorted_prices = merge_sort(prices)

    return jsonify({
        'symbol': record.symbol,
        'history': [{'date': h[0], 'price': h[1]} for h in history],
        'sorted_prices': sorted_prices
    })


@app.route('/api/top-k', methods=['GET'])
@jwt_required
def get_top_k():
    """GET /api/top-k?k=5&by=volume — Top-K stocks by volume or gain."""
    k = int(request.args.get('k', 5))
    by = request.args.get('by', 'volume')  # 'volume' or 'gain'

    records = stock_map.all_records()
    if by == 'gain':
        metrics = [(r.symbol, r.price % 100) for r in records]
    else:
        metrics = [(r.symbol, r.volume) for r in records]

    heap = TopKHeap(k=k)
    heap.heapify_all(metrics)

    top_k_list = heap.top_k()
    return jsonify({
        'k': k,
        'by': by,
        'top_k': [{'symbol': sym, 'metric': metric} for metric, sym in top_k_list]
    })


@app.route('/api/graph/bfs', methods=['GET'])
@jwt_required
def graph_bfs():
    """GET /api/graph/bfs?from=TECH — BFS traversal from sector."""
    start = request.args.get('from', 'TECH')
    result = sector_graph.bfs(start)
    return jsonify({'start': start, 'traversal': result})


@app.route('/api/graph/dfs', methods=['GET'])
@jwt_required
def graph_dfs():
    """GET /api/graph/dfs?from=TECH — DFS traversal from sector."""
    start = request.args.get('from', 'TECH')
    result = sector_graph.dfs(start)
    return jsonify({'start': start, 'traversal': result})


@app.route('/api/graph/adjacency', methods=['GET'])
@jwt_required
def graph_adjacency():
    """GET /api/graph/adjacency — Full adjacency list."""
    return jsonify(sector_graph.get_adjacency_list())


@app.route('/api/alerts', methods=['GET'])
@jwt_required
def get_alerts():
    """GET /api/alerts — Current alert stack."""
    alerts = alert_stack.all_alerts()
    return jsonify([{
        'symbol': a.symbol,
        'threshold': a.threshold,
        'triggered': a.triggered
    } for a in alerts])


@app.route('/api/alerts', methods=['POST'])
@jwt_required
@require_role('analyst', 'admin')
def post_alert():
    """POST /api/alerts — Add alert (push to stack). Requires Analyst or Admin."""
    data = request.get_json()
    symbol = data.get('symbol', '').upper()
    threshold = float(data.get('threshold', 0))

    if not symbol:
        return jsonify({'error': 'Missing symbol'}), 400

    alert = Alert(symbol, threshold)
    alert_stack.push(alert)
    return jsonify({'status': 'Alert pushed', 'alert': {
        'symbol': symbol,
        'threshold': threshold
    }})


@app.route('/api/alerts/undo', methods=['DELETE'])
@jwt_required
@require_role('analyst', 'admin')
def undo_alert():
    """DELETE /api/alerts/undo — Pop last alert (undo). Requires Analyst or Admin."""
    if alert_stack.is_empty():
        return jsonify({'status': 'Stack empty, nothing to undo'}), 400

    alert_stack.undo()
    return jsonify({'status': 'Alert undone'})


@app.route('/api/cache/stats', methods=['GET'])
@jwt_required
def cache_stats():
    """GET /api/cache/stats — Cache hit/miss stats."""
    total = cache_hits + cache_misses
    hit_rate = (cache_hits / total * 100) if total > 0 else 0
    return jsonify({
        'hits': cache_hits,
        'misses': cache_misses,
        'total': total,
        'hit_rate': round(hit_rate, 2)
    })


@app.route('/api/benchmarks', methods=['GET'])
@jwt_required
def benchmarks():
    """GET /api/benchmarks — Run DSA operations at N=1K/10K/100K."""
    results = run_benchmarks()
    return jsonify(results)


@app.route('/api/tests', methods=['GET'])
@jwt_required
@require_role('admin')
def run_tests():
    """GET /api/tests — Run pytest and return results. Requires Admin."""
    try:
        result = subprocess.run(
            ['pytest', 'tests/test_engine.py', '-v', '--tb=short'],
            cwd=os.path.dirname(__file__),
            capture_output=True,
            text=True,
            timeout=30
        )
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'passed': result.returncode == 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """GET /api/health — Health check (no auth required)."""
    return jsonify({
        'status': 'ok',
        'stocks_count': stock_map.size(),
        'alerts_count': alert_stack.size(),
        'queue_size': ingestion_queue.size(),
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
