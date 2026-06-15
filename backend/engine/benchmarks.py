"""Benchmarks — Time DSA operations at N=1K/10K/100K using time.perf_counter()."""

import time
from engine.stock_map import StockHashMap, StockRecord
from engine.ingestion_queue import IngestionQueue, Tick
from engine.alert_stack import AlertStack, Alert
from engine.top_k_heap import TopKHeap
from engine.sector_graph import SectorGraph
from engine.merge_sort import merge_sort
from engine.binary_search import binary_search
from datetime import datetime


def run_benchmarks():
    """Run all DSA benchmarks at N=1K/10K/100K. Returns list of result dicts."""
    results = []

    # 1. Hash insert
    for n in [1000, 10000, 100000]:
        hm = StockHashMap()
        start = time.perf_counter()
        for i in range(n):
            record = StockRecord(f"TEST{i}", 100.0 + i, 1000000, "TEST")
            hm.put(f"TEST{i}", record)
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'hash_insert',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(1)'
        })

    # 2. Hash lookup
    hm = StockHashMap()
    for i in range(1000):
        hm.put(f"TEST{i}", StockRecord(f"TEST{i}", 100.0 + i, 1000000, "TEST"))
    for n in [1000, 10000, 100000]:
        start = time.perf_counter()
        for i in range(n):
            hm.get(f"TEST{i % 1000}")
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'hash_lookup',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(1)'
        })

    # 3. Queue drain
    for n in [1000, 10000, 100000]:
        q = IngestionQueue()
        for i in range(n):
            q.enqueue(Tick(f"SYM{i}", 100.0 + i, 1000000, datetime.now()))
        start = time.perf_counter()
        q.drain()
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'queue_drain',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(n)'
        })

    # 4. Heap push (N items, maintain K=10)
    for n in [1000, 10000, 100000]:
        heap = TopKHeap(k=10)
        start = time.perf_counter()
        for i in range(n):
            heap.push(f"SYM{i}", float(i))
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'heap_push',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(log k)'
        })

    # 5. Merge sort
    for n in [1000, 10000, 100000]:
        arr = [float(i * 7 % 1000) for i in range(n)]
        start = time.perf_counter()
        merge_sort(arr)
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'merge_sort',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(n log n)'
        })

    # 6. Binary search
    for n in [1000, 10000, 100000]:
        arr = list(range(n))
        start = time.perf_counter()
        for _ in range(100):
            binary_search(arr, n // 2)
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'binary_search',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(log n)'
        })

    # 7. BFS traversal on N-node graph
    for n in [1000, 10000, 100000]:
        graph = SectorGraph()
        for i in range(n):
            graph.add_node(f"N{i}")
        for i in range(n - 1):
            graph.add_edge(f"N{i}", f"N{i + 1}")
        start = time.perf_counter()
        graph.bfs("N0")
        elapsed = (time.perf_counter() - start) * 1000
        results.append({
            'operation': 'bfs_traversal',
            'n': n,
            'time_ms': round(elapsed, 3),
            'big_o': 'O(V+E)'
        })

    return results
