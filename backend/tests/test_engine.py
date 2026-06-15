"""Test suite for Stock Query Server DSA engine."""

import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from engine.stock_map import StockHashMap, StockRecord
from engine.ingestion_queue import IngestionQueue, Tick
from engine.alert_stack import AlertStack, Alert
from engine.top_k_heap import TopKHeap
from engine.sector_graph import SectorGraph
from engine.merge_sort import merge_sort
from engine.binary_search import binary_search
from datetime import datetime


class TestStockHashMap:
    def test_put_and_get(self):
        """Test basic put/get."""
        hm = StockHashMap()
        record = StockRecord("AAPL", 150.0, 1000000, "TECH")
        hm.put("AAPL", record)
        assert hm.get("AAPL") == record

    def test_get_nonexistent(self):
        """Test get on missing key returns None."""
        hm = StockHashMap()
        assert hm.get("AAPL") is None

    def test_update_existing(self):
        """Test update existing stock."""
        hm = StockHashMap()
        record = StockRecord("AAPL", 150.0, 1000000, "TECH")
        hm.put("AAPL", record)
        assert hm.update("AAPL", 155.0, 1100000)
        updated = hm.get("AAPL")
        assert updated.price == 155.0
        assert updated.volume == 1100000

    def test_update_nonexistent(self):
        """Test update on missing key returns False."""
        hm = StockHashMap()
        assert not hm.update("GOOG", 2000.0, 5000000)

    def test_all_records(self):
        """Test all_records returns list of all."""
        hm = StockHashMap()
        for i in range(5):
            hm.put(f"SYM{i}", StockRecord(f"SYM{i}", 100 + i, 1000000, "TECH"))
        assert len(hm.all_records()) == 5


class TestIngestionQueue:
    def test_enqueue_dequeue(self):
        """Test FIFO order."""
        q = IngestionQueue()
        tick1 = Tick("AAPL", 150.0, 1000000, datetime.now())
        tick2 = Tick("GOOG", 2000.0, 5000000, datetime.now())
        q.enqueue(tick1)
        q.enqueue(tick2)
        assert q.dequeue() == tick1
        assert q.dequeue() == tick2

    def test_dequeue_empty(self):
        """Test dequeue on empty raises IndexError."""
        q = IngestionQueue()
        with pytest.raises(IndexError):
            q.dequeue()

    def test_drain(self):
        """Test drain empties queue."""
        q = IngestionQueue()
        for i in range(5):
            q.enqueue(Tick(f"SYM{i}", 100 + i, 1000000, datetime.now()))
        result = q.drain()
        assert len(result) == 5
        assert q.is_empty()

    def test_peek(self):
        """Test peek without removing."""
        q = IngestionQueue()
        tick = Tick("AAPL", 150.0, 1000000, datetime.now())
        q.enqueue(tick)
        assert q.peek() == tick
        assert not q.is_empty()


class TestAlertStack:
    def test_push_pop(self):
        """Test LIFO order."""
        stack = AlertStack()
        alert1 = Alert("AAPL", 150.0)
        alert2 = Alert("GOOG", 2000.0)
        stack.push(alert1)
        stack.push(alert2)
        assert stack.pop() == alert2
        assert stack.pop() == alert1

    def test_pop_empty(self):
        """Test pop on empty raises IndexError."""
        stack = AlertStack()
        with pytest.raises(IndexError):
            stack.pop()

    def test_undo(self):
        """Test undo reverses last push."""
        stack = AlertStack()
        alert = Alert("AAPL", 150.0)
        stack.push(alert)
        stack.pop()
        assert stack.undo()
        assert stack.peek() == alert

    def test_peek(self):
        """Test peek without removing."""
        stack = AlertStack()
        alert = Alert("AAPL", 150.0)
        stack.push(alert)
        assert stack.peek() == alert
        assert not stack.is_empty()

    def test_undo_empty(self):
        """Test undo on nothing to restore returns False."""
        stack = AlertStack()
        assert not stack.undo()


class TestTopKHeap:
    def test_push_single(self):
        """Test top-1 correct."""
        heap = TopKHeap(k=1)
        heap.push("AAPL", 100)
        heap.push("GOOG", 50)
        assert heap.peek_min()[1] == "AAPL"

    def test_top_k_ordering(self):
        """Test top-K ordering."""
        heap = TopKHeap(k=3)
        for i in range(10):
            heap.push(f"SYM{i}", i * 10)
        top_k = heap.top_k()
        assert len(top_k) == 3
        assert top_k[0][0] == 90  # highest value first

    def test_heapify_all(self):
        """Test bulk insert."""
        heap = TopKHeap(k=5)
        items = [(f"SYM{i}", i * 10) for i in range(20)]
        heap.heapify_all(items)
        assert heap.size() == 5

    def test_heap_maintains_k(self):
        """Test heap never exceeds K."""
        heap = TopKHeap(k=5)
        for i in range(100):
            heap.push(f"SYM{i}", i)
        assert heap.size() == 5


class TestSectorGraph:
    def test_add_edge(self):
        """Test add edge."""
        graph = SectorGraph()
        graph.add_edge("TECH", "FINANCE")
        assert "FINANCE" in graph.get_adjacency_list()["TECH"]

    def test_bfs_order(self):
        """Test BFS visit order."""
        graph = SectorGraph()
        graph.add_edge("A", "B")
        graph.add_edge("A", "C")
        graph.add_edge("B", "D")
        result = graph.bfs("A")
        assert result[0] == "A"
        assert "B" in result
        assert "C" in result
        assert "D" in result

    def test_bfs_disconnected(self):
        """Test BFS from disconnected node."""
        graph = SectorGraph()
        graph.add_edge("A", "B")
        graph.add_edge("C", "D")
        result = graph.bfs("A")
        assert "C" not in result and "D" not in result

    def test_dfs_all_reachable(self):
        """Test DFS returns all reachable."""
        graph = SectorGraph()
        graph.add_edge("A", "B")
        graph.add_edge("B", "C")
        graph.add_edge("C", "D")
        result = graph.dfs("A")
        assert set(result) == {"A", "B", "C", "D"}


class TestMergeSort:
    def test_random_array(self):
        """Test sort random array."""
        arr = [5, 3, 8, 1, 9, 2]
        assert merge_sort(arr) == [1, 2, 3, 5, 8, 9]

    def test_already_sorted(self):
        """Test already-sorted input."""
        arr = [1, 2, 3, 4, 5]
        assert merge_sort(arr) == [1, 2, 3, 4, 5]

    def test_reverse_sorted(self):
        """Test reverse-sorted input."""
        arr = [5, 4, 3, 2, 1]
        assert merge_sort(arr) == [1, 2, 3, 4, 5]

    def test_single_element(self):
        """Test single element."""
        assert merge_sort([42]) == [42]

    def test_empty_array(self):
        """Test empty array."""
        assert merge_sort([]) == []

    def test_duplicates(self):
        """Test array with duplicates."""
        arr = [3, 1, 3, 2, 1]
        assert merge_sort(arr) == [1, 1, 2, 3, 3]


class TestBinarySearch:
    def test_element_found(self):
        """Test element found returns index."""
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 5) == 2

    def test_element_not_found(self):
        """Test element not found returns -1."""
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 4) == -1

    def test_first_element(self):
        """Test first element."""
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 1) == 0

    def test_last_element(self):
        """Test last element."""
        arr = [1, 3, 5, 7, 9]
        assert binary_search(arr, 9) == 4

    def test_empty_array(self):
        """Test empty array."""
        assert binary_search([], 5) == -1

    def test_single_element_found(self):
        """Test single element found."""
        assert binary_search([5], 5) == 0

    def test_single_element_not_found(self):
        """Test single element not found."""
        assert binary_search([5], 3) == -1


class TestRollingMetrics:
    def test_seven_day_average(self):
        """Test 7-day rolling average."""
        hm = StockHashMap()
        record = StockRecord("AAPL", 150.0, 1000000, "TECH")
        record.price_history = [
            ("2024-01-01", 100),
            ("2024-01-02", 102),
            ("2024-01-03", 101),
            ("2024-01-04", 103),
            ("2024-01-05", 105),
            ("2024-01-06", 107),
            ("2024-01-07", 110),
        ]
        hm.put("AAPL", record)
        record = hm.get("AAPL")
        prices = [float(p[1]) for p in record.price_history]
        avg = sum(prices) / len(prices)
        assert 103 < avg < 106

    def test_seven_day_min_max(self):
        """Test 7-day min/max."""
        hm = StockHashMap()
        record = StockRecord("AAPL", 150.0, 1000000, "TECH")
        record.price_history = [
            ("2024-01-01", 100),
            ("2024-01-02", 102),
            ("2024-01-03", 98),
            ("2024-01-04", 110),
            ("2024-01-05", 105),
            ("2024-01-06", 107),
            ("2024-01-07", 109),
        ]
        prices = [float(p[1]) for p in record.price_history]
        assert min(prices) == 98
        assert max(prices) == 110
