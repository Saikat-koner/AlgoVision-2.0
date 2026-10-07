"""
Greedy Optimization Suite
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements Dijkstra's Shortest Path Routing, Fractional Knapsack Cargo Packing,
Huffman Stream Compression, and Activity Interval Scheduling.
"""

from typing import Any, Dict, List, Optional, Tuple
import heapq
from ..data_structures.graph_structures import AdjacencyListGraph


class DijkstraRouter:
    """
    Dijkstra's Single Source Shortest Path (SSSP) algorithm using Min-Heap priority queue.
    Time Complexity: O((V + E) log V)
    Space Complexity: O(V)
    """

    def __init__(self):
        self.relaxations_count: int = 0
        self.visited_sequence: List[str] = []

    def find_shortest_path(self, graph: AdjacencyListGraph, start_node: str, end_node: str) -> Tuple[float, List[str]]:
        self.relaxations_count = 0
        self.visited_sequence = []

        if start_node not in graph.vertices or end_node not in graph.vertices:
            return float('inf'), []

        distances: Dict[str, float] = {v: float('inf') for v in graph.vertices}
        previous: Dict[str, Optional[str]] = {v: None for v in graph.vertices}
        distances[start_node] = 0.0

        # Min-heap storing: (distance, vertex_id)
        pq: List[Tuple[float, str]] = [(0.0, start_node)]

        while pq:
            curr_dist, u = heapq.heappop(pq)

            if curr_dist > distances[u]:
                continue

            self.visited_sequence.append(u)

            if u == end_node:
                break

            for v, weight in graph.get_neighbors(u):
                if weight < 0:
                    raise ValueError("Dijkstra does not support negative edge weights.")

                new_dist = curr_dist + weight
                if new_dist < distances[v]:
                    self.relaxations_count += 1
                    distances[v] = new_dist
                    previous[v] = u
                    heapq.heappush(pq, (new_dist, v))

        # Reconstruct path from start to end
        path = []
        curr = end_node
        while curr is not None:
            path.append(curr)
            curr = previous[curr]
        path.reverse()

        if path and path[0] == start_node:
            return distances[end_node], path
        return float('inf'), []


class FractionalKnapsackSolver:
    """
    Greedy Continuous Knapsack optimization for logistics freight and cargo packing.
    Sorts items by value-to-weight density in descending order.
    Time Complexity: O(N log N)
    Space Complexity: O(N)
    """

    def solve(self, capacity: float, items: List[dict]) -> Tuple[float, List[dict]]:
        """
        items: List of dicts containing 'name', 'value', 'weight'.
        Returns: (total_max_value, packed_items_list)
        """
        # Calculate density for each item
        enriched = []
        for itm in items:
            w = float(itm['weight'])
            v = float(itm['value'])
            density = v / w if w > 0 else 0.0
            enriched.append({
                'name': itm.get('name', 'Item'),
                'value': v,
                'weight': w,
                'density': density,
                'original': itm
            })

        # Sort by density descending
        enriched.sort(key=lambda x: x['density'], reverse=True)

        remaining_capacity = float(capacity)
        total_value = 0.0
        packed_breakdown = []

        for itm in enriched:
            if remaining_capacity <= 0:
                break

            if itm['weight'] <= remaining_capacity:
                # Take full item
                remaining_capacity -= itm['weight']
                total_value += itm['value']
                packed_breakdown.append({
                    'name': itm['name'],
                    'fraction': 1.0,
                    'packed_weight': itm['weight'],
                    'packed_value': itm['value'],
                    'density': itm['density']
                })
            else:
                # Take fractional slice
                fraction = remaining_capacity / itm['weight']
                val = itm['value'] * fraction
                total_value += val
                packed_breakdown.append({
                    'name': itm['name'],
                    'fraction': round(fraction, 4),
                    'packed_weight': remaining_capacity,
                    'packed_value': round(val, 2),
                    'density': itm['density']
                })
                remaining_capacity = 0

        return round(total_value, 2), packed_breakdown


class HuffmanNode:
    """Node element for building Huffman optimal prefix coding tree."""

    def __init__(self, char: Optional[str], freq: int, left: Optional['HuffmanNode'] = None, right: Optional['HuffmanNode'] = None):
        self.char: Optional[str] = char
        self.freq: int = freq
        self.left: Optional['HuffmanNode'] = left
        self.right: Optional['HuffmanNode'] = right

    def __lt__(self, other: 'HuffmanNode') -> bool:
        return self.freq < other.freq


class HuffmanEncoder:
    """
    Huffman lossless coding engine for telemetry data stream compression.
    Time Complexity: O(N log K) where K is unique character count.
    """

    def __init__(self):
        self.codes: Dict[str, str] = {}
        self.reverse_codes: Dict[str, str] = {}

    def build_tree(self, text: str) -> Optional[HuffmanNode]:
        if not text:
            return None

        # Step 1: Calculate character frequencies
        freq_map: Dict[str, int] = {}
        for ch in text:
            freq_map[ch] = freq_map.get(ch, 0) + 1

        # Step 2: Build priority queue
        heap: List[HuffmanNode] = [HuffmanNode(char=ch, freq=frq) for ch, frq in freq_map.items()]
        heapq.heapify(heap)

        if len(heap) == 1:
            # Single character edge case
            sole_node = heapq.heappop(heap)
            root = HuffmanNode(char=None, freq=sole_node.freq, left=sole_node)
            return root

        # Step 3: Combine two lowest frequency nodes greedily
        while len(heap) > 1:
            left = heapq.heappop(heap)
            right = heapq.heappop(heap)
            merged = HuffmanNode(char=None, freq=left.freq + right.freq, left=left, right=right)
            heapq.heappush(heap, merged)

        return heap[0] if heap else None

    def _generate_codes(self, node: Optional[HuffmanNode], current_code: str) -> None:
        if not node:
            return
        if node.char is not None:
            self.codes[node.char] = current_code if current_code else "0"
            self.reverse_codes[self.codes[node.char]] = node.char
            return
        self._generate_codes(node.left, current_code + "0")
        self._generate_codes(node.right, current_code + "1")

    def encode(self, text: str) -> Tuple[str, float]:
        """
        Encodes input string into compressed binary bitstream.
        Returns: (encoded_bitstring, compression_ratio_percentage)
        """
        self.codes = {}
        self.reverse_codes = {}
        if not text:
            return "", 0.0

        root = self.build_tree(text)
        self._generate_codes(root, "")

        encoded_bits = "".join(self.codes[ch] for ch in text)
        original_bits = len(text) * 8
        compressed_bits = len(encoded_bits)
        savings = ((original_bits - compressed_bits) / original_bits) * 100.0 if original_bits > 0 else 0.0

        return encoded_bits, round(savings, 2)


class ActivityScheduler:
    """
    Greedy Activity Selection / Driver Shift Scheduler.
    Selects maximum set of mutually compatible shifts by ordering by earliest finish time.
    Time Complexity: O(N log N)
    """

    def schedule(self, activities: List[dict]) -> List[dict]:
        """
        activities: list of dicts with 'id', 'start', 'finish', 'name'.
        Returns non-conflicting subset maximizing shift utilization.
        """
        if not activities:
            return []

        # Sort strictly by finish time
        sorted_acts = sorted(activities, key=lambda a: float(a['finish']))
        selected = [sorted_acts[0]]
        last_finish = float(sorted_acts[0]['finish'])

        for act in sorted_acts[1:]:
            if float(act['start']) >= last_finish:
                selected.append(act)
                last_finish = float(act['finish'])

        return selected
