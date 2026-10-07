/**
 * Sample Domain Datasets for AlgoVision 2.0
 */

window.ALGO_DATA = {
  logistics: {
    nodes: [
      { id: "MUM", label: "Mumbai Central Hub", x: 120, y: 220, tier: "T1" },
      { id: "PUN", label: "Pune Sorting Terminal", x: 180, y: 270, tier: "T2" },
      { id: "AHM", label: "Ahmedabad Freight Terminal", x: 110, y: 130, tier: "T2" },
      { id: "DEL", label: "Delhi NCR Super Hub", x: 260, y: 70, tier: "T1" },
      { id: "NAG", label: "Nagpur Central Transit", x: 300, y: 200, tier: "T2" },
      { id: "BLR", label: "Bengaluru Tech Logistics Hub", x: 230, y: 360, tier: "T1" },
      { id: "HYD", label: "Hyderabad Fulfillment Center", x: 280, y: 280, tier: "T1" },
      { id: "CHE", label: "Chennai Port Gateway", x: 330, y: 370, tier: "T1" },
      { id: "KOL", label: "Kolkata Eastern Hub", x: 480, y: 170, tier: "T1" }
    ],
    edges: [
      { source: "MUM", target: "PUN", weight: 148 },
      { source: "MUM", target: "AHM", weight: 524 },
      { source: "MUM", target: "NAG", weight: 815 },
      { source: "MUM", target: "BLR", weight: 984 },
      { source: "PUN", target: "HYD", weight: 560 },
      { source: "PUN", target: "BLR", weight: 840 },
      { source: "AHM", target: "DEL", weight: 930 },
      { source: "DEL", target: "NAG", weight: 1080 },
      { source: "DEL", target: "KOL", weight: 1470 },
      { source: "NAG", target: "HYD", weight: 500 },
      { source: "NAG", target: "KOL", weight: 980 },
      { source: "BLR", target: "CHE", weight: 345 },
      { source: "BLR", target: "HYD", weight: 570 },
      { source: "HYD", target: "CHE", weight: 630 },
      { source: "CHE", target: "KOL", weight: 1660 }
    ],
    shipments: [
      { name: "Electronics Consignment", value: 240000, weight: 80 },
      { name: "Medical Oxygen & Vaccines", value: 450000, weight: 60 },
      { name: "Apparel & Garments Batch", value: 90000, weight: 110 },
      { name: "Precision Industrial Tools", value: 310000, weight: 70 },
      { name: "FMCG Packaged Goods", value: 50000, weight: 130 }
    ],
    shifts: [
      { id: "S1", name: "Morning Airport Dispatch", start: 6, finish: 10 },
      { id: "S2", name: "Peak Morning Intra-City", start: 8, finish: 12 },
      { id: "S3", name: "Afternoon Hub Transfer", start: 10, finish: 14 },
      { id: "S4", name: "Evening Port Clearance", start: 13, finish: 17 },
      { id: "S5", name: "Night Cross-Dock Linehaul", start: 16, finish: 21 }
    ]
  },
  ecommerce: {
    products: [
      { id: "SKU-101", title: "Apple iPhone 15 Pro Max (256GB)", category: "Electronics", price: 134900, stock: 45, rating: 4.8 },
      { id: "SKU-102", title: "Samsung Galaxy S24 Ultra", category: "Electronics", price: 129999, stock: 32, rating: 4.7 },
      { id: "SKU-103", title: "Sony WH-1000XM5 Wireless ANC", category: "Audio", price: 29990, stock: 80, rating: 4.6 },
      { id: "SKU-104", title: "Apple MacBook Pro 16-inch M3 Max", category: "Computing", price: 249900, stock: 15, rating: 4.9 },
      { id: "SKU-105", title: "Dell XPS 15 Intel Core i9", category: "Computing", price: 189990, stock: 20, rating: 4.5 },
      { id: "SKU-106", title: "Bose QuietComfort 45 Headphones", category: "Audio", price: 24900, stock: 60, rating: 4.4 },
      { id: "SKU-107", title: "Logitech MX Master 3S Mouse", category: "Accessories", price: 8995, stock: 150, rating: 4.8 },
      { id: "SKU-108", title: "Keychron Q1 Pro Mechanical Keyboard", category: "Accessories", price: 16999, stock: 40, rating: 4.7 },
      { id: "SKU-109", title: "OnePlus 12 5G (16GB RAM)", category: "Electronics", price: 64999, stock: 95, rating: 4.5 },
      { id: "SKU-110", title: "LG C3 55-inch 4K OLED Smart TV", category: "Electronics", price: 114990, stock: 18, rating: 4.8 }
    ],
    initialPrices: [134900, 129999, 29990, 249900, 189990, 24900, 8995, 16999, 64999, 114990]
  },
  fintech: {
    accounts: [
      { id: "ACC-101", label: "Merchant Primary Gateway", x: 150, y: 150, isMule: false },
      { id: "ACC-102", label: "Mule Account Alpha", x: 280, y: 120, isMule: true },
      { id: "ACC-103", label: "Mule Account Beta", x: 380, y: 200, isMule: true },
      { id: "ACC-104", label: "Shell Corp Horizon", x: 320, y: 320, isMule: true },
      { id: "ACC-105", label: "Offshore Account Cayman", x: 180, y: 300, isMule: true },
      { id: "ACC-106", label: "Legitimate Vendor X", x: 480, y: 120, isMule: false },
      { id: "ACC-107", label: "Retail Partner Y", x: 500, y: 280, isMule: false }
    ],
    transactions: [
      { source: "ACC-101", target: "ACC-102", amount: 450000, isSuspicious: true },
      { source: "ACC-102", target: "ACC-103", amount: 440000, isSuspicious: true },
      { source: "ACC-103", target: "ACC-104", amount: 435000, isSuspicious: true },
      { source: "ACC-104", target: "ACC-105", amount: 430000, isSuspicious: true },
      { source: "ACC-105", target: "ACC-101", amount: 425000, isSuspicious: true }, // Cyclic Ring!
      { source: "ACC-101", target: "ACC-106", amount: 12000, isSuspicious: false },
      { source: "ACC-106", target: "ACC-107", amount: 8500, isSuspicious: false }
    ],
    arbitrage: {
      currencies: ["USD", "EUR", "GBP", "INR", "JPY"],
      rates: {
        "USD->EUR": 0.92,
        "EUR->GBP": 0.86,
        "GBP->INR": 106.80,
        "INR->USD": 0.0121,
        "EUR->USD": 1.08,
        "GBP->USD": 1.28,
        "USD->INR": 83.45,
        "JPY->USD": 0.0066,
        "USD->JPY": 151.20
      }
    }
  }
};
