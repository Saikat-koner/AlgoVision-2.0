"""
Graph Algorithms Suite
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements BFS, DFS 3-Color Cycle Detection, Tarjan's Strongly Connected Components (SCC),
Kruskal's Minimum Spanning Tree (with DSU), and Kahn's Topological Sorting.
"""

from typing import Dict, List, Optional, Set, Tuple
from collections import deque
from ..data_structures.graph_structures import AdjacencyListGraph, GraphEdge


class BFSExplorer:
    """
    Breadth-First Search (BFS) for layer-by-layer network exploration and hop-count analysis.
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """

    def traverse(self, graph: AdjacencyListGraph, start_node: str) -> List[dict]:
        """Returns ordered traversal sequence with depth levels and parent pointers."""
        if start_node not in graph.vertices:
            return []

        visited: Set[str] = {start_node}
        queue: deque = deque([(start_node, 0, None)])
        traversal_log = []

        while queue:
            u, level, parent = queue.popleft()
            traversal_log.append({
                "vertex": u,
                "level": level,
                "parent": parent,
                "label": graph.vertices[u].get("label", u)
            })

            for v, _ in graph.get_neighbors(u):
                if v not in visited:
                    visited.add(v)
                    queue.append((v, level + 1, u))

        return traversal_log


class DFSCycleDetector:
    """
    Depth-First Search with 3-color state marking (WHITE=0, GREY=1, BLACK=2).
    Uncovers circular dependencies and suspicious money routing loops in fintech graphs.
    Time Complexity: O(V + E)
    """

    WHITE = 0  # Unvisited
    GREY = 1   # Currently on recursion stack
    BLACK = 2  # Fully explored

    def __init__(self):
        self.detected_cycles: List[List[str]] = []

    def find_all_cycles(self, graph: AdjacencyListGraph) -> List[List[str]]:
        self.detected_cycles = []
        color: Dict[str, int] = {v: self.WHITE for v in graph.vertices}
        parent_map: Dict[str, Optional[str]] = {v: None for v in graph.vertices}

        for v in graph.vertices:
            if color[v] == self.WHITE:
                self._dfs_visit(graph, v, color, parent_map, [v])

        return self.detected_cycles

    def _dfs_visit(self, graph: AdjacencyListGraph, u: str, color: Dict[str, int], parent_map: Dict[str, Optional[str]], current_path: List[str]) -> None:
        color[u] = self.GREY

        for v, _ in graph.get_neighbors(u):
            if color[v] == self.GREY:
                # Back-edge detected -> Cycle found
                cycle_start_idx = current_path.index(v) if v in current_path else 0
                cycle = current_path[cycle_start_idx:] + [v]
                self.detected_cycles.append(cycle)
            elif color[v] == self.WHITE:
                parent_map[v] = u
                self._dfs_visit(graph, v, color, parent_map, current_path + [v])

        color[u] = self.BLACK


class TarjanSCC:
    """
    Tarjan's Strongly Connected Components (SCC) algorithm.
    Partitions directed graphs into maximal strongly connected subgraphs in a single DFS pass.
    Critical for isolating money-laundering clusters and closed transaction ecosystems.
    Time Complexity: O(V + E)
    Space Complexity: O(V)
    """

    def __init__(self):
        self._index: int = 0
        self._stack: List[str] = []
        self._indices: Dict[str, int] = {}
        self._lowlinks: Dict[str, int] = {}
        self._on_stack: Dict[str, bool] = {}
        self.scc_list: List[List[str]] = []

    def find_scc(self, graph: AdjacencyListGraph) -> List[List[str]]:
        self._index = 0
        self._stack = []
        self._indices = {}
        self._lowlinks = {}
        self._on_stack = {v: False for v in graph.vertices}
        self.scc_list = []

        for v in graph.vertices:
            if v not in self._indices:
                self._strongconnect(graph, v)

        return self.scc_list

    def _strongconnect(self, graph: AdjacencyListGraph, u: str) -> None:
        self._indices[u] = self._index
        self._lowlinks[u] = self._index
        self._index += 1
        self._stack.append(u)
        self._on_stack[u] = True

        for v, _ in graph.get_neighbors(u):
            if v not in self._indices:
                self._strongconnect(graph, v)
                self._lowlinks[u] = min(self._lowlinks[u], self._lowlinks[v])
            elif self._on_stack[v]:
                self._lowlinks[u] = min(self._lowlinks[u], self._indices[v])

        # If u is a root node, pop the stack and generate an SCC
        if self._lowlinks[u] == self._indices[u]:
            component = []
            while True:
                w = self._stack.pop()
                self._on_stack[w] = False
                component.append(w)
                if w == u:
                    break
            self.scc_list.append(component)


class DisjointSetUnion:
    """Disjoint Set Union (DSU) with Path Compression and Union by Rank."""

    def __init__(self, elements: List[str]):
        self.parent: Dict[str, str] = {x: x for x in elements}
        self.rank: Dict[str, int] = {x: 0 for x in elements}

    def find(self, i: str) -> str:
        """Finds representative of set with path compression."""
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i: str, j: str) -> bool:
        """Unites sets containing i and j by rank. Returns False if already in same set."""
        root_i = self.find(i)
        root_j = self.find(j)

        if root_i == root_j:
            return False

        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
        return True


class KruskalMST:
    """
    Kruskal's Minimum Spanning Tree (MST) algorithm.
    Optimizes logistics warehouse interconnections and fiber network cabling.
    Time Complexity: O(E log E)
    Space Complexity: O(V)
    """

    def compute_mst(self, graph: AdjacencyListGraph) -> Tuple[float, List[GraphEdge]]:
        """Returns: (total_mst_cost, list_of_selected_edges)"""
        edges = graph.get_edges()
        # Sort edges in ascending order of weight
        edges.sort(key=lambda e: e.weight)

        dsu = DisjointSetUnion(list(graph.vertices.keys()))
        mst_edges: List[GraphEdge] = []
        total_cost = 0.0

        for edge in edges:
            if dsu.union(edge.source, edge.destination):
                mst_edges.append(edge)
                total_cost += edge.weight
                if len(mst_edges) == len(graph.vertices) - 1:
                    break

        return round(total_cost, 2), mst_edges


class TopologicalSorter:
    """
    Kahn's Algorithm for Topological Sorting using In-Degree queueing.
    Resolves dependency order in execution graphs.
    Time Complexity: O(V + E)
    """

    def sort(self, graph: AdjacencyListGraph) -> Tuple[bool, List[str]]:
        """Returns (is_dag, topological_order_list)."""
        in_degree: Dict[str, int] = {v: 0 for v in graph.vertices}

        for u in graph.vertices:
            for v, _ in graph.get_neighbors(u):
                in_degree[v] = in_degree.get(v, 0) + 1

        queue = deque([v for v, deg in in_degree.items() if deg == 0])
        order = []

        while queue:
            u = queue.popleft()
            order.append(u)

            for v, _ in graph.get_neighbors(u):
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

        is_dag = len(order) == len(graph.vertices)
        return is_dag, order
