"""
Interactive Command Line Interface
Part of AlgoVision 2.0 - Unified Analytics & Optimization Platform

Allows live interactive demonstration of all 5 DSA modules and industry workflows.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import time
from src.services.logistics_engine import LogisticsEngine
from src.services.ecommerce_engine import ECommerceEngine
from src.services.fintech_engine import FinTechEngine


def print_banner():
    banner = r"""
========================================================================
   ___    __           _    ___      _               ___     ____
  / _ \  / /  ___ _ ___| |  / (_)___ (_)___  ___     |_  |   / __ \
 / __ | / /__/ _ `/ _ \ | / / (_-(_-< / _ \/ _ \   / __/__ / /_/ /
/_/ |_|/____/\_, /\___/_|/_/ /_/___/__/_//_/\___/  /____/(_) \____/
            |__/
   UNIFIED DSA ANALYTICS & MULTI-SECTOR OPTIMIZATION PLATFORM
========================================================================
"""
    print(banner)


def run_logistics_demo():
    print("\n" + "=" * 65)
    print(" 🚚 MODULE 1: LOGISTICS & SUPPLY CHAIN OPTIMIZATION")
    print("=" * 65)
    engine = LogisticsEngine()

    print("\n1. Running Dijkstra Routing (Mumbai -> Kolkata):")
    res = engine.route_last_mile("MUM", "KOL")
    print(f" • Shortest Route : {' -> '.join(res['path'])}")
    print(f" • Total Distance : {res['total_distance_km']:.1f} km")
    print(f" • Relaxations    : {res['relaxations']} edges relaxed")

    print("\n2. Computing Minimal Warehouse Interconnect (Kruskal's MST):")
    mst = engine.compute_minimal_warehouse_backbone()
    print(f" • Total Backbone Distance : {mst['total_mst_distance_km']:.1f} km")
    print(f" • Number of Links        : {mst['backbone_links_count']}")
    for link in mst['links'][:4]:
        print(f"    - {link['source']} <---> {link['destination']} ({link['distance_km']} km)")

    print("\n3. Long-Haul Freight Packing (Greedy vs 0/1 DP Knapsack):")
    shipments = [
        {"name": "Heavy Industrial Machinery", "value": 180000, "weight": 250},
        {"name": "Consumer Electronics", "value": 240000, "weight": 120},
        {"name": "Apparel & Garments", "value": 60000, "weight": 50},
        {"name": "Pharmaceutical Supplies", "value": 310000, "weight": 80}
    ]
    frac_res = engine.optimize_truck_cargo(truck_capacity_kg=300, shipments=shipments, allow_fractional=True)
    print(f" • Fractional Knapsack : ₹{frac_res['total_packed_value_inr']:,.2f} freight value packed")


def run_ecommerce_demo():
    print("\n" + "=" * 65)
    print(" 🛒 MODULE 2: E-COMMERCE CATALOG & REAL-TIME DISCOVERY")
    print("=" * 65)
    engine = ECommerceEngine()

    print("\n1. AVL Tree Price Range Filtering (₹30,000 to ₹1,00,000):")
    range_items = engine.search_by_price_range(30000.0, 100000.0)
    print(f" • Found {len(range_items)} products in target price band in O(log N):")
    for item in range_items[:3]:
        print(f"    - [{item['sku_id']}] {item['title']} | ₹{item['price']:,.2f} (Rating: {item['rating']}⭐)")

    print("\n2. Dual-Pivot QuickSort Catalog Ranking (By Price Ascending):")
    sorted_catalog = engine.sort_catalog(sort_key="price", ascending=True)
    for p in sorted_catalog[:3]:
        print(f"    - ₹{p['price']:>10,.2f} : {p['title']}")

    print("\n3. Typo-Tolerant Fuzzy Search (Query: 'Iphon 15'):")
    fuzzy_res = engine.fuzzy_search("Iphon 15", threshold=0.3)
    if fuzzy_res:
        top_match = fuzzy_res[0]
        print(f" • Top Match: {top_match['product']['title']} (Confidence: {top_match['similarity_score'] * 100:.1f}%)")


def run_fintech_demo():
    print("\n" + "=" * 65)
    print(" 💳 MODULE 3: FINTECH FRAUD & MULTI-CURRENCY ARBITRAGE")
    print("=" * 65)
    engine = FinTechEngine()

    print("\n1. Real-Time Transaction Idempotency & Deduplication (O(1)):")
    r1 = engine.process_incoming_payment("TXN_UPI_88219", "ACC-101", 50000.0)
    print(f" • First Ingestion  : {r1['message']}")
    r2 = engine.process_incoming_payment("TXN_UPI_88219", "ACC-101", 50000.0)
    print(f" • Second Ingestion : {r2['message']}")

    print("\n2. Money Laundering Circular Cycle Detection (DFS & Tarjan SCC):")
    fraud_res = engine.detect_fraud_rings()
    print(f" • Risk Verdict : {fraud_res['risk_verdict']}")
    print(f" • Suspicious Rings Detected : {fraud_res['suspicious_cycles_count']}")
    for cycle in fraud_res['cycles']:
        print(f"    - {' -> '.join(cycle)}")

    print("\n3. Multi-Currency FX Arbitrage Detection (Floyd-Warshall O(V^3)):")
    arb = engine.run_fx_arbitrage_scan()
    print(f" • Opportunities Found : {arb['arbitrage_loops_found']}")
    for opp in arb['opportunities']:
        print(f"    - Profit Cycle : {' -> '.join(opp['cycle'])}")
        print(f"    - Multiplier   : {opp['profit_multiplier']} (Profit: +{opp['profit_percentage']:.2f}%)")


def main():
    print_banner()
    run_logistics_demo()
    run_ecommerce_demo()
    run_fintech_demo()
    print("\n" + "=" * 65)
    print(" 🚀 AlgoVision 2.0 CLI Demonstration Completed Successfully.")
    print("=" * 65 + "\n")


if __name__ == '__main__':
    main()
