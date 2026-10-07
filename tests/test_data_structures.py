"""
Unit Tests for AlgoVision 2.0 Core Data Structures
"""

import unittest
from src.data_structures.queue_engine import CircularQueue, PriorityQueue, BatchIngestionBuffer
from src.data_structures.hash_table import ChainedHashTable, LinearProbingHashTable, TransactionDeduplicator
from src.data_structures.dynamic_array import DynamicArray, CatalogIndexTable
from src.data_structures.binary_search_tree import AVLTree, ProductPriceTree
from src.data_structures.binary_heap import BinaryHeap, TopKTrendingStream
from src.data_structures.graph_structures import AdjacencyListGraph, AdjacencyMatrixGraph


class TestQueueEngine(unittest.TestCase):

    def test_circular_queue_basic(self):
        cq = CircularQueue[int](capacity=3)
        self.assertTrue(cq.is_empty())
        self.assertTrue(cq.enqueue(10))
        self.assertTrue(cq.enqueue(20))
        self.assertTrue(cq.enqueue(30))
        self.assertTrue(cq.is_full())
        self.assertFalse(cq.enqueue(40))  # Full

        self.assertEqual(cq.peek(), 10)
        self.assertEqual(cq.dequeue(), 10)
        self.assertTrue(cq.enqueue(40))  # Wraparound
        self.assertEqual(cq.to_list(), [20, 30, 40])
        self.assertEqual(cq.dequeue(), 20)
        self.assertEqual(cq.dequeue(), 30)
        self.assertEqual(cq.dequeue(), 40)
        self.assertTrue(cq.is_empty())

    def test_priority_queue(self):
        pq = PriorityQueue[str](is_min_heap=False)  # Max heap
        pq.push("Low Priority Order", priority=10.0)
        pq.push("Emergency Medical Express", priority=95.0)
        pq.push("Standard Freight", priority=40.0)

        self.assertEqual(pq.pop(), "Emergency Medical Express")
        self.assertEqual(pq.pop(), "Standard Freight")
        self.assertEqual(pq.pop(), "Low Priority Order")
        self.assertIsNone(pq.pop())


class TestHashTable(unittest.TestCase):

    def test_chained_hash_table_dynamic_resizing(self):
        ht = ChainedHashTable[str, int](initial_capacity=4, max_load_factor=0.75)
        for i in range(20):
            ht.put(f"key_{i}", i * 100)

        self.assertEqual(ht.size, 20)
        self.assertGreater(ht.capacity, 4)  # Resized
        for i in range(20):
            self.assertEqual(ht.get(f"key_{i}"), i * 100)

        self.assertTrue(ht.delete("key_5"))
        self.assertFalse(ht.contains("key_5"))
        self.assertIsNone(ht.get("key_5"))

    def test_linear_probing_hash_table(self):
        lp = LinearProbingHashTable[str, str](initial_capacity=4)
        lp.put("ORD-1", "Created")
        lp.put("ORD-2", "Shipped")
        lp.put("ORD-3", "Delivered")

        self.assertEqual(lp.get("ORD-2"), "Shipped")
        self.assertTrue(lp.delete("ORD-2"))
        self.assertIsNone(lp.get("ORD-2"))
        self.assertEqual(lp.get("ORD-3"), "Delivered")


class TestDynamicArray(unittest.TestCase):

    def test_dynamic_array_operations(self):
        arr = DynamicArray[int](initial_capacity=4)
        for i in range(10):
            arr.append(i * 5)

        self.assertEqual(len(arr), 10)
        self.assertEqual(arr[3], 15)
        arr[3] = 999
        self.assertEqual(arr[3], 999)

        removed = arr.remove_at(0)
        self.assertEqual(removed, 0)
        self.assertEqual(len(arr), 9)


class TestAVLTree(unittest.TestCase):

    def test_avl_tree_balance_and_rotations(self):
        tree = AVLTree[int, str]()
        # Insert in descending order to trigger right rotations (LL cases)
        keys = [50, 40, 30, 20, 10]
        for k in keys:
            tree.insert(k, f"val_{k}")

        self.assertEqual(tree.size, 5)
        self.assertLessEqual(abs(tree.root.balance_factor), 1)

        # In-order traversal must be strictly ascending
        traversal = tree.in_order_traversal()
        sorted_keys = [k for k, _ in traversal]
        self.assertEqual(sorted_keys, [10, 20, 30, 40, 50])

        # Range query
        range_results = tree.find_in_range(20, 45)
        range_keys = [k for k, _ in range_results]
        self.assertEqual(range_keys, [20, 30, 40])


class TestBinaryHeap(unittest.TestCase):

    def test_min_heap_and_floyd_build(self):
        heap = BinaryHeap[int](is_min_heap=True)
        items = [45, 12, 89, 3, 27, 56]
        heap.build_heap(items)

        extracted = []
        while not heap.is_empty():
            extracted.append(heap.pop())

        self.assertEqual(extracted, [3, 12, 27, 45, 56, 89])

    def test_top_k_streaming(self):
        tracker = TopKTrendingStream(k=3)
        tracker.process_item("SKU-1", "Product A", 10.0)
        tracker.process_item("SKU-2", "Product B", 50.0)
        tracker.process_item("SKU-3", "Product C", 30.0)
        tracker.process_item("SKU-4", "Product D", 90.0)
        tracker.process_item("SKU-5", "Product E", 75.0)

        top = tracker.get_top_k()
        top_ids = [item["id"] for item in top]
        self.assertEqual(top_ids, ["SKU-4", "SKU-5", "SKU-2"])


if __name__ == '__main__':
    unittest.main()
