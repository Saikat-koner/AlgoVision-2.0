"""
High-Precision Algorithmic Benchmark Runner
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Executes empirical microsecond benchmarks across data structure and algorithm implementations.
"""

import sys
import os
from pathlib import Path

# Ensure root directory is on sys.path for direct script execution
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import time
import random
from typing import List
from src.data_structures.hash_table import ChainedHashTable, LinearProbingHashTable
from src.data_structures.binary_search_tree import AVLTree
from src.algorithms.sorting_algorithms import DualPivotQuickSort, MergeSort
from src.algorithms.search_algorithms import BinarySearchEngine, LinearSearchEngine
from src.algorithms.greedy_optimizers import DijkstraRouter, FractionalKnapsackSolver
from src.algorithms.dynamic_programming import Knapsack01Solver
from src.data_structures.graph_structures import AdjacencyListGraph


def benchmark_sorting():
    print("\n" + "=" * 70)
    print(" 📊 BENCHMARK 1: Sorting Algorithms (Execution Time & Comparisons)")
    print("=" * 70)
    sizes = [500, 2000, 5000]
    dp_qs = DualPivotQuickSort()
    ms = MergeSort()

    for n in sizes:
        test_data = [random.randint(1, 100000) for _ in range(n)]

        # Dual-Pivot QuickSort
        t0 = time.perf_counter()
        sorted_dp = dp_qs.sort(test_data)
        t_dp = (time.perf_counter() - t0) * 1000.0

        # MergeSort
        t0 = time.perf_counter()
        sorted_ms = ms.sort(test_data)
        t_ms = (time.perf_counter() - t0) * 1000.0

        print(f" [N = {n:4d}] Dual-Pivot QuickSort: {t_dp:6.2f} ms ({dp_qs.comparisons:7d} comps) | "
              f"MergeSort: {t_ms:6.2f} ms ({ms.comparisons:7d} comps)")


def benchmark_searching():
    print("\n" + "=" * 70)
    print(" 📊 BENCHMARK 2: Search Engine (AVL Tree vs Binary Search vs Linear)")
    print("=" * 70)
    n = 10000
    sorted_data = sorted([random.randint(1, 500000) for _ in range(n)])
    target = sorted_data[n // 2]

    # AVL Tree
    tree = AVLTree[int, int]()
    for val in sorted_data:
        tree.insert(val, val)

    # 1. Linear Search
    ls = LinearSearchEngine()
    t0 = time.perf_counter()
    for _ in range(100):
        ls.search(sorted_data, target)
    t_ls = ((time.perf_counter() - t0) / 100.0) * 1e6

    # 2. Binary Search
    bs = BinarySearchEngine()
    t0 = time.perf_counter()
    for _ in range(100):
        bs.search_exact(sorted_data, target)
    t_bs = ((time.perf_counter() - t0) / 100.0) * 1e6

    # 3. AVL Tree Search
    t0 = time.perf_counter()
    for _ in range(100):
        tree.search(target)
    t_avl = ((time.perf_counter() - t0) / 100.0) * 1e6

    print(f" Dataset Size: N = {n}")
    print(f" • Linear Search O(N)       : {t_ls:8.2f} µs per query (Avg {ls.comparisons} comps)")
    print(f" • Binary Search O(log N)   : {t_bs:8.2f} µs per query (Avg {bs.comparisons} comps)")
    print(f" • AVL Tree Search O(log N) : {t_avl:8.2f} µs per query (Strict Height Balance)")


def benchmark_optimizers():
    print("\n" + "=" * 70)
    print(" 📊 BENCHMARK 3: Cargo Optimization (Greedy vs 0/1 DP Knapsack)")
    print("=" * 70)
    n = 20
    capacity = 150
    items = [{"name": f"Item_{i}", "value": random.randint(50, 500), "weight": random.randint(5, 30)} for i in range(n)]

    # Greedy Fractional
    frac_solver = FractionalKnapsackSolver()
    t0 = time.perf_counter()
    frac_val, _ = frac_solver.solve(capacity, items)
    t_frac = (time.perf_counter() - t0) * 1e6

    # 0/1 DP
    dp_solver = Knapsack01Solver()
    t0 = time.perf_counter()
    dp_val, _, _ = dp_solver.solve(capacity, items)
    t_dp = (time.perf_counter() - t0) * 1e6

    print(f" Items: {n}, Truck Capacity: {capacity} kg")
    print(f" • Greedy Fractional O(N log N) : {t_frac:7.2f} µs | Packed Value: ₹{frac_val}")
    print(f" • Dynamic Prog 0/1  O(N * W)   : {t_dp:7.2f} µs | Packed Value: ₹{dp_val}")


if __name__ == '__main__':
    print("\n" + "#" * 70)
    print("   ALGOVISION 2.0 — EMPIRICAL ALGORITHMIC COMPLEXITY BENCHMARKS")
    print("#" * 70)
    benchmark_sorting()
    benchmark_searching()
    benchmark_optimizers()
    print("\n" + "=" * 70)
    print(" ✅ All empirical benchmarks completed successfully.")
    print("=" * 70 + "\n")
