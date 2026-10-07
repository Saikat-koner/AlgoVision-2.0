"""
Data Ingestion Queue Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements fundamental queue structures tailored for high-throughput stream
ingestion, event buffering, and priority-driven dispatching.
"""

from typing import Any, Generic, List, Optional, Tuple, TypeVar
import time

T = TypeVar('T')


class CircularQueue(Generic[T]):
    """
    Fixed-capacity circular FIFO buffer.

    Eliminates linear array shifting overhead by utilizing modular arithmetic
    pointers (head and tail) to achieve strict O(1) enqueue and dequeue operations.
    Ideal for fixed-memory IoT telemetry ingestion and burst rate regulation.
    """

    def __init__(self, capacity: int = 100):
        if capacity <= 0:
            raise ValueError("Capacity must be a positive integer.")
        self._capacity: int = capacity
        self._buffer: List[Optional[T]] = [None] * capacity
        self._head: int = 0
        self._tail: int = 0
        self._size: int = 0

    @property
    def capacity(self) -> int:
        return self._capacity

    @property
    def size(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self._size == 0

    def is_full(self) -> bool:
        return self._size == self._capacity

    def enqueue(self, item: T) -> bool:
        """
        Appends an element to the rear of the circular queue.
        Time Complexity: O(1)
        """
        if self.is_full():
            return False  # Buffer overflow prevention
        self._buffer[self._tail] = item
        self._tail = (self._tail + 1) % self._capacity
        self._size += 1
        return True

    def dequeue(self) -> Optional[T]:
        """
        Extracts and returns the front element from the queue.
        Time Complexity: O(1)
        """
        if self.is_empty():
            return None
        item = self._buffer[self._head]
        self._buffer[self._head] = None  # Prevent lingering object references
        self._head = (self._head + 1) % self._capacity
        self._size -= 1
        return item

    def peek(self) -> Optional[T]:
        """Returns the front element without removing it. Time Complexity: O(1)"""
        if self.is_empty():
            return None
        return self._buffer[self._head]

    def to_list(self) -> List[T]:
        """Serializes current queue elements in logical FIFO order."""
        result = []
        for i in range(self._size):
            idx = (self._head + i) % self._capacity
            result.append(self._buffer[idx])
        return result

    def __repr__(self) -> str:
        return f"CircularQueue(size={self._size}/{self._capacity}, items={self.to_list()})"


class PriorityQueue(Generic[T]):
    """
    Array-backed binary heap priority queue.

    Provides O(log N) insertion and O(log N) extraction of the highest-priority element.
    Maintains FIFO tie-breaking for items sharing identical numerical priority.
    """

    def __init__(self, is_min_heap: bool = False):
        # Stored elements: (priority, tie_breaker_seq, item)
        self._heap: List[Tuple[float, int, T]] = []
        self._is_min_heap: bool = is_min_heap
        self._counter: int = 0

    @property
    def size(self) -> int:
        return len(self._heap)

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def _compare(self, a_priority: float, b_priority: float) -> bool:
        """Returns True if a has higher precedence than b."""
        if self._is_min_heap:
            return a_priority < b_priority
        return a_priority > b_priority

    def push(self, item: T, priority: float) -> None:
        """
        Inserts an item with assigned numerical priority.
        Time Complexity: O(log N)
        """
        self._counter += 1
        entry = (priority, self._counter, item)
        self._heap.append(entry)
        self._sift_up(len(self._heap) - 1)

    def pop(self) -> Optional[T]:
        """
        Extracts and returns the highest-priority item.
        Time Complexity: O(log N)
        """
        if self.is_empty():
            return None
        if len(self._heap) == 1:
            return self._heap.pop()[2]

        top_item = self._heap[0][2]
        self._heap[0] = self._heap.pop()
        self._sift_down(0)
        return top_item

    def peek(self) -> Optional[T]:
        """Returns highest priority item without removal. Time Complexity: O(1)"""
        if self.is_empty():
            return None
        return self._heap[0][2]

    def _sift_up(self, index: int) -> None:
        parent = (index - 1) // 2
        while index > 0 and self._compare(self._heap[index][0], self._heap[parent][0]):
            self._heap[index], self._heap[parent] = self._heap[parent], self._heap[index]
            index = parent
            parent = (index - 1) // 2

    def _sift_down(self, index: int) -> None:
        length = len(self._heap)
        while True:
            target = index
            left = 2 * index + 1
            right = 2 * index + 2

            if left < length and self._compare(self._heap[left][0], self._heap[target][0]):
                target = left
            if right < length and self._compare(self._heap[right][0], self._heap[target][0]):
                target = right

            if target != index:
                self._heap[index], self._heap[target] = self._heap[target], self._heap[index]
                index = target
            else:
                break


class BatchIngestionBuffer:
    """
    Orchestrates high-speed micro-batching of incoming records.
    Combines circular FIFO storage with batch trigger thresholds.
    """

    def __init__(self, batch_size: int = 50, flush_interval_ms: int = 500):
        self.queue = CircularQueue[dict](capacity=batch_size * 4)
        self.batch_size = batch_size
        self.flush_interval_ms = flush_interval_ms
        self.last_flush_time = time.time()
        self.processed_batches: List[List[dict]] = []

    def ingest(self, record: dict) -> bool:
        """Enqueues incoming record and returns True if batch threshold triggered."""
        success = self.queue.enqueue(record)
        if not success:
            # Emergency flush if buffer capacity breached
            self.flush()
            self.queue.enqueue(record)

        current_time = time.time()
        time_elapsed_ms = (current_time - self.last_flush_time) * 1000

        if self.queue.size >= self.batch_size or time_elapsed_ms >= self.flush_interval_ms:
            self.flush()
            return True
        return False

    def flush(self) -> List[dict]:
        """Drains the buffer and produces a contiguous batch for downstream processing."""
        batch = []
        while not self.queue.is_empty():
            item = self.queue.dequeue()
            if item is not None:
                batch.append(item)
        if batch:
            self.processed_batches.append(batch)
        self.last_flush_time = time.time()
        return batch
