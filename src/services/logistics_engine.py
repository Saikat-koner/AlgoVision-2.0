"""
Logistics & Supply Chain Optimization Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Integrates Dijkstra Routing, Fractional & 0/1 Knapsack Cargo Packing,
Activity Shift Scheduling, Kruskal MST, and Priority Queue Dispatching.
"""

from typing import Any, Dict, List, Optional, Tuple
from ..data_structures.graph_structures import AdjacencyListGraph, GraphEdge
from ..data_structures.queue_engine import PriorityQueue
from ..algorithms.greedy_optimizers import DijkstraRouter, FractionalKnapsackSolver, ActivityScheduler
from ..algorithms.dynamic_programming import Knapsack01Solver
from ..algorithms.graph_algorithms import KruskalMST


class LogisticsEngine:
    """Unified service orchestrating real-world logistics and freight optimization."""

    def __init__(self):
        self.network = AdjacencyListGraph(is_directed=False)
        self.dijkstra = DijkstraRouter()
        self.fractional_knapsack = FractionalKnapsackSolver()
        self.dp_knapsack = Knapsack01Solver()
        self.scheduler = ActivityScheduler()
        self.mst_solver = KruskalMST()
        self.dispatch_queue = PriorityQueue[dict](is_min_heap=False)  # Max priority queue
        self._initialize_default_network()

    def _initialize_default_network(self) -> None:
        """Sets up realistic Indian logistics transport network with hub coordinates."""
        hubs = [
            ("MUM", "Mumbai Central Hub", {"lat": 19.0760, "lng": 72.8777, "tier": "T1"}),
            ("PUN", "Pune Sorting Center", {"lat": 18.5204, "lng": 73.8567, "tier": "T2"}),
            ("AHM", "Ahmedabad Freight Terminal", {"lat": 23.0225, "lng": 72.5714, "tier": "T2"}),
            ("DEL", "Delhi NCR Super Hub", {"lat": 28.7041, "lng": 77.1025, "tier": "T1"}),
            ("BLR", "Bengaluru Tech Hub", {"lat": 12.9716, "lng": 77.5946, "tier": "T1"}),
            ("HYD", "Hyderabad Fulfillment Center", {"lat": 17.3850, "lng": 78.4867, "tier": "T1"}),
            ("CHE", "Chennai Port Gateway", {"lat": 13.0827, "lng": 80.2707, "tier": "T1"}),
            ("KOL", "Kolkata Eastern Hub", {"lat": 22.5726, "lng": 88.3639, "tier": "T1"}),
            ("NAG", "Nagpur Central Transit", {"lat": 21.1458, "lng": 79.0882, "tier": "T2"})
        ]

        for code, name, meta in hubs:
            self.network.add_vertex(code, label=name, metadata=meta)

        routes = [
            ("MUM", "PUN", 148.0),
            ("MUM", "AHM", 524.0),
            ("MUM", "NAG", 815.0),
            ("MUM", "BLR", 984.0),
            ("PUN", "HYD", 560.0),
            ("PUN", "BLR", 840.0),
            ("AHM", "DEL", 930.0),
            ("DEL", "NAG", 1080.0),
            ("DEL", "KOL", 1470.0),
            ("NAG", "HYD", 500.0),
            ("NAG", "KOL", 980.0),
            ("BLR", "CHE", 345.0),
            ("BLR", "HYD", 570.0),
            ("HYD", "CHE", 630.0),
            ("CHE", "KOL", 1660.0)
        ]

        for u, v, dist in routes:
            self.network.add_edge(u, v, weight=dist)

    def route_last_mile(self, origin: str, destination: str) -> dict:
        """Finds optimal transit route and distance between supply chain nodes."""
        dist, path = self.dijkstra.find_shortest_path(self.network, origin, destination)
        return {
            "origin": origin,
            "destination": destination,
            "total_distance_km": dist,
            "path": path,
            "path_labels": [self.network.vertices[node]["label"] for node in path] if path else [],
            "relaxations": self.dijkstra.relaxations_count
        }

    def optimize_truck_cargo(self, truck_capacity_kg: float, shipments: List[dict], allow_fractional: bool = True) -> dict:
        """Maximizes freight value packing for long-haul trucks."""
        if allow_fractional:
            val, packed = self.fractional_knapsack.solve(truck_capacity_kg, shipments)
            return {
                "algorithm": "Greedy Fractional Knapsack",
                "truck_capacity_kg": truck_capacity_kg,
                "total_packed_value_inr": val,
                "items_packed": packed
            }
        else:
            val, packed, _ = self.dp_knapsack.solve(int(truck_capacity_kg), shipments)
            return {
                "algorithm": "Dynamic Programming 0/1 Knapsack",
                "truck_capacity_kg": truck_capacity_kg,
                "total_packed_value_inr": val,
                "items_packed": packed
            }

    def schedule_driver_shifts(self, shifts: List[dict]) -> dict:
        """Schedules maximum conflict-free shifts for delivery fleet."""
        scheduled = self.scheduler.schedule(shifts)
        return {
            "total_available_shifts": len(shifts),
            "allocated_shifts": len(scheduled),
            "schedule": scheduled
        }

    def compute_minimal_warehouse_backbone(self) -> dict:
        """Computes minimum spanning tree to interconnect regional distribution hubs."""
        cost, edges = self.mst_solver.compute_mst(self.network)
        return {
            "total_mst_distance_km": cost,
            "backbone_links_count": len(edges),
            "links": [{"source": e.source, "destination": e.destination, "distance_km": e.weight} for e in edges]
        }

    def queue_urgent_order(self, order_id: str, destination: str, priority_score: float, details: dict) -> None:
        """Enqueues order into priority dispatch buffer."""
        payload = {
            "order_id": order_id,
            "destination": destination,
            "priority": priority_score,
            "details": details
        }
        self.dispatch_queue.push(payload, priority_score)

    def dispatch_next_urgent_order(self) -> Optional[dict]:
        """Pops and dispatches top priority order."""
        return self.dispatch_queue.pop()
