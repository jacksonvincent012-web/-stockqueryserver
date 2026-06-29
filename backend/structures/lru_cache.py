"""
=============================================================
 PHASE 2 — DSA Structure 9: LRUCache
 Composite structure: HashMap + Doubly Linked List
=============================================================

WHY KNOCK OUT AN LRU CACHE HERE?
  An estimated 80% of API dashboard requests hit roughly 20% of the tickers
  (the "hot" assets like AAPL, MSFT, NVDA). Without caching, every single read
  forces a deep lookup on the primary StockHashMap. An LRU cache intercepts
  the pipeline: the first read fetches from the map and caches the block.
  Subsequent requests return instantly in true O(1) time—bypassing hash
  computations, object instantiations, or raw memory block allocations.

  When the storage limit is breached, the Least Recently Used entry is evicted:
  the exact asset nobody has requested in the longest time window. This retains
  a high hit-rate footprint tailored to active user engagement.

HOW IT WORKS — HashMap + Doubly Linked List:

        HashMap              Doubly Linked List
    { "AAPL" → node }    head (MRU) ⇄ ... ⇄ tail (LRU)
    { "MSFT" → node }
    { "NVDA" → node }

DESIGN CONSIDERATIONS & EDGE CASES:
  1. Instant Pointer Re-alignment:
     Moving an item from the middle of a single list to the front requires a 
     costly linear scan to repair broken links. Backing nodes with symmetric
     'prev' and 'next' properties allows this engine to snap nodes out of their
     current sequence and re-stitch the layout in absolute O(1) constant time.
     
  2. Memory Cap Safeguards (Zero Overflows):
     The write pipeline evaluates capacity boundaries *immediately* following new
     inserts. If structural limits are crossed, the tail element is detached from 
     both the linked sequence and the key map index in the same cycle.

  3. Accurate Telemetry Metrics:
     Internal atomic counters capture state hit/miss resolutions. This provides 
     the frontend UI layer with instant dashboard metrics regarding hit-rates.

COMPLEXITY:
  get(key)       O(1) Constant — Index lookup + link update
  put(key, val)  O(1) Constant — Update/insert + tail eviction boundary check
  remove(key)    O(1) Constant — Manual cache elimination
  clear()        O(1) Constant — Decouples map keys and terminal node bounds
  Space          O(Capacity)   — Strictly capped structural footprint
"""


class _Node:
    """Doubly linked list node for LRU cache entries."""

    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    """
    Fixed-capacity LRU cache backed by HashMap + Doubly Linked List.

    Parameters
    ----------
    capacity : int
        Maximum number of entries before eviction (default 100).
    """

    def __init__(self, capacity: int = 100):
        self.capacity = capacity
        self._map: dict = {}              # key → _Node
        self._head: _Node | None = None   # Most Recently Used
        self._tail: _Node | None = None   # Least Recently Used
        self._size: int = 0
        self._hits: int = 0
        self._misses: int = 0

    # ------------------------------------------------------------------ #
    # Public API                                                         #
    # ------------------------------------------------------------------ #

    def get(self, key) -> object | None:
        """
        Retrieve value by key.
        Moves accessed node to head (MRU position).
        Returns None if key not present.
        O(1).
        """
        node = self._map.get(key)
        if node is None:
            self._misses += 1
            return None
        self._hits += 1
        self._move_to_head(node)
        return node.value

    def put(self, key, value) -> None:
        """
        Insert or update a cache entry.
        If key exists: update value and move to head.
        If key is new: add to head; evict tail if over capacity.
        O(1).
        """
        node = self._map.get(key)
        if node:
            node.value = value
            self._move_to_head(node)
            return

        new_node = _Node(key, value)
        self._map[key] = new_node
        self._add_to_head(new_node)
        self._size += 1

        if self._size > self.capacity:
            self._evict_tail()

    def remove(self, key) -> bool:
        """
        Remove a specific key from cache.
        Returns True if removed, False if not found.
        O(1).
        """
        node = self._map.pop(key, None)
        if node is None:
            return False
        self._remove_node(node)
        self._size -= 1
        return True

    def clear(self) -> None:
        """
        Remove all entries. 
        O(1) dictionary clear and reference reset. Cyclical blocks are cleanly
        reclaimed by the background Python garbage collector.
        """
        self._map.clear()
        self._head = None
        self._tail = None
        self._size = 0
        self._hits = 0
        self._misses = 0

    def contains(self, key) -> bool:
        """O(1) membership check (does NOT affect recency metrics)."""
        return key in self._map

    # ------------------------------------------------------------------ #
    # Stats                                                              #
    # ------------------------------------------------------------------ #

    @property
    def hits(self) -> int:
        return self._hits

    @property
    def misses(self) -> int:
        return self._misses

    @property
    def size(self) -> int:
        return self._size

    def stats(self) -> dict:
        total = self._hits + self._misses
        hit_rate = round(self._hits / total * 100, 1) if total > 0 else 0.0
        return {
            "capacity": self.capacity,
            "size": self._size,
            "hits": self._hits,
            "misses": self._misses,
            "total_requests": total,
            "hit_rate_pct": hit_rate,
        }

    # ------------------------------------------------------------------ #
    # Internal — doubly linked list operations (all O(1))                #
    # ------------------------------------------------------------------ #

    def _add_to_head(self, node: _Node) -> None:
        """Insert node at head (MRU position)."""
        node.prev = None
        node.next = self._head
        if self._head:
            self._head.prev = node
        self._head = node
        if self._tail is None:
            self._tail = node

    def _remove_node(self, node: _Node) -> None:
        """Detach node from its current position in the list safely."""
        if node.prev:
            node.prev.next = node.next
        else:
            self._head = node.next

        if node.next:
            node.next.prev = node.prev
        else:
            self._tail = node.prev

        node.prev = None
        node.next = None

    def _move_to_head(self, node: _Node) -> None:
        """Move an existing node to head (MRU position)."""
        if node is self._head:
            return
        self._remove_node(node)
        self._add_to_head(node)

    def _evict_tail(self) -> None:
        """Remove the least recently used entry (tail)."""
        if self._tail is None:
            return
        evicted = self._tail
        self._map.pop(evicted.key, None)
        self._remove_node(evicted)
        self._size -= 1

    def keys(self) -> list:
        """All keys currently in cache (for architecture tracking checks)."""
        return list(self._map.keys())