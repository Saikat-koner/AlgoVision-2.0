"""
High-Performance Hash Table & Deduplication Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements custom hashing mechanisms, separate chaining, open addressing (linear probing),
dynamic rehashing, and real-time transaction deduplication for fintech and e-commerce.
"""

from typing import Any, Generic, List, Optional, Tuple, TypeVar, Union
import time

K = TypeVar('K')
V = TypeVar('V')


def custom_hash(key: Any, capacity: int, seed: int = 0x9e3779b9) -> int:
    """
    Polynomial rolling hash with bitwise avalanche mixing.
    Ensures uniform distribution across hash slots to minimize clustering.
    """
    key_str = str(key)
    hash_val = seed
    for char in key_str:
        hash_val = ((hash_val << 5) + hash_val) ^ ord(char)
        hash_val &= 0xFFFFFFFF  # Keep within 32-bit integer boundaries

    # Final bit mixing pass (avalanche)
    hash_val ^= (hash_val >> 16)
    hash_val = (hash_val * 0x85ebca6b) & 0xFFFFFFFF
    hash_val ^= (hash_val >> 13)
    return hash_val % capacity


class HashNode(Generic[K, V]):
    """Node element for separate chaining linked lists."""
    def __init__(self, key: K, value: V, next_node: Optional['HashNode[K, V]'] = None):
        self.key: K = key
        self.value: V = value
        self.next: Optional['HashNode[K, V]'] = next_node


class ChainedHashTable(Generic[K, V]):
    """
    Hash Table utilizing Separate Chaining for collision resolution.
    Supports dynamic resizing when load factor exceeds 0.75.
    """

    def __init__(self, initial_capacity: int = 16, max_load_factor: float = 0.75):
        self._capacity: int = max(4, initial_capacity)
        self._buckets: List[Optional[HashNode[K, V]]] = [None] * self._capacity
        self._size: int = 0
        self._max_load_factor: float = max_load_factor
        self.collision_count: int = 0

    @property
    def size(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return self._capacity

    @property
    def load_factor(self) -> float:
        return self._size / self._capacity

    def _resize(self, new_capacity: int) -> None:
        """Rehashes all existing key-value pairs into a larger bucket array."""
        old_buckets = self._buckets
        self._capacity = new_capacity
        self._buckets = [None] * new_capacity
        self._size = 0
        self.collision_count = 0

        for head in old_buckets:
            curr = head
            while curr:
                self.put(curr.key, curr.value)
                curr = curr.next

    def put(self, key: K, value: V) -> None:
        """
        Inserts or updates a key-value mapping.
        Average Time Complexity: O(1)
        Worst-Case Time Complexity: O(N) (without rehashing)
        """
        if self.load_factor >= self._max_load_factor:
            self._resize(self._capacity * 2)

        idx = custom_hash(key, self._capacity)
        head = self._buckets[idx]

        # Traverse bucket chain to check for existing key
        curr = head
        while curr:
            if curr.key == key:
                curr.value = value
                return
            curr = curr.next

        # Collision occurred if bucket was not empty
        if head is not None:
            self.collision_count += 1

        # Prepend new node to bucket chain
        new_node = HashNode(key, value, next_node=head)
        self._buckets[idx] = new_node
        self._size += 1

    def get(self, key: K) -> Optional[V]:
        """Retrieves value corresponding to key. Average Time Complexity: O(1)"""
        idx = custom_hash(key, self._capacity)
        curr = self._buckets[idx]
        while curr:
            if curr.key == key:
                return curr.value
            curr = curr.next
        return None

    def contains(self, key: K) -> bool:
        """Checks if key exists in hash table."""
        return self.get(key) is not None

    def delete(self, key: K) -> bool:
        """Removes key-value entry. Average Time Complexity: O(1)"""
        idx = custom_hash(key, self._capacity)
        curr = self._buckets[idx]
        prev = None

        while curr:
            if curr.key == key:
                if prev is None:
                    self._buckets[idx] = curr.next
                else:
                    prev.next = curr.next
                self._size -= 1
                return True
            prev = curr
            curr = curr.next
        return False

    def keys(self) -> List[K]:
        all_keys = []
        for head in self._buckets:
            curr = head
            while curr:
                all_keys.append(curr.key)
                curr = curr.next
        return all_keys

    def values(self) -> List[V]:
        all_values = []
        for head in self._buckets:
            curr = head
            while curr:
                all_values.append(curr.value)
                curr = curr.next
        return all_values


class LinearProbingHashTable(Generic[K, V]):
    """
    Hash Table utilizing Open Addressing with Linear Probing.
    Employs tombstone markers for safe deletions without breaking probe chains.
    """

    TOMBSTONE = object()

    def __init__(self, initial_capacity: int = 16, max_load_factor: float = 0.65):
        self._capacity: int = max(4, initial_capacity)
        self._keys: List[Any] = [None] * self._capacity
        self._values: List[Any] = [None] * self._capacity
        self._size: int = 0
        self._max_load_factor: float = max_load_factor
        self.probes_count: int = 0

    @property
    def size(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return self._capacity

    @property
    def load_factor(self) -> float:
        return self._size / self._capacity

    def _resize(self, new_capacity: int) -> None:
        old_keys = self._keys
        old_values = self._values

        self._capacity = new_capacity
        self._keys = [None] * new_capacity
        self._values = [None] * new_capacity
        self._size = 0

        for k, v in zip(old_keys, old_values):
            if k is not None and k is not self.TOMBSTONE:
                self.put(k, v)

    def put(self, key: K, value: V) -> None:
        """Inserts key-value pair via linear probing. Average Time: O(1)"""
        if self.load_factor >= self._max_load_factor:
            self._resize(self._capacity * 2)

        idx = custom_hash(key, self._capacity)
        first_tombstone = None

        for _ in range(self._capacity):
            self.probes_count += 1
            current_k = self._keys[idx]

            if current_k is None:
                # Target slot found
                target_idx = first_tombstone if first_tombstone is not None else idx
                self._keys[target_idx] = key
                self._values[target_idx] = value
                self._size += 1
                return
            elif current_k is self.TOMBSTONE:
                if first_tombstone is None:
                    first_tombstone = idx
            elif current_k == key:
                # Key overwrite
                self._values[idx] = value
                return

            idx = (idx + 1) % self._capacity

        # If table is saturated with tombstones
        if first_tombstone is not None:
            self._keys[first_tombstone] = key
            self._values[first_tombstone] = value
            self._size += 1
        else:
            self._resize(self._capacity * 2)
            self.put(key, value)

    def get(self, key: K) -> Optional[V]:
        """Retrieves value via linear probe. Average Time: O(1)"""
        idx = custom_hash(key, self._capacity)
        for _ in range(self._capacity):
            current_k = self._keys[idx]
            if current_k is None:
                return None
            if current_k == key:
                return self._values[idx]
            idx = (idx + 1) % self._capacity
        return None

    def delete(self, key: K) -> bool:
        """Sets tombstone marker for key. Average Time: O(1)"""
        idx = custom_hash(key, self._capacity)
        for _ in range(self._capacity):
            current_k = self._keys[idx]
            if current_k is None:
                return False
            if current_k == key:
                self._keys[idx] = self.TOMBSTONE
                self._values[idx] = None
                self._size -= 1
                return True
            idx = (idx + 1) % self._capacity
        return False


class TransactionDeduplicator:
    """
    Production-grade transaction idempotency deduplicator.
    Tracks idempotency keys with TTL expiry and microsecond lookup.
    """

    def __init__(self, ttl_seconds: float = 300.0):
        # Stores: idempotency_key -> (timestamp, transaction_record)
        self._table = ChainedHashTable[str, Tuple[float, dict]](initial_capacity=64)
        self.ttl_seconds = ttl_seconds
        self.duplicate_hits = 0
        self.unique_ingested = 0

    def process_transaction(self, idempotency_key: str, record: dict) -> Tuple[bool, str]:
        """
        Validates whether incoming transaction is unique or duplicate.
        Returns: (is_accepted, status_message)
        """
        now = time.time()
        existing = self._table.get(idempotency_key)

        if existing is not None:
            timestamp, _ = existing
            if (now - timestamp) <= self.ttl_seconds:
                self.duplicate_hits += 1
                return False, f"DUPLICATE_REJECTED: Key '{idempotency_key}' processed {(now - timestamp):.2f}s ago."

        # Unique or expired key -> accept and record
        self._table.put(idempotency_key, (now, record))
        self.unique_ingested += 1
        return True, f"ACCEPTED: Transaction '{idempotency_key}' registered successfully."
