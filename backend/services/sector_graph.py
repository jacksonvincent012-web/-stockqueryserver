from collections import deque, defaultdict
import threading
from typing import Any, Dict, List, Set, Optional


class SectorGraph:
    """
    Graph DSA Structure: Sector relationships (BFS/DFS).
    A directed/undirected adjacency list graph representing market sectors, industries,
    and individual stock relationships (e.g. supply chain links or sector correlations).
    Supports Breadth-First Search (BFS) and Depth-First Search (DFS) for relationship discovery.
    """

    def __init__(self):
        # Adjacency list: node_id -> list of (neighbor_id, relationship_type, weight)
        self._adj: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        # Node metadata storage
        self._nodes: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()

    def add_node(self, node_id: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Add a sector, industry, or stock node to the relationship graph in O(1) time."""
        if not node_id:
            return
        key = node_id.upper().strip()
        with self._lock:
            if key not in self._nodes:
                self._nodes[key] = metadata or {"id": key, "type": "Sector"}
            elif metadata:
                self._nodes[key].update(metadata)

    def add_edge(self, source: str, target: str, rel_type: str = "CORRELATION", weight: float = 1.0, bidirectional: bool = True) -> None:
        """Add a directed or bidirectional edge between two nodes in the graph."""
        if not source or not target:
            return
        src = source.upper().strip()
        tgt = target.upper().strip()

        with self._lock:
            self.add_node(src)
            self.add_node(tgt)

            # Avoid duplicate identical edges
            if not any(edge["target"] == tgt and edge["type"] == rel_type for edge in self._adj[src]):
                self._adj[src].append({"target": tgt, "type": rel_type, "weight": weight})

            if bidirectional:
                if not any(edge["target"] == src and edge["type"] == rel_type for edge in self._adj[tgt]):
                    self._adj[tgt].append({"target": src, "type": rel_type, "weight": weight})

    def bfs_traverse(self, start_node: str, max_depth: int = 3) -> List[Dict[str, Any]]:
        """
        Breadth-First Search (BFS) algorithm to explore sector relationships level-by-level.
        Useful for finding all directly and indirectly correlated stocks within N degrees of separation.
        Time complexity: O(V + E).
        """
        if not start_node:
            return []
        start = start_node.upper().strip()
        with self._lock:
            if start not in self._nodes:
                return []

            visited: Set[str] = {start}
            queue: deque = deque([(start, 0)])  # (node_id, depth)
            result: List[Dict[str, Any]] = []

            while queue:
                current_id, depth = queue.popleft()
                if depth > 0:
                    node_data = dict(self._nodes.get(current_id, {"id": current_id}))
                    node_data["degrees_of_separation"] = depth
                    result.append(node_data)

                if depth < max_depth:
                    for edge in self._adj.get(current_id, []):
                        neighbor = edge["target"]
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append((neighbor, depth + 1))

            return result

    def dfs_traverse(self, start_node: str, target_node: Optional[str] = None, visited: Optional[Set[str]] = None) -> List[str]:
        """
        Depth-First Search (DFS) algorithm to find deep supply chain or hierarchy paths between sectors/stocks.
        Time complexity: O(V + E).
        """
        if not start_node:
            return []
        start = start_node.upper().strip()
        with self._lock:
            if start not in self._nodes:
                return []

            if visited is None:
                visited = set()
            visited.add(start)
            path = [start]

            if target_node and start == target_node.upper().strip():
                return path

            for edge in self._adj.get(start, []):
                neighbor = edge["target"]
                if neighbor not in visited:
                    sub_path = self.dfs_traverse(neighbor, target_node, visited)
                    if sub_path:
                        if target_node:
                            return [start] + sub_path
                        path.extend(sub_path)

            return path

    def get_neighbors(self, node_id: str) -> List[Dict[str, Any]]:
        """Return immediate neighbors of a node."""
        with self._lock:
            key = node_id.upper().strip()
            return [
                {
                    "target": edge["target"],
                    "relationship": edge["type"],
                    "weight": edge["weight"],
                    "metadata": self._nodes.get(edge["target"], {})
                }
                for edge in self._adj.get(key, [])
            ]

    def size(self) -> int:
        """Return total number of nodes in the sector graph."""
        with self._lock:
            return len(self._nodes)

    def clear(self) -> None:
        """Clear all nodes and relationships."""
        with self._lock:
            self._adj.clear()
            self._nodes.clear()
