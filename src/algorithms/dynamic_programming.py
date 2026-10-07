"""
Dynamic Programming Optimization Suite
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Implements 0/1 Knapsack (DP Table & Item Recovery), Longest Common Subsequence / Levenshtein
Distance for fuzzy matching, and Floyd-Warshall Multi-Currency Arbitrage Cycle Detection.
"""

from typing import Any, Dict, List, Optional, Tuple
import math


class Knapsack01Solver:
    """
    0/1 Knapsack discrete optimization solver using Dynamic Programming.
    Constructs full DP state matrix table and recovers exact selected items.
    Time Complexity: O(N * W) where N = number of items, W = weight capacity.
    Space Complexity: O(N * W)
    """

    def __init__(self):
        self.dp_table: List[List[float]] = []

    def solve(self, capacity: int, items: List[dict]) -> Tuple[float, List[dict], List[List[float]]]:
        """
        items: List of dicts with 'name', 'value', 'weight'.
        Returns: (max_value, selected_items, dp_table)
        """
        n = len(items)
        w_cap = int(capacity)

        # Initialize DP table: (n + 1) rows x (w_cap + 1) columns
        self.dp_table = [[0.0] * (w_cap + 1) for _ in range(n + 1)]

        for i in range(1, n + 1):
            item_val = float(items[i - 1]['value'])
            item_wt = int(items[i - 1]['weight'])

            for w in range(w_cap + 1):
                if item_wt <= w:
                    # Choice: include item or exclude item
                    include_val = item_val + self.dp_table[i - 1][w - item_wt]
                    exclude_val = self.dp_table[i - 1][w]
                    self.dp_table[i][w] = max(include_val, exclude_val)
                else:
                    self.dp_table[i][w] = self.dp_table[i - 1][w]

        max_val = self.dp_table[n][w_cap]

        # Backtracking to reconstruct selected items subset
        selected_items = []
        curr_w = w_cap
        for i in range(n, 0, -1):
            if self.dp_table[i][curr_w] != self.dp_table[i - 1][curr_w]:
                selected_items.append(items[i - 1])
                curr_w -= int(items[i - 1]['weight'])

        selected_items.reverse()
        return round(max_val, 2), selected_items, self.dp_table


class LCSSimilarityEngine:
    """
    Fuzzy query matching and typo tolerance using Longest Common Subsequence (LCS)
    and Levenshtein Edit Distance via Dynamic Programming.
    Time Complexity: O(M * N)
    Space Complexity: O(M * N)
    """

    def lcs(self, s1: str, s2: str) -> Tuple[int, str, List[List[int]]]:
        """
        Calculates LCS length and string alignment between s1 and s2.
        Returns: (lcs_length, lcs_string, dp_matrix)
        """
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1].lower() == s2[j - 1].lower():
                    dp[i][j] = 1 + dp[i - 1][j - 1]
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

        # Backtrack to find LCS string
        lcs_chars = []
        i, j = m, n
        while i > 0 and j > 0:
            if s1[i - 1].lower() == s2[j - 1].lower():
                lcs_chars.append(s1[i - 1])
                i -= 1
                j -= 1
            elif dp[i - 1][j] >= dp[i][j - 1]:
                i -= 1
            else:
                j -= 1

        lcs_chars.reverse()
        return dp[m][n], "".join(lcs_chars), dp

    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Computes minimum single-character edits (insertions, deletions, substitutions)."""
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]

        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                cost = 0 if s1[i - 1].lower() == s2[j - 1].lower() else 1
                dp[i][j] = min(
                    dp[i - 1][j] + 1,        # deletion
                    dp[i][j - 1] + 1,        # insertion
                    dp[i - 1][j - 1] + cost  # substitution
                )

        return dp[m][n]

    def similarity_score(self, query: str, target: str) -> float:
        """Returns normalized similarity ratio [0.0 - 1.0]."""
        max_len = max(len(query), len(target))
        if max_len == 0:
            return 1.0
        dist = self.levenshtein_distance(query, target)
        return round(1.0 - (dist / max_len), 4)


class FloydWarshallArbitrage:
    """
    Fintech Multi-Currency Foreign Exchange (FX) Arbitrage Detector.
    Transforms exchange rates into negative logarithms: weight(u, v) = -ln(rate(u, v)).
    Applies Floyd-Warshall All-Pairs Shortest Path (O(V^3)) to detect negative-weight
    cycles, indicating a guaranteed arbitrage profit loop.
    """

    def __init__(self, currencies: List[str]):
        self.currencies: List[str] = list(currencies)
        self.n: int = len(currencies)
        self.idx_map: Dict[str, int] = {c: i for i, c in enumerate(currencies)}
        self.rates: List[List[float]] = [[1.0 if i == j else 0.0 for j in range(self.n)] for i in range(self.n)]
        self.dist: List[List[float]] = [[0.0 if i == j else float('inf') for j in range(self.n)] for i in range(self.n)]
        self.next_node: List[List[Optional[int]]] = [[None] * self.n for _ in range(self.n)]

    def add_exchange_rate(self, base: str, quote: str, rate: float) -> None:
        if base in self.idx_map and quote in self.idx_map and rate > 0:
            u, v = self.idx_map[base], self.idx_map[quote]
            self.rates[u][v] = rate
            self.dist[u][v] = -math.log(rate)
            self.next_node[u][v] = v

    def detect_arbitrage_opportunities(self) -> List[dict]:
        """
        Executes Floyd-Warshall dynamic programming algorithm.
        Returns list of detected circular arbitrage loops with profit multipliers.
        Time Complexity: O(V^3)
        """
        dist = [row[:] for row in self.dist]
        next_n = [row[:] for row in self.next_node]

        # Floyd-Warshall DP relaxation
        for k in range(self.n):
            for i in range(self.n):
                for j in range(self.n):
                    if dist[i][k] + dist[k][j] < dist[i][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        next_n[i][j] = next_n[i][k]

        opportunities = []

        # Check for negative diagonal entries indicating cyclic profit
        for i in range(self.n):
            if dist[i][i] < -1e-5:
                # Negative cycle detected
                curr = i
                cycle_indices = [curr]
                visited = {curr}

                # Trace cycle
                while True:
                    curr = next_n[curr][i]
                    if curr is None:
                        break
                    cycle_indices.append(curr)
                    if curr == i or curr in visited:
                        break
                    visited.add(curr)

                cycle_currencies = [self.currencies[idx] for idx in cycle_indices]
                multiplier = math.exp(-dist[i][i])
                profit_percent = (multiplier - 1.0) * 100.0

                opportunities.append({
                    "cycle": cycle_currencies,
                    "profit_multiplier": round(multiplier, 6),
                    "profit_percentage": round(profit_percent, 4)
                })

        return opportunities
