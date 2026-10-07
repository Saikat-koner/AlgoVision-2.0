"""
Unit Tests for AlgoVision 2.0 Core Algorithms
"""

import unittest
from src.algorithms.sorting_algorithms import DualPivotQuickSort, ThreeWayPartitionSort, MergeSort
from src.algorithms.search_algorithms import BinarySearchEngine, ExponentialSearch
from src.algorithms.greedy_optimizers import DijkstraRouter, FractionalKnapsackSolver, HuffmanEncoder, ActivityScheduler
from src.algorithms.dynamic_programming import Knapsack01Solver, LCSSimilarityEngine, FloydWarshallArbitrage
from src.algorithms.graph_algorithms import BFSExplorer, DFSCycleDetector, TarjanSCC, KruskalMST, TopologicalSorter
from src.data_structures.graph_structures import AdjacencyListGraph


class TestSortingAlgorithms(unittest.TestCase):

    def test_dual_pivot_quicksort(self):
        sorter = DualPivotQuickSort()
        arr = [42, 17, 89, 5, 23, 71, 10, 3, 99, 14]
        sorted_arr = sorter.sort(arr)
        self.assertEqual(sorted_arr, sorted(arr))

    def test_three_way_partition_sort(self):
        sorter = ThreeWayPartitionSort()
        arr = [2, 0, 1, 2, 1, 0, 2, 0, 1, 2]
        sorted_arr = sorter.sort(arr)
        self.assertEqual(sorted_arr, [0, 0, 0, 1, 1, 1, 2, 2, 2, 2])

    def test_mergesort(self):
        sorter = MergeSort()
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = sorter.sort(arr)
        self.assertEqual(sorted_arr, sorted(arr))


class TestSearchAlgorithms(unittest.TestCase):

    def test_binary_search_bounds(self):
        engine = BinarySearchEngine()
        arr = [10, 20, 20, 20, 30, 40, 50]
        self.assertEqual(engine.search_exact(arr, 30), 4)
        self.assertEqual(engine.search_exact(arr, 99), -1)
        self.assertEqual(engine.lower_bound(arr, 20), 1)
        self.assertEqual(engine.upper_bound(arr, 20), 4)
        self.assertEqual(engine.search_range(arr, 20, 40), [20, 20, 20, 30, 40])

    def test_exponential_search(self):
        exp_search = ExponentialSearch()
        arr = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
        self.assertEqual(exp_search.search(arr, 64), 5)
        self.assertEqual(exp_search.search(arr, 999), -1)


class TestGreedyOptimizers(unittest.TestCase):

    def test_dijkstra_router(self):
        graph = AdjacencyListGraph()
        graph.add_edge("A", "B", 4.0)
        graph.add_edge("A", "C", 2.0)
        graph.add_edge("C", "B", 1.0)
        graph.add_edge("B", "D", 5.0)
        graph.add_edge("C", "D", 8.0)

        router = DijkstraRouter()
        dist, path = router.find_shortest_path(graph, "A", "D")
        self.assertEqual(dist, 8.0)
        self.assertEqual(path, ["A", "C", "B", "D"])

    def test_fractional_knapsack(self):
        solver = FractionalKnapsackSolver()
        items = [
            {"name": "Electronics", "value": 280.0, "weight": 40.0},  # density = 7.0
            {"name": "Garments", "value": 100.0, "weight": 10.0},     # density = 10.0
            {"name": "Cosmetics", "value": 120.0, "weight": 20.0},    # density = 6.0
            {"name": "Hardware", "value": 120.0, "weight": 24.0}      # density = 5.0
        ]
        val, packed = solver.solve(capacity=60.0, items=items)
        # Best order: Garments (10kg, 100v), Electronics (40kg, 280v), Cosmetics (10kg/20kg -> 60v). Total = 440.0
        self.assertEqual(val, 440.0)

    def test_huffman_encoding(self):
        encoder = HuffmanEncoder()
        text = "ABRACADABRA_LOGISTICS_TELEMETRY"
        bits, savings = encoder.encode(text)
        self.assertGreater(len(bits), 0)
        self.assertGreater(savings, 20.0)  # At least 20% lossless compression


class TestDynamicProgramming(unittest.TestCase):

    def test_knapsack_01(self):
        solver = Knapsack01Solver()
        items = [
            {"name": "Item1", "value": 60.0, "weight": 10},
            {"name": "Item2", "value": 100.0, "weight": 20},
            {"name": "Item3", "value": 120.0, "weight": 30}
        ]
        max_val, selected, dp = solver.solve(capacity=50, items=items)
        self.assertEqual(max_val, 220.0)
        selected_names = [item["name"] for item in selected]
        self.assertEqual(selected_names, ["Item2", "Item3"])

    def test_lcs_and_levenshtein(self):
        engine = LCSSimilarityEngine()
        lcs_len, lcs_str, _ = engine.lcs("IPHONE15", "IPHONE14PRO")
        self.assertEqual(lcs_str.upper(), "IPHONE1")

        dist = engine.levenshtein_distance("MacBook", "MackBook")
        self.assertEqual(dist, 1)

        sim = engine.similarity_score("Samsung", "Samsong")
        self.assertGreater(sim, 0.8)

    def test_floyd_warshall_arbitrage(self):
        fx = FloydWarshallArbitrage(["USD", "EUR", "GBP"])
        # Intentional profitable cycle: USD -> EUR -> GBP -> USD
        fx.add_exchange_rate("USD", "EUR", 0.90)
        fx.add_exchange_rate("EUR", "GBP", 0.90)
        fx.add_exchange_rate("GBP", "USD", 1.30)  # 0.90 * 0.90 * 1.30 = 1.053 (> 1.0)
        opportunities = fx.detect_arbitrage_opportunities()
        self.assertGreater(len(opportunities), 0)
        self.assertGreater(opportunities[0]["profit_percentage"], 0.0)


class TestGraphAlgorithms(unittest.TestCase):

    def test_kruskal_mst(self):
        graph = AdjacencyListGraph()
        graph.add_edge("A", "B", 1.0)
        graph.add_edge("B", "C", 2.0)
        graph.add_edge("A", "C", 5.0)
        graph.add_edge("C", "D", 3.0)

        mst_solver = KruskalMST()
        cost, edges = mst_solver.compute_mst(graph)
        self.assertEqual(cost, 6.0)
        self.assertEqual(len(edges), 3)

    def test_tarjan_scc(self):
        graph = AdjacencyListGraph(is_directed=True)
        # Cycle 1: A -> B -> C -> A
        graph.add_edge("A", "B")
        graph.add_edge("B", "C")
        graph.add_edge("C", "A")
        # Separate node D
        graph.add_edge("C", "D")

        scc_detector = TarjanSCC()
        sccs = scc_detector.find_scc(graph)
        multinodes = [c for c in sccs if len(c) > 1]
        self.assertEqual(len(multinodes), 1)
        self.assertEqual(set(multinodes[0]), {"A", "B", "C"})


if __name__ == '__main__':
    unittest.main()
