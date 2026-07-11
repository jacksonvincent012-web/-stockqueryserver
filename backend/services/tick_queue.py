from collections import deque
import threading
from typing import Any, Dict, List, Optional


class TickQueue:
    """
    Queue DSA Structure: Buffer incoming ticks.
    A thread-safe FIFO (First-In-First-Out) queue designed to absorb high-throughput
    market data streams before batch processing or database insertion.
    """

    def __init__(self, max_capacity: int = 10000):
        self.max_capacity = max_capacity
        self._queue = deque(maxlen=max_capacity)
        self._lock = threading.Lock()
        self._total_enqueued = 0
        self._total_dequeued = 0

    def enqueue(self, tick: Dict[str, Any]) -> bool:
        """
        Push a new market tick onto the rear of the queue in O(1) time.
        Returns True if successful.
        """
        if not tick:
            return False
        with self._lock:
            self._queue.append(tick)
            self._total_enqueued += 1
            return True

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Pop and return the oldest tick from the front of the queue in O(1) time.
        Returns None if queue is empty.
        """
        with self._lock:
            if not self._queue:
                return None
            self._total_dequeued += 1
            return self._queue.popleft()

    def dequeue_batch(self, batch_size: int = 500) -> List[Dict[str, Any]]:
        """
        Pop up to `batch_size` items from the queue in a single atomic operation
        for high-speed batch SQL inserts or OHLC updates.
        """
        batch: List[Dict[str, Any]] = []
        with self._lock:
            while self._queue and len(batch) < batch_size:
                batch.append(self._queue.popleft())
                self._total_dequeued += 1
        return batch

    def peek(self) -> Optional[Dict[str, Any]]:
        """View the front tick without removing it from the queue."""
        with self._lock:
            return self._queue[0] if self._queue else None

    def is_empty(self) -> bool:
        """Check if the queue is empty."""
        with self._lock:
            return len(self._queue) == 0

    def size(self) -> int:
        """Return the current number of ticks buffered in the queue."""
        with self._lock:
            return len(self._queue)

    def clear(self) -> None:
        """Purge all buffered ticks from the queue."""
        with self._lock:
            self._queue.clear()

    def get_metrics(self) -> Dict[str, Any]:
        """Return telemetry metrics for system monitoring dashboards."""
        with self._lock:
            return {
                "current_size": len(self._queue),
                "max_capacity": self.max_capacity,
                "total_enqueued": self._total_enqueued,
                "total_dequeued": self._total_dequeued,
                "utilization_pct": round((len(self._queue) / self.max_capacity) * 100, 2) if self.max_capacity > 0 else 0
            }
