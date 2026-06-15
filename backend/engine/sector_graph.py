"""SectorGraph — Adjacency list for sector relationships and traversal."""


class SectorGraph:
    def __init__(self):
        self.adjacency_list = {}

    def add_node(self, node):
        """Add node to graph. O(1)."""
        if node not in self.adjacency_list:
            self.adjacency_list[node] = []

    def add_edge(self, from_node, to_node):
        """Add directed edge from → to. O(1)."""
        self.add_node(from_node)
        self.add_node(to_node)
        if to_node not in self.adjacency_list[from_node]:
            self.adjacency_list[from_node].append(to_node)

    def bfs(self, start_node):
        """Breadth-first traversal from start. O(V + E). Returns visited order."""
        if start_node not in self.adjacency_list:
            return []

        visited = set()
        queue = [start_node]
        visited.add(start_node)
        result = []

        while queue:
            node = queue.pop(0)
            result.append(node)
            for neighbor in self.adjacency_list[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        return result

    def dfs(self, start_node):
        """Depth-first traversal from start. O(V + E). Returns visited order."""
        if start_node not in self.adjacency_list:
            return []

        visited = set()
        result = []

        def dfs_helper(node):
            visited.add(node)
            result.append(node)
            for neighbor in self.adjacency_list[node]:
                if neighbor not in visited:
                    dfs_helper(neighbor)

        dfs_helper(start_node)
        return result

    def get_adjacency_list(self):
        """Return full adjacency list. O(1)."""
        return dict(self.adjacency_list)

    def get_nodes(self):
        """Return all nodes. O(n)."""
        return list(self.adjacency_list.keys())
