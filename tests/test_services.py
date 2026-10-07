"""
Integration Tests for AlgoVision 2.0 Domain Services
"""

import unittest
from src.services.logistics_engine import LogisticsEngine
from src.services.ecommerce_engine import ECommerceEngine
from src.services.fintech_engine import FinTechEngine


class TestDomainServices(unittest.TestCase):

    def test_logistics_engine_e2e(self):
        logistics = LogisticsEngine()

        # 1. Routing test: Mumbai to Bengaluru
        route_res = logistics.route_last_mile("MUM", "BLR")
        self.assertIn("BLR", route_res["path"])
        self.assertGreater(route_res["total_distance_km"], 0.0)

        # 2. Freight packing test
        shipments = [
            {"name": "Apparel", "value": 50000, "weight": 200},
            {"name": "Electronics", "value": 150000, "weight": 100},
            {"name": "FMCG", "value": 30000, "weight": 300}
        ]
        cargo_res = logistics.optimize_truck_cargo(truck_capacity_kg=350, shipments=shipments, allow_fractional=True)
        self.assertGreater(cargo_res["total_packed_value_inr"], 0.0)

        # 3. MST Backbone test
        mst_res = logistics.compute_minimal_warehouse_backbone()
        self.assertGreater(mst_res["backbone_links_count"], 0)

    def test_ecommerce_engine_e2e(self):
        ecom = ECommerceEngine()

        # 1. Price search in AVL Tree
        budget_items = ecom.search_by_price_range(20000.0, 60000.0)
        self.assertGreater(len(budget_items), 0)
        for item in budget_items:
            self.assertTrue(20000.0 <= item["price"] <= 60000.0)

        # 2. Dual-pivot sort
        sorted_prods = ecom.sort_catalog(sort_key="price", ascending=True)
        prices = [p["price"] for p in sorted_prods]
        self.assertEqual(prices, sorted(prices))

        # 3. Trending stream
        ecom.record_product_view_or_purchase("SKU-101", "Apple iPhone 15 Pro Max", 950.0)
        trending = ecom.get_trending_products()
        self.assertGreater(len(trending), 0)

        # 4. Fuzzy search
        fuzzy_res = ecom.fuzzy_search("Sonii Headphone", threshold=0.3)
        self.assertGreater(len(fuzzy_res), 0)

    def test_fintech_engine_e2e(self):
        fintech = FinTechEngine()

        # 1. Deduplication
        r1 = fintech.process_incoming_payment("TXN_UNIQUE_999", "ACC-101", 5000.0)
        self.assertTrue(r1["accepted"])
        r2 = fintech.process_incoming_payment("TXN_UNIQUE_999", "ACC-101", 5000.0)
        self.assertFalse(r2["accepted"])  # Duplicate rejection

        # 2. Fraud ring detection
        fraud_report = fintech.detect_fraud_rings()
        self.assertEqual(fraud_report["risk_verdict"], "HIGH_RISK_ALERT")
        self.assertGreater(len(fraud_report["cycles"]), 0)

        # 3. FX Arbitrage scan
        arb_res = fintech.run_fx_arbitrage_scan()
        self.assertGreater(arb_res["arbitrage_loops_found"], 0)

        # 4. Pipeline DAG validation
        pipeline_res = fintech.validate_and_order_pipeline_stages()
        self.assertTrue(pipeline_res["is_valid_dag"])
        self.assertEqual(pipeline_res["execution_sequence"][0], "AUTH")


if __name__ == '__main__':
    unittest.main()
