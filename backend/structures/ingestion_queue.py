"""IngestionQueue — FIFO tick buffer using collections.deque."""

from collections import deque


class Tick:
    def __init__(self, symbol, price, volume, timestamp):
        self.symbol = symbol
        self.price = price
        self.volume = volume
        self.timestamp = timestamp


class IngestionQueue:
    def __init__(self):
        self.queue = deque()

    def enqueue(self, tick):
        """Add tick to end of queue. O(1)."""
        self.queue.append(tick)

    def dequeue(self):
        """Remove and return first tick. O(1). Raises IndexError if empty."""
        if not self.queue:
            raise IndexError("Cannot dequeue from empty queue")
        return self.queue.popleft()

    def drain(self):
        """Remove all ticks and return as list. O(n)."""
        result = list(self.queue)
        self.queue.clear()
        return result

    def peek(self):
        """Return first tick without removing. O(1). Returns None if empty."""
        return self.queue[0] if self.queue else None

    def is_empty(self):
        """Check if queue is empty. O(1)."""
        return len(self.queue) == 0

    def size(self):
        """Return number of ticks in queue. O(1)."""
        return len(self.queue)
