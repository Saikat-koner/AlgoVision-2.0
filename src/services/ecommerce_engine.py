"""
E-Commerce Catalog & Real-Time Discovery Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Integrates Dynamic Array Cataloging, AVL Tree Price Filtering, Dual-Pivot QuickSort,
Streaming Top-K Trending Heap, and Fuzzy LCS Search.
"""

from typing import Any, Dict, List, Optional, Tuple
from ..data_structures.dynamic_array import CatalogIndexTable
from ..data_structures.binary_search_tree import ProductPriceTree
from ..data_structures.binary_heap import TopKTrendingStream
from ..algorithms.sorting_algorithms import DualPivotQuickSort, ThreeWayPartitionSort
from ..algorithms.search_algorithms import BinarySearchEngine
from ..algorithms.dynamic_programming import LCSSimilarityEngine


class ECommerceEngine:
    """Unified service handling SKU catalog indexing, sorting, range search, and trend streaming."""

    def __init__(self):
        self.catalog = CatalogIndexTable()
        self.price_tree = ProductPriceTree()
        self.top_k_tracker = TopKTrendingStream(k=5)
        self.quicksort = DualPivotQuickSort()
        self.partition_sort = ThreeWayPartitionSort()
        self.binary_search = BinarySearchEngine()
        self.fuzzy_engine = LCSSimilarityEngine()
        self._load_sample_products()

    def _load_sample_products(self) -> None:
        sample_items = [
            ("SKU-101", "Apple iPhone 15 Pro Max (256GB)", "Electronics", 134900.0, 45, 4.8),
            ("SKU-102", "Samsung Galaxy S24 Ultra", "Electronics", 129999.0, 32, 4.7),
            ("SKU-103", "Sony WH-1000XM5 Wireless Headphones", "Audio", 29990.0, 80, 4.6),
            ("SKU-104", "Apple MacBook Pro 16-inch M3 Max", "Computing", 249900.0, 15, 4.9),
            ("SKU-105", "Dell XPS 15 Intel Core i9", "Computing", 189990.0, 20, 4.5),
            ("SKU-106", "Bose QuietComfort 45 Noise Cancelling", "Audio", 24900.0, 60, 4.4),
            ("SKU-107", "Logitech MX Master 3S Wireless Mouse", "Accessories", 8995.0, 150, 4.8),
            ("SKU-108", "Keychron Q1 Pro Mechanical Keyboard", "Accessories", 16999.0, 40, 4.7),
            ("SKU-109", "OnePlus 12 5G (16GB RAM)", "Electronics", 64999.0, 95, 4.5),
            ("SKU-110", "LG C3 55-inch 4K OLED Smart TV", "Electronics", 114990.0, 18, 4.8),
            ("SKU-111", "iPad Air 11-inch M2 Chip", "Electronics", 59900.0, 75, 4.6),
            ("SKU-112", "Sony PlayStation 5 Console (Disc Edition)", "Gaming", 54990.0, 50, 4.9),
            ("SKU-113", "Nintendo Switch OLED Model", "Gaming", 31990.0, 65, 4.7),
            ("SKU-114", "Marshall Stanmore III Bluetooth Speaker", "Audio", 37999.0, 25, 4.5),
            ("SKU-115", "SanDisk 2TB Extreme Portable SSD", "Accessories", 18499.0, 120, 4.6)
        ]

        for sku, title, cat, price, stock, rating in sample_items:
            self.catalog.add_product(sku, title, cat, price, stock, rating)
            self.price_tree.index_product({
                "sku_id": sku, "title": title, "category": cat,
                "price": price, "stock": stock, "rating": rating
            })

    def search_by_price_range(self, min_price: float, max_price: float) -> List[dict]:
        """Sub-millisecond price-range filtering using self-balancing AVL Tree in O(log N + K)."""
        return self.price_tree.query_price_range(min_price, max_price)

    def sort_catalog(self, sort_key: str = "price", ascending: bool = True) -> List[dict]:
        """Sorts catalog dynamically using Dual-Pivot QuickSort."""
        products = self.catalog.products.to_list()
        sorted_prods = self.quicksort.sort(products, key=lambda x: x.get(sort_key, 0))
        if not ascending:
            sorted_prods.reverse()
        return sorted_prods

    def record_product_view_or_purchase(self, sku_id: str, title: str, velocity_score: float) -> None:
        """Streams real-time engagement signal into Top-K trending heap."""
        self.top_k_tracker.process_item(sku_id, title, velocity_score)

    def get_trending_products(self) -> List[dict]:
        """Retrieves top 5 trending products in O(1) peek / O(K log K)."""
        return self.top_k_tracker.get_top_k()

    def fuzzy_search(self, search_query: str, threshold: float = 0.4) -> List[dict]:
        """Typo-tolerant fuzzy product search using Levenshtein distance & LCS."""
        results = []
        for p in self.catalog.products:
            score = self.fuzzy_engine.similarity_score(search_query, p["title"])
            if score >= threshold:
                results.append({
                    "product": p,
                    "similarity_score": score
                })
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results
