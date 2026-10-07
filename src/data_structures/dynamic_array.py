"""
Contiguous Dynamic Array & Product Catalog Storage
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements custom dynamic array with geometric growth factor (2x) to ensure
cache-friendly contiguous memory locality and amortized O(1) append operations.
"""

from typing import Any, Callable, Generic, Iterator, List, Optional, TypeVar
import ctypes

T = TypeVar('T')


class DynamicArray(Generic[T]):
    """
    Resizable contiguous array data structure.

    Demonstrates low-level memory block allocation using ctypes py_object arrays.
    Guarantees cache-line spatial locality and O(1) indexed random access.
    """

    def __init__(self, initial_capacity: int = 8):
        if initial_capacity <= 0:
            initial_capacity = 8
        self._capacity: int = initial_capacity
        self._size: int = 0
        self._array: Any = self._make_array(self._capacity)
        self.realloc_count: int = 0

    def __len__(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return self._capacity

    def is_empty(self) -> bool:
        return self._size == 0

    def _make_array(self, capacity: int) -> Any:
        """Allocates raw internal buffer."""
        return (capacity * ctypes.py_object)()

    def _resize(self, new_capacity: int) -> None:
        """Reallocates contiguous block and transfers references. O(N) cost."""
        self.realloc_count += 1
        new_arr = self._make_array(new_capacity)
        for i in range(self._size):
            new_arr[i] = self._array[i]
        self._array = new_arr
        self._capacity = new_capacity

    def append(self, element: T) -> None:
        """
        Appends an element to the end of the dynamic array.
        Amortized Time Complexity: O(1)
        Worst-Case Time Complexity: O(N) (upon geometric doubling)
        """
        if self._size == self._capacity:
            self._resize(2 * self._capacity)
        self._array[self._size] = element
        self._size += 1

    def get(self, index: int) -> T:
        """Retrieves element at index. Time Complexity: O(1)"""
        if index < 0 or index >= self._size:
            raise IndexError(f"Index {index} out of bounds for array of size {self._size}")
        return self._array[index]

    def set(self, index: int, value: T) -> None:
        """Updates element at index. Time Complexity: O(1)"""
        if index < 0 or index >= self._size:
            raise IndexError(f"Index {index} out of bounds for array of size {self._size}")
        self._array[index] = value

    def insert(self, index: int, element: T) -> None:
        """Inserts element at specified index, shifting trailing elements right. Time: O(N)"""
        if index < 0 or index > self._size:
            raise IndexError("Index out of bounds")
        if self._size == self._capacity:
            self._resize(2 * self._capacity)

        # Shift elements right
        for i in range(self._size, index, -1):
            self._array[i] = self._array[i - 1]

        self._array[index] = element
        self._size += 1

    def remove_at(self, index: int) -> T:
        """Removes element at index, shifting trailing elements left. Time: O(N)"""
        if index < 0 or index >= self._size:
            raise IndexError("Index out of bounds")
        removed_item = self._array[index]

        # Shift elements left
        for i in range(index, self._size - 1):
            self._array[i] = self._array[i + 1]

        self._array[self._size - 1] = None
        self._size -= 1

        # Shrink array if size drops below 1/4 capacity
        if 0 < self._size <= self._capacity // 4 and self._capacity > 8:
            self._resize(self._capacity // 2)

        return removed_item

    def to_list(self) -> List[T]:
        """Converts dynamic array to Python list."""
        return [self._array[i] for i in range(self._size)]

    def __getitem__(self, index: int) -> T:
        return self.get(index)

    def __setitem__(self, index: int, value: T) -> None:
        self.set(index, value)

    def __iter__(self) -> Iterator[T]:
        for i in range(self._size):
            yield self._array[i]

    def __repr__(self) -> str:
        return f"DynamicArray(size={self._size}/{self._capacity}, items={self.to_list()})"


class CatalogIndexTable:
    """
    E-Commerce & Logistics product catalog index.
    Maintains contiguous dynamic array storage of SKUs with columnar filtering.
    """

    def __init__(self):
        self.products: DynamicArray[dict] = DynamicArray[dict](initial_capacity=16)

    def add_product(self, sku_id: str, title: str, category: str, price: float, stock: int, rating: float) -> None:
        item = {
            "sku_id": sku_id,
            "title": title,
            "category": category,
            "price": float(price),
            "stock": int(stock),
            "rating": float(rating)
        }
        self.products.append(item)

    def filter_by(self, predicate: Callable[[dict], bool]) -> List[dict]:
        """Applies predicate filter across contiguous memory in O(N)."""
        matches = []
        for p in self.products:
            if predicate(p):
                matches.append(p)
        return matches

    def get_column(self, column_name: str) -> List[Any]:
        """Extracts single column values for batch sorting and statistical analysis."""
        return [p[column_name] for p in self.products]
