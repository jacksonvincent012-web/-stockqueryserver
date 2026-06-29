"""
=============================================================
 PHASE 2 — DSA Structure 5: SectorGraph
 Rubric requirement: Graph (BFS/DFS; Dijkstra optional)
=============================================================

WHY A GRAPH HERE?
  Stock sectors don't operate in isolation — TECH performance
  often leads FINANCE which leads ENERGY, creating a chain of
  correlated movements. We model these relationships as a
  DIRECTED GRAPH where an edge A→B means "sector A influences
  sector B".

  Two traversal strategies answer two different questions:
    BFS — "which sectors are closest to TECH in influence?"
           (breadth = proximity layers)
    DFS — "if TECH moves, what is the full chain of sectors
           eventually affected?"
           (depth = complete reachability)

HOW IT WORKS — ADJACENCY LIST:
  The graph is stored as a dict mapping each node (sector name)
  to a list of its neighbours (sectors it influences).

  adjacency_list = {
    "TECH":    ["FINANCE", "MEDIA"],
    "FINANCE": ["ENERGY"],
    "ENERGY":  ["RETAIL"],
    ...
  }

DESIGN CONSIDERATIONS & EDGE CASES:
  1. Memory Footprint Efficiency (Sparse Topology):
     With ~50 real-world sector classifications and a sparse distribution of 
     inter-industry relationships (~200 edges max), an adjacency matrix would 
     waste massive chunks of space keeping track of empty cells at O(V²). 
     Utilizing an adjacency list optimizes the storage profile down to O(V + E).

  2. Infinite Traversal Loop Prevention (Cycles):
     Market sectors can exhibit cyclical feedback loops (e.g., TECH influences 
     FINANCE, which influences RETAIL, which loops back to influence TECH). Both 
     the BFS and DFS engines deploy an atomic hashing set ('visited') to intercept 
     re-entrant paths and avoid infinite iteration loops.

  3. Call Stack Overflow Defenses:
     Deeply nested macro-economic chains can stress Python's built-in recursion 
     limits. The inclusion of an explicit, array-backed 'dfs_iterative' routine 
     bypasses the execution runtime stack entirely, ensuring stable memory footprints.

  4. Defending Against Encapsulation Leaks:
     The get_adjacency_list() helper generates deep diagnostic copies of internal 
     pointer vectors. This prevents client endpoints from accidentally mutating 
     the core graph structure.

COMPLEXITY:
  add_node(node)               O(1) Time | O(1) Space
  add_edge(from_node, to_node) O(deg) Time check | O(1) Space
  remove_edge(from_node, to)   O(deg) Time search and slice extraction
  bfs(start)                   O(V + E) Time | O(V) Space
  dfs(start)                   O(V + E) Time | O(V) Space 
  get_adjacency_list()         O(V + E) Time | O(V + E) Space (Defensive Copy)
"""

from collections import deque


class SectorGraph:
    """
    Directed adjacency-list graph of stock sector relationships.

    Nodes  = sector names (strings), e.g. "TECH", "FINANCE"
    Edges  = directed influence relationships, e.g. TECH → FINANCE
    """

    def __init__(self):
        # { sector_name: [neighbour_sector, ...] }
        self._adj: dict[str, list[str]] = {}

    # -------------------------------------------------------------- #
    # Build the graph                                                #
    # -------------------------------------------------------------- #

    def add_node(self, node: str) -> None:
        """
        Add a sector node if it doesn't already exist.
        O(1).
        """
        if node not in self._adj:
            self._adj[node] = []

    def add_edge(self, from_node: str, to_node: str) -> None:
        """
        Add a directed edge from_node → to_node.
        Auto-creates either node if missing.
        Prevents duplicate edges.
        O(deg) checking overhead to maintain uniqueness.
        """
        self.add_node(from_node)
        self.add_node(to_node)
        if to_node not in self._adj[from_node]:
            self._adj[from_node].append(to_node)

    def remove_edge(self, from_node: str, to_node: str) -> bool:
        """
        Remove the directed edge from_node → to_node.
        Returns True if removed, False if not found.
        O(degree of from_node).
        """
        if from_node in self._adj and to_node in self._adj[from_node]:
            self._adj[from_node].remove(to_node)
            return True
        return False

    # -------------------------------------------------------------- #
    # Traversal — BFS                                                #
    # -------------------------------------------------------------- #

    def bfs(self, start: str) -> list[str]:
        """
        Breadth-First Search from start node.
        Returns sectors in order of increasing distance from start.
        Returns [] if start not in graph.

        Time:  O(V + E)
        Space: O(V)
        """
        if start not in self._adj:
            return []

        visited: set[str]    = {start}
        frontier: deque[str] = deque([start])   # ← deque for O(1) popleft
        result: list[str]    = []

        while frontier:
            node = frontier.popleft()           # O(1) — NOT list.pop(0)
            result.append(node)

            for neighbour in self._adj[node]:
                if neighbour not in visited:
                    visited.add(neighbour)
                    frontier.append(neighbour)

        return result

    # -------------------------------------------------------------- #
    # Traversal — DFS                                                #
    # -------------------------------------------------------------- #

    def dfs(self, start: str) -> list[str]:
        """
        Depth-First Search from start node.
        Returns all reachable sectors in DFS visit order.
        Returns [] if start not in graph.

        Time:  O(V + E)
        Space: O(V) — call stack depth = longest path
        """
        if start not in self._adj:
            return []

        visited: set[str] = set()
        result:  list[str] = []

        def _dfs_visit(node: str) -> None:
            visited.add(node)
            result.append(node)
            for neighbour in self._adj[node]:
                if neighbour not in visited:
                    _dfs_visit(neighbour)

        _dfs_visit(start)
        return result

    def dfs_iterative(self, start: str) -> list[str]:
        """
        Iterative DFS using an explicit stack (list) to avoid Python's
        recursion limit on large or deeply cyclic dependency paths.

        Time:  O(V + E)
        Space: O(V)
        """
        if start not in self._adj:
            return []

        visited: set[str] = set()
        stack: list[str] = [start]
        result: list[str] = []

        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                result.append(node)
                # Reverse to preserve symmetry with the recursive traversal pattern
                for neighbour in reversed(self._adj[node]):
                    if neighbour not in visited:
                        stack.append(neighbour)
        return result

    # -------------------------------------------------------------- #
    # Inspection                                                     #
    # -------------------------------------------------------------- #

    def get_adjacency_list(self) -> dict[str, list[str]]:
        """
        Return a deep copy of the full adjacency list to preserve insulation.
        O(V + E) — copies every node key and underlying edge array.
        """
        return {node: list(neighbours)
                for node, neighbours in self._adj.items()}

    def get_nodes(self) -> list[str]:
        """All sector nodes. O(V)."""
        return list(self._adj.keys())

    def get_neighbours(self, node: str) -> list[str]:
        """Neighbours of a single node. O(1)."""
        return list(self._adj.get(node, []))

    def node_count(self) -> int:
        """Number of nodes. O(1)."""
        return len(self._adj)

    def edge_count(self) -> int:
        """Total number of directed edges mapped in the matrix. O(V)."""
        return sum(len(nbrs) for nbrs in self._adj.values())