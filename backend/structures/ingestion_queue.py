"""
=============================================================
 PHASE 2 — DSA Structure 2: IngestionQueue
 Rubric requirement: Queue (buffering, scheduling, BFS)
=============================================================

WHY A QUEUE HERE?
  The market simulator generates price ticks continuously —
  one tick every 2 seconds for a random stock. Those ticks
  must be processed in the exact order they arrive (FIFO):
  the price at 10:00:01 must be applied before the price at
  10:00:03. A queue enforces that ordering guarantee.

  The queue also acts as a decoupling buffer: the simulator
  PRODUCES ticks at its own rate; the hash-map update loop
  CONSUMES them in batches. Neither side blocks the other.

DESIGN CONSIDERATIONS & EDGE CASES:
  1. High-Frequency Memory Shifting:
     A traditional list's pop(0) triggers a full memory block shift, resulting
     in an expensive O(n) runtime penalty. Backing this buffer with a ring-block
     linked collections.deque enforces true O(1) constant-time access guarantees.
     
  2. Data Ingestion Uniformity (Polymorphism):
     The background threading engine generates plain JSON data dictionary packages, 
     while the analytical benchmark layer uses structured class objects. The 
     enqueue() portal has been upgraded with a polymorphic type inspector to 
     intercept, sanitize, and convert raw dictionaries into formal Tick instances.

  3. Continuous Footprint Compression:
     Using strict __slots__ definitions on the Tick unit of work eliminates 
     per-instance __dict__ creation overhead, optimizing memory layout profiles 
     under multi-thousand batch surges.

COMPLEXITY:
  enqueue   O(1) Amortized
  dequeue   O(1) Amortized (Raises IndexError on empty bounds)
  peek      O(1)
  drain     O(n) — Continuous structural batch collection depletion
  size      O(1)
"""

from collections import deque
from datetime import datetime
from typing import Any


class Tick:
    """
    One price update produced by the simulator.

    A Tick is the unit of work that flows through the queue:
      simulator → enqueue(tick) → queue → drain() → hash map update
    """

    # __slots__ avoids per-instance __dict__, saves memory when
    # thousands of ticks are buffered simultaneously.
    __slots__ = ("symbol", "price", "volume", "timestamp")

    def __init__(
        self,
        symbol: str,
        price: float,
        volume: int,
        timestamp: datetime,
    ):
        self.symbol:    str      = symbol.upper()
        self.price:     float    = float(price)
        self.volume:    int      = int(volume)
        self.timestamp: datetime = timestamp

    def __repr__(self) -> str:
        ts = self.timestamp.strftime("%H:%M:%S")
        return f"Tick({self.symbol}, {self.price:.2f}, vol={self.volume}, t={ts})"


class IngestionQueue:
    """
    FIFO tick buffer backed by collections.deque.

    Lifecycle of a tick:
      1. Simulator calls enqueue(tick)       — added to back
      2. Every 2 s the server calls drain()  — removes all ticks
      3. Server loops over returned list and calls HashMap.update()
    """

    def __init__(self):
        self._queue: deque[Tick] = deque()

    # -------------------------------------------------------------- #
    # Write                                                          #
    # -------------------------------------------------------------- #

    def enqueue(self, tick: Any) -> None:
        """
        Add a tick to the BACK of the queue.
        Polymorphically intercept and process dictionary payloads or Tick instances safely.
        O(1) amortized.
        """
        if isinstance(tick, dict):
            # Parse incoming datetime string indicators cleanly
            ts = tick.get("timestamp")
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts)
                except ValueError:
                    ts = datetime.now()
            elif not isinstance(ts, datetime):
                ts = datetime.now()

            # Pack raw JSON payload structure symmetrically into a rigid object layout
            tick = Tick(
                symbol=tick.get("symbol", "UNKNOWN"),
                price=tick.get("price", 0.0),
                volume=tick.get("volume", 0),
                timestamp=ts
            )

        self._queue.append(tick)

    # -------------------------------------------------------------- #
    # Consume                                                        #
    # -------------------------------------------------------------- #

    def dequeue(self) -> Tick:
        """
        Remove and return the FRONT tick (FIFO order).
        Raises IndexError if queue is empty.
        O(1) amortized.
        """
        if not self._queue:
            raise IndexError("Cannot dequeue from an empty IngestionQueue")
        return self._queue.popleft()   # ← O(1), NOT pop(0) which is O(n)

    def drain(self) -> list[Tick]:
        """
        Remove ALL ticks and return them as a list.
        Called by the simulator at the end of each 2-second tick cycle.
        O(n) — intentional: we want to process the whole batch at once.
        """
        batch = list(self._queue)   # snapshot O(n)
        self._queue.clear()         # clear   O(1)
        return batch

    def peek(self) -> Tick | None:
        """
        Return the front tick WITHOUT removing it.
        Returns None if queue is empty.
        O(1).
        """
        return self._queue[0] if self._queue else None

    # -------------------------------------------------------------- #
    # Utility                                                        #
    # -------------------------------------------------------------- #

    def is_empty(self) -> bool:
        """True if no ticks are waiting. O(1)."""
        return len(self._queue) == 0

    def size(self) -> int:
        """Number of ticks currently buffered. O(1)."""
        return len(self._queue)