"""
Self-Balancing AVL Binary Search Tree Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements an AVL Tree with automatic LL/RR/LR/RL rotation rebalancing,
ensuring strict O(log N) worst-case search, insertion, deletion, and price-range filtering.
"""

from typing import Any, Generic, List, Optional, Tuple, TypeVar

K = TypeVar('K')
V = TypeVar('V')


class AVLNode(Generic[K, V]):
    """Tree node maintaining key, value payload, height, and subtree links."""

    def __init__(self, key: K, value: V):
        self.key: K = key
        self.value: V = value
        self.left: Optional['AVLNode[K, V]'] = None
        self.right: Optional['AVLNode[K, V]'] = None
        self.height: int = 1

    @property
    def balance_factor(self) -> int:
        left_h = self.left.height if self.left else 0
        right_h = self.right.height if self.right else 0
        return left_h - right_h


class AVLTree(Generic[K, V]):
    """
    Strictly balanced AVL Binary Search Tree.
    Guarantees tree height h <= 1.44 * log2(N + 2) - 0.328.
    """

    def __init__(self):
        self.root: Optional[AVLNode[K, V]] = None
        self._size: int = 0
        self.rotations_count: int = 0

    @property
    def size(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self.root is None

    def _get_height(self, node: Optional[AVLNode[K, V]]) -> int:
        return node.height if node else 0

    def _update_height(self, node: AVLNode[K, V]) -> None:
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))

    def _rotate_right(self, y: AVLNode[K, V]) -> AVLNode[K, V]:
        """Right Rotation (LL Case Resolution)."""
        self.rotations_count += 1
        x = y.left
        assert x is not None
        t2 = x.right

        # Perform rotation
        x.right = y
        y.left = t2

        # Update heights
        self._update_height(y)
        self._update_height(x)
        return x

    def _rotate_left(self, x: AVLNode[K, V]) -> AVLNode[K, V]:
        """Left Rotation (RR Case Resolution)."""
        self.rotations_count += 1
        y = x.right
        assert y is not None
        t2 = y.left

        # Perform rotation
        y.left = x
        x.right = t2

        # Update heights
        self._update_height(x)
        self._update_height(y)
        return y

    def insert(self, key: K, value: V) -> None:
        """
        Inserts key-value node and triggers rebalancing if balance factor skewed.
        Time Complexity: O(log N)
        """
        self.root = self._insert_node(self.root, key, value)
        self._size += 1

    def _insert_node(self, node: Optional[AVLNode[K, V]], key: K, value: V) -> AVLNode[K, V]:
        if not node:
            return AVLNode(key, value)

        if key < node.key:
            node.left = self._insert_node(node.left, key, value)
        elif key > node.key:
            node.right = self._insert_node(node.right, key, value)
        else:
            # Overwrite payload on key collision
            node.value = value
            self._size -= 1  # Offset increment in caller
            return node

        self._update_height(node)
        balance = node.balance_factor

        # Left-Left (LL) Case
        if balance > 1 and node.left and key < node.left.key:
            return self._rotate_right(node)

        # Right-Right (RR) Case
        if balance < -1 and node.right and key > node.right.key:
            return self._rotate_left(node)

        # Left-Right (LR) Case
        if balance > 1 and node.left and key > node.left.key:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)

        # Right-Left (RL) Case
        if balance < -1 and node.right and key < node.right.key:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def search(self, key: K) -> Optional[V]:
        """Searches for key. Time Complexity: O(log N)"""
        curr = self.root
        while curr:
            if key == curr.key:
                return curr.value
            elif key < curr.key:
                curr = curr.left
            else:
                curr = curr.right
        return None

    def _min_value_node(self, node: AVLNode[K, V]) -> AVLNode[K, V]:
        curr = node
        while curr.left is not None:
            curr = curr.left
        return curr

    def delete(self, key: K) -> bool:
        """Removes key node and rebalances tree. Time Complexity: O(log N)"""
        if self.search(key) is None:
            return False
        self.root = self._delete_node(self.root, key)
        self._size -= 1
        return True

    def _delete_node(self, node: Optional[AVLNode[K, V]], key: K) -> Optional[AVLNode[K, V]]:
        if not node:
            return None

        if key < node.key:
            node.left = self._delete_node(node.left, key)
        elif key > node.key:
            node.right = self._delete_node(node.right, key)
        else:
            # Node with only one child or zero children
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left

            # Node with two children: Get in-order successor
            temp = self._min_value_node(node.right)
            node.key = temp.key
            node.value = temp.value
            node.right = self._delete_node(node.right, temp.key)

        if node is None:
            return None

        self._update_height(node)
        balance = node.balance_factor

        # LL
        if balance > 1 and node.left and node.left.balance_factor >= 0:
            return self._rotate_right(node)
        # LR
        if balance > 1 and node.left and node.left.balance_factor < 0:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        # RR
        if balance < -1 and node.right and node.right.balance_factor <= 0:
            return self._rotate_left(node)
        # RL
        if balance < -1 and node.right and node.right.balance_factor > 0:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def in_order_traversal(self) -> List[Tuple[K, V]]:
        """Produces sorted in-order key-value sequence in O(N)."""
        result = []
        def _traverse(node: Optional[AVLNode[K, V]]):
            if node:
                _traverse(node.left)
                result.append((node.key, node.value))
                _traverse(node.right)
        _traverse(self.root)
        return result

    def find_in_range(self, low: K, high: K) -> List[Tuple[K, V]]:
        """
        Retrieves all elements whose keys fall within [low, high].
        Time Complexity: O(log N + K_matches)
        """
        matches = []
        def _range_search(node: Optional[AVLNode[K, V]]):
            if not node:
                return
            if low < node.key:
                _range_search(node.left)
            if low <= node.key <= high:
                matches.append((node.key, node.value))
            if node.key < high:
                _range_search(node.right)
        _range_search(self.root)
        return matches


class ProductPriceTree:
    """E-Commerce price index utilizing AVL Tree for sub-millisecond price-band queries."""

    def __init__(self):
        # Key: price (float), Value: list of product dicts
        self.tree: AVLTree[float, List[dict]] = AVLTree[float, List[dict]]()

    def index_product(self, product: dict) -> None:
        price = float(product.get("price", 0.0))
        existing = self.tree.search(price)
        if existing is not None:
            existing.append(product)
        else:
            self.tree.insert(price, [product])

    def query_price_range(self, min_price: float, max_price: float) -> List[dict]:
        """Returns all products priced between min_price and max_price."""
        range_nodes = self.tree.find_in_range(min_price, max_price)
        results = []
        for _, product_list in range_nodes:
            results.extend(product_list)
        return results
