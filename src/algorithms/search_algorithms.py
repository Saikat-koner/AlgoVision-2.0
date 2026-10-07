"""
Search Algorithms Suite
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements Binary Search with Lower/Upper Bounds, Exponential Search,
and Linear Search with iteration and comparison telemetry.
"""

from typing import Any, Callable, List, Optional, Tuple, TypeVar

T = TypeVar('T')


class BinarySearchEngine:
    """
    Binary search engine with exact match, lower-bound, and upper-bound capabilities.
    Time Complexity: O(log N)
    Space Complexity: O(1)
    """

    def __init__(self):
        self.comparisons: int = 0

    def search_exact(self, arr: List[T], target: Any, key: Optional[Callable[[T], Any]] = None) -> int:
        """Returns index of exact match or -1 if not found."""
        self.comparisons = 0
        key_fn = key if key else (lambda x: x)
        low, high = 0, len(arr) - 1

        while low <= high:
            self.comparisons += 1
            mid = (low + high) // 2
            mid_val = key_fn(arr[mid])

            if mid_val == target:
                return mid
            elif mid_val < target:
                low = mid + 1
            else:
                high = mid - 1

        return -1

    def lower_bound(self, arr: List[T], target: Any, key: Optional[Callable[[T], Any]] = None) -> int:
        """
        Finds index of first element with key >= target.
        Time Complexity: O(log N)
        """
        self.comparisons = 0
        key_fn = key if key else (lambda x: x)
        low, high = 0, len(arr)
        while low < high:
            self.comparisons += 1
            mid = (low + high) // 2
            if key_fn(arr[mid]) < target:
                low = mid + 1
            else:
                high = mid
        return low

    def upper_bound(self, arr: List[T], target: Any, key: Optional[Callable[[T], Any]] = None) -> int:
        """
        Finds index of first element with key > target.
        Time Complexity: O(log N)
        """
        self.comparisons = 0
        key_fn = key if key else (lambda x: x)
        low, high = 0, len(arr)
        while low < high:
            self.comparisons += 1
            mid = (low + high) // 2
            if key_fn(arr[mid]) <= target:
                low = mid + 1
            else:
                high = mid
        return low

    def search_range(self, arr: List[T], min_val: Any, max_val: Any, key: Optional[Callable[[T], Any]] = None) -> List[T]:
        """Extracts sublist of elements within [min_val, max_val] in O(log N + K)."""
        idx_low = self.lower_bound(arr, min_val, key)
        idx_high = self.upper_bound(arr, max_val, key)
        return arr[idx_low:idx_high]


class ExponentialSearch:
    """
    Exponential Search for finding elements in sorted lists of unknown/large size.
    Time Complexity: O(log i) where i is target index.
    """

    def __init__(self):
        self.comparisons: int = 0

    def search(self, arr: List[T], target: Any, key: Optional[Callable[[T], Any]] = None) -> int:
        self.comparisons = 0
        if not arr:
            return -1

        key_fn = key if key else (lambda x: x)
        self.comparisons += 1
        if key_fn(arr[0]) == target:
            return 0

        i = 1
        n = len(arr)
        while i < n and key_fn(arr[i]) <= target:
            self.comparisons += 1
            i *= 2

        # Binary search in range [i//2, min(i, n-1)]
        low = i // 2
        high = min(i, n - 1)
        bs = BinarySearchEngine()
        sub_idx = bs.search_exact(arr[low:high + 1], target, key_fn)
        self.comparisons += bs.comparisons
        return (low + sub_idx) if sub_idx != -1 else -1


class LinearSearchEngine:
    """Baseline linear search for asymptotic empirical comparison."""

    def __init__(self):
        self.comparisons: int = 0

    def search(self, arr: List[T], target: Any, key: Optional[Callable[[T], Any]] = None) -> int:
        self.comparisons = 0
        key_fn = key if key else (lambda x: x)
        for idx, item in enumerate(arr):
            self.comparisons += 1
            if key_fn(item) == target:
                return idx
        return -1
