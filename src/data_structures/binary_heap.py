"""
Binary Heap & Streaming Top-K Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements array-backed Min/Max Binary Heaps with O(N) Floyd heap construction,
O(log N) push/pop, and streaming Top-K trend analysis for e-commerce and fintech risk alerts.
"""

from typing import Any, Callable, Generic, List, Optional, Tuple, TypeVar

T = TypeVar('T')


class BinaryHeap(Generic[T]):
    """
    Array-backed complete binary tree satisfying the heap invariant.
    """

    def __init__(self, is_min_heap: bool = True, key_extractor: Optional[Callable[[T], float]] = None):
        self._data: List[T] = []
        self._is_min_heap: bool = is_min_heap
        self._key_extractor: Callable[[T], float] = key_extractor if key_extractor else (lambda x: float(x))
        self.swap_count: int = 0
        self.comparisons: int = 0

    @property
    def size(self) -> int:
        return len(self._data)

    def is_empty(self) -> bool:
        return len(self._data) == 0

    def _precedes(self, item_a: T, item_b: T) -> bool:
        """Evaluates whether item_a has priority over item_b."""
        self.comparisons += 1
        val_a = self._key_extractor(item_a)
        val_b = self._key_extractor(item_b)
        return val_a < val_b if self._is_min_heap else val_a > val_b

    def push(self, item: T) -> None:
        """Inserts item into heap. Time: O(log N)"""
        self._data.append(item)
        self._sift_up(len(self._data) - 1)

    def pop(self) -> Optional[T]:
        """Extracts extreme element (minimum or maximum). Time: O(log N)"""
        if self.is_empty():
            return None
        if len(self._data) == 1:
            return self._data.pop()

        root = self._data[0]
        self._data[0] = self._data.pop()
        self._sift_down(0)
        return root

    def peek(self) -> Optional[T]:
        """Inspects root without removal. Time: O(1)"""
        return self._data[0] if not self.is_empty() else None

    def _sift_up(self, idx: int) -> None:
        parent = (idx - 1) // 2
        while idx > 0 and self._precedes(self._data[idx], self._data[parent]):
            self._swap(idx, parent)
            idx = parent
            parent = (idx - 1) // 2

    def _sift_down(self, idx: int) -> None:
        n = len(self._data)
        while True:
            target = idx
            left = 2 * idx + 1
            right = 2 * idx + 2

            if left < n and self._precedes(self._data[left], self._data[target]):
                target = left
            if right < n and self._precedes(self._data[right], self._data[target]):
                target = right

            if target != idx:
                self._swap(idx, target)
                idx = target
            else:
                break

    def _swap(self, i: int, j: int) -> None:
        self.swap_count += 1
        self._data[i], self._data[j] = self._data[j], self._data[i]

    def build_heap(self, items: List[T]) -> None:
        """
        Constructs heap in-place from arbitrary list using Floyd's algorithm.
        Time Complexity: O(N) (linear time due to converging series sum)
        """
        self._data = list(items)
        # Sift down all non-leaf nodes starting from last parent
        for i in range((len(self._data) - 2) // 2, -1, -1):
            self._sift_down(i)

    def to_list(self) -> List[T]:
        return list(self._data)


class TopKTrendingStream:
    """
    Maintains the Top-K items with highest score over an unbounded streaming dataset.
    Uses a Min-Heap of bounded size K.
    Memory Complexity: O(K)
    Per-item Time Complexity: O(log K)
    """

    def __init__(self, k: int = 5):
        if k <= 0:
            raise ValueError("K must be positive.")
        self.k = k
        # Min-heap ordered by item score
        self._min_heap = BinaryHeap[dict](
            is_min_heap=True,
            key_extractor=lambda item: float(item.get("score", 0.0))
        )

    def process_item(self, item_id: str, label: str, score: float, metadata: Optional[dict] = None) -> None:
        """Processes a streaming item."""
        record = {
            "id": item_id,
            "label": label,
            "score": float(score),
            "metadata": metadata or {}
        }

        if self._min_heap.size < self.k:
            self._min_heap.push(record)
        else:
            root = self._min_heap.peek()
            if root and score > float(root.get("score", 0.0)):
                self._min_heap.pop()
                self._min_heap.push(record)

    def get_top_k(self) -> List[dict]:
        """Returns the current top K items sorted in descending order of score."""
        items = list(self._min_heap.to_list())
        items.sort(key=lambda x: float(x.get("score", 0.0)), reverse=True)
        return items
