"""
Sorting Algorithms Suite
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements Dual-Pivot QuickSort, 3-Way Dutch National Flag Partitioning,
and MergeSort with comparison/swap telemetry and step-by-step state logging.
"""

from typing import Any, Callable, List, Optional, Tuple, TypeVar

T = TypeVar('T')


class DualPivotQuickSort:
    """
    Yaroslavskiy's Dual-Pivot QuickSort algorithm.
    Partitions array into three segments using two pivots (P1 <= P2),
    achieving reduced comparison overhead on modern CPU architectures.
    Time Complexity: Average O(N log N), Worst O(N^2)
    Space Complexity: O(log N) auxiliary recursion stack
    """

    def __init__(self):
        self.comparisons: int = 0
        self.swaps: int = 0
        self.snapshots: List[List[Any]] = []

    def sort(self, arr: List[T], key: Optional[Callable[[T], Any]] = None, record_steps: bool = False) -> List[T]:
        self.comparisons = 0
        self.swaps = 0
        self.snapshots = []
        result = list(arr)
        key_fn = key if key else (lambda x: x)

        if len(result) > 1:
            self._dual_pivot_quicksort(result, 0, len(result) - 1, key_fn, record_steps)

        return result

    def _swap(self, arr: List[T], i: int, j: int) -> None:
        self.swaps += 1
        arr[i], arr[j] = arr[j], arr[i]

    def _dual_pivot_quicksort(self, arr: List[T], low: int, high: int, key_fn: Callable[[T], Any], record_steps: bool) -> None:
        if low >= high:
            return

        # Ensure left pivot <= right pivot
        self.comparisons += 1
        if key_fn(arr[low]) > key_fn(arr[high]):
            self._swap(arr, low, high)

        p1 = key_fn(arr[low])
        p2 = key_fn(arr[high])

        lt = low + 1
        gt = high - 1
        k = low + 1

        while k <= gt:
            self.comparisons += 1
            if key_fn(arr[k]) < p1:
                self._swap(arr, k, lt)
                lt += 1
                k += 1
            elif key_fn(arr[k]) > p2:
                while k < gt and key_fn(arr[gt]) > p2:
                    self.comparisons += 1
                    gt -= 1
                self._swap(arr, k, gt)
                gt -= 1
                self.comparisons += 1
                if key_fn(arr[k]) < p1:
                    self._swap(arr, k, lt)
                    lt += 1
                k += 1
            else:
                k += 1

        lt -= 1
        gt += 1

        # Move pivots to their final partitions
        self._swap(arr, low, lt)
        self._swap(arr, high, gt)

        if record_steps:
            self.snapshots.append(list(arr))

        # Recursively sort three partitions
        self._dual_pivot_quicksort(arr, low, lt - 1, key_fn, record_steps)
        self._dual_pivot_quicksort(arr, lt + 1, gt - 1, key_fn, record_steps)
        self._dual_pivot_quicksort(arr, gt + 1, high, key_fn, record_steps)


class ThreeWayPartitionSort:
    """
    Dutch National Flag (3-Way) Partitioning Sort.
    Highly optimal for datasets with massive key duplication (e.g. status flags, categories).
    Time Complexity: O(N) when duplicate keys dominate, O(N log N) general.
    """

    def __init__(self):
        self.comparisons: int = 0
        self.swaps: int = 0

    def sort(self, arr: List[T], key: Optional[Callable[[T], Any]] = None) -> List[T]:
        self.comparisons = 0
        self.swaps = 0
        result = list(arr)
        key_fn = key if key else (lambda x: x)
        self._quicksort_3way(result, 0, len(result) - 1, key_fn)
        return result

    def _quicksort_3way(self, arr: List[T], low: int, high: int, key_fn: Callable[[T], Any]) -> None:
        if low >= high:
            return

        lt = low
        gt = high
        pivot = key_fn(arr[low])
        i = low + 1

        while i <= gt:
            self.comparisons += 1
            curr_val = key_fn(arr[i])
            if curr_val < pivot:
                self.swaps += 1
                arr[lt], arr[i] = arr[i], arr[lt]
                lt += 1
                i += 1
            elif curr_val > pivot:
                self.swaps += 1
                arr[i], arr[gt] = arr[gt], arr[i]
                gt -= 1
            else:
                i += 1

        self._quicksort_3way(arr, low, lt - 1, key_fn)
        self._quicksort_3way(arr, gt + 1, high, key_fn)


class MergeSort:
    """
    Stable Divide-and-Conquer MergeSort.
    Guarantees strict O(N log N) worst-case time complexity.
    """

    def __init__(self):
        self.comparisons: int = 0

    def sort(self, arr: List[T], key: Optional[Callable[[T], Any]] = None) -> List[T]:
        self.comparisons = 0
        key_fn = key if key else (lambda x: x)
        return self._merge_sort(list(arr), key_fn)

    def _merge_sort(self, arr: List[T], key_fn: Callable[[T], Any]) -> List[T]:
        if len(arr) <= 1:
            return arr

        mid = len(arr) // 2
        left = self._merge_sort(arr[:mid], key_fn)
        right = self._merge_sort(arr[mid:], key_fn)

        return self._merge(left, right, key_fn)

    def _merge(self, left: List[T], right: List[T], key_fn: Callable[[T], Any]) -> List[T]:
        merged = []
        i = j = 0

        while i < len(left) and j < len(right):
            self.comparisons += 1
            if key_fn(left[i]) <= key_fn(right[j]):
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1

        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged
