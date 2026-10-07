"""
Graph Representation Structures
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements Adjacency List (sparse graph optimization, O(V + E) memory) and
Adjacency Matrix (dense graph optimization, O(1) edge verification) models.
"""

from typing import Dict, List, Optional, Set, Tuple


class GraphEdge:
    """Represents a weighted directed or undirected connection between graph vertices."""

    def __init__(self, source: str, destination: str, weight: float = 1.0, metadata: Optional[dict] = None):
        self.source: str = source
        self.destination: str = destination
        self.weight: float = float(weight)
        self.metadata: dict = metadata or {}

    def __repr__(self) -> str:
        return f"Edge({self.source} -> {self.destination}, w={self.weight})"


class AdjacencyListGraph:
    """
    Adjacency List Graph representation.
    Memory Complexity: O(V + E)
    Ideal for real-world sparse topologies such as road networks, transaction graphs, and supply chains.
    """

    def __init__(self, is_directed: bool = False):
        self.is_directed: bool = is_directed
        self.vertices: Dict[str, dict] = {}  # vertex_id -> metadata
        self.adjacency: Dict[str, List[GraphEdge]] = {}  # vertex_id -> list of outgoing edges

    @property
    def vertex_count(self) -> int:
        return len(self.vertices)

    @property
    def edge_count(self) -> int:
        total = sum(len(edges) for edges in self.adjacency.values())
        return total if self.is_directed else total // 2

    def add_vertex(self, vertex_id: str, label: Optional[str] = None, metadata: Optional[dict] = None) -> None:
        if vertex_id not in self.vertices:
            meta = metadata or {}
            meta["label"] = label or vertex_id
            self.vertices[vertex_id] = meta
            self.adjacency[vertex_id] = []

    def add_edge(self, u: str, v: str, weight: float = 1.0, metadata: Optional[dict] = None) -> None:
        self.add_vertex(u)
        self.add_vertex(v)

        edge_fwd = GraphEdge(u, v, weight, metadata)
        self.adjacency[u].append(edge_fwd)

        if not self.is_directed:
            edge_rev = GraphEdge(v, u, weight, metadata)
            self.adjacency[v].append(edge_rev)

    def get_neighbors(self, u: str) -> List[Tuple[str, float]]:
        """Returns list of (destination, weight) tuples."""
        if u not in self.adjacency:
            return []
        return [(e.destination, e.weight) for e in self.adjacency[u]]

    def get_edges(self) -> List[GraphEdge]:
        """Returns a list of all distinct edges in the graph."""
        edges = []
        visited_pairs: Set[Tuple[str, str]] = set()
        for u in self.adjacency:
            for edge in self.adjacency[u]:
                pair = (edge.source, edge.destination)
                if not self.is_directed:
                    rev_pair = (edge.destination, edge.source)
                    if rev_pair in visited_pairs:
                        continue
                visited_pairs.add(pair)
                edges.append(edge)
        return edges


class AdjacencyMatrixGraph:
    """
    Adjacency Matrix Graph representation.
    Memory Complexity: O(V^2)
    Provides strict O(1) edge existence queries.
    """

    def __init__(self, vertex_ids: List[str], is_directed: bool = False):
        self.is_directed: bool = is_directed
        self.vertex_ids: List[str] = list(vertex_ids)
        self.index_map: Dict[str, int] = {v: idx for idx, v in enumerate(self.vertex_ids)}
        n = len(self.vertex_ids)
        # Initialize matrix with infinity (no connection)
        self.matrix: List[List[float]] = [[float('inf')] * n for _ in range(n)]
        for i in range(n):
            self.matrix[i][i] = 0.0  # Distance to self is 0

    def add_edge(self, u: str, v: str, weight: float) -> None:
        if u in self.index_map and v in self.index_map:
            i, j = self.index_map[u], self.index_map[v]
            self.matrix[i][j] = float(weight)
            if not self.is_directed:
                self.matrix[j][i] = float(weight)

    def get_weight(self, u: str, v: str) -> float:
        if u in self.index_map and v in self.index_map:
            return self.matrix[self.index_map[u]][self.index_map[v]]
        return float('inf')
