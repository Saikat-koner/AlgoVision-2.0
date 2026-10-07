"""
FinTech Risk Analytics & Arbitrage Engine
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Integrates Transaction Idempotency Deduplication, Money Laundering Ring Detection (DFS & Tarjan SCC),
Multi-Currency FX Arbitrage (Floyd-Warshall), and Settlement Pipeline DAG Verification (Kahn's Algo).
"""

from typing import Any, Dict, List, Optional, Tuple
from ..data_structures.hash_table import TransactionDeduplicator
from ..data_structures.graph_structures import AdjacencyListGraph
from ..algorithms.dynamic_programming import FloydWarshallArbitrage
from ..algorithms.graph_algorithms import DFSCycleDetector, TarjanSCC, TopologicalSorter


class FinTechEngine:
    """Unified service for fintech transaction integrity, fraud ring discovery, and FX arbitrage."""

    def __init__(self):
        self.deduplicator = TransactionDeduplicator(ttl_seconds=300.0)
        self.tx_graph = AdjacencyListGraph(is_directed=True)
        self.cycle_detector = DFSCycleDetector()
        self.scc_detector = TarjanSCC()
        self.topo_sorter = TopologicalSorter()
        self.pipeline_graph = AdjacencyListGraph(is_directed=True)
        self._initialize_sample_fintech_data()

    def _initialize_sample_fintech_data(self) -> None:
        # 1. Money-laundering / Suspicious transaction ring graph
        accounts = [
            ("ACC-101", "Primary Merchant Alpha"),
            ("ACC-102", "Intermediary Mule 1"),
            ("ACC-103", "Intermediary Mule 2"),
            ("ACC-104", "Shell Corp Horizon"),
            ("ACC-105", "Offshore Account Cayman"),
            ("ACC-106", "Legitimate Vendor X"),
            ("ACC-107", "Legitimate Retailer Y")
        ]

        for acc_id, name in accounts:
            self.tx_graph.add_vertex(acc_id, label=name)

        # Build transactions: Circular money laundering loop: 101 -> 102 -> 103 -> 104 -> 105 -> 101
        tx_edges = [
            ("ACC-101", "ACC-102", 450000.0),
            ("ACC-102", "ACC-103", 440000.0),
            ("ACC-103", "ACC-104", 435000.0),
            ("ACC-104", "ACC-105", 430000.0),
            ("ACC-105", "ACC-101", 425000.0),  # Closes circular cycle!
            ("ACC-101", "ACC-106", 12000.0),
            ("ACC-106", "ACC-107", 8500.0)
        ]

        for u, v, amt in tx_edges:
            self.tx_graph.add_edge(u, v, weight=amt)

        # 2. Payment Pipeline Execution DAG
        pipeline_stages = [
            ("AUTH", "Payment Authentication"),
            ("FRAUD_CHK", "Real-Time Fraud Score Evaluation"),
            ("DEDUP", "Idempotency Deduplication"),
            ("LEDGER_LOCK", "Account Balance Lock"),
            ("CLEARING", "Interbank Clearing House"),
            ("SETTLEMENT", "Final Settlement & Webhook Notification")
        ]

        for code, label in pipeline_stages:
            self.pipeline_graph.add_vertex(code, label=label)

        pipeline_deps = [
            ("AUTH", "DEDUP"),
            ("DEDUP", "FRAUD_CHK"),
            ("FRAUD_CHK", "LEDGER_LOCK"),
            ("LEDGER_LOCK", "CLEARING"),
            ("CLEARING", "SETTLEMENT")
        ]

        for u, v in pipeline_deps:
            self.pipeline_graph.add_edge(u, v, weight=1.0)

    def process_incoming_payment(self, idempotency_key: str, account_id: str, amount: float) -> dict:
        """Deduplicates transactions in O(1) time."""
        record = {"account_id": account_id, "amount": amount}
        accepted, message = self.deduplicator.process_transaction(idempotency_key, record)
        return {
            "idempotency_key": idempotency_key,
            "accepted": accepted,
            "message": message,
            "duplicate_hits_total": self.deduplicator.duplicate_hits
        }

    def detect_fraud_rings(self) -> dict:
        """Discovers circular money flows and strongly connected laundering syndicates."""
        cycles = self.cycle_detector.find_all_cycles(self.tx_graph)
        sccs = self.scc_detector.find_scc(self.tx_graph)

        # Filter SCCs with more than 1 account (cycles)
        suspicious_clusters = [cluster for cluster in sccs if len(cluster) > 1]

        return {
            "suspicious_cycles_count": len(cycles),
            "cycles": cycles,
            "strongly_connected_fraud_clusters": suspicious_clusters,
            "risk_verdict": "HIGH_RISK_ALERT" if cycles else "NORMAL"
        }

    def run_fx_arbitrage_scan(self) -> dict:
        """Runs Floyd-Warshall negative cycle detection on global currency matrix."""
        currencies = ["USD", "EUR", "GBP", "INR", "JPY"]
        arbitrage_engine = FloydWarshallArbitrage(currencies)

        # Live FX rates with a subtle cross-market discrepancy
        # USD -> EUR -> GBP -> INR -> USD arbitrage opportunity
        arbitrage_engine.add_exchange_rate("USD", "EUR", 0.92)
        arbitrage_engine.add_exchange_rate("EUR", "GBP", 0.86)
        arbitrage_engine.add_exchange_rate("GBP", "INR", 106.80)
        arbitrage_engine.add_exchange_rate("INR", "USD", 0.0121)  # 0.92 * 0.86 * 106.80 * 0.0121 = 1.0212 (2.12% profit!)

        # Standard market rates
        arbitrage_engine.add_exchange_rate("EUR", "USD", 1.08)
        arbitrage_engine.add_exchange_rate("GBP", "USD", 1.28)
        arbitrage_engine.add_exchange_rate("USD", "INR", 83.45)
        arbitrage_engine.add_exchange_rate("JPY", "USD", 0.0066)
        arbitrage_engine.add_exchange_rate("USD", "JPY", 151.20)

        opportunities = arbitrage_engine.detect_arbitrage_opportunities()
        return {
            "monitored_currencies": currencies,
            "arbitrage_loops_found": len(opportunities),
            "opportunities": opportunities
        }

    def validate_and_order_pipeline_stages(self) -> dict:
        """Ensures payment execution graph is acyclic and outputs deterministic stage order."""
        is_dag, order = self.topo_sorter.sort(self.pipeline_graph)
        return {
            "is_valid_dag": is_dag,
            "execution_sequence": order,
            "stage_labels": [self.pipeline_graph.vertices[s]["label"] for s in order] if is_dag else []
        }
