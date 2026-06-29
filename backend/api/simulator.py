"""
PHASE 3 — Background Market Data Simulator
Generates continuous ticker movements and populates custom DSA structures.
"""

import threading
import time
import random
from datetime import datetime, timedelta

# Core Topology Configurations
SECTORS = ["TECHNOLOGY", "FINANCE", "HEALTHCARE", "ENERGY", "CONSUMER"]

SECTOR_EDGES = [
    ("TECHNOLOGY", "FINANCE"),
    ("FINANCE", "CONSUMER"),
    ("HEALTHCARE", "CONSUMER"),
    ("ENERGY", "TECHNOLOGY"),
]

# Baseline seeding data
INITIAL_STOCKS = [
    ("AAPL", "TECHNOLOGY", 175.00, 1500000),
    ("MSFT", "TECHNOLOGY", 400.00, 1200000),
    ("NVDA", "TECHNOLOGY", 800.00, 3000000),
    ("JPM", "FINANCE", 180.00, 800000),
    ("GS", "FINANCE", 390.00, 400000),
    ("JNJ", "HEALTHCARE", 160.00, 600000),
    ("PFE", "HEALTHCARE", 28.00, 2000000),
    ("XOM", "ENERGY", 115.00, 1100000),
    ("CVX", "ENERGY", 150.00, 900000),
    ("AMZN", "CONSUMER", 175.00, 1800000),
]

class Simulator(threading.Thread):
    def __init__(self, stock_map, queue, alerts, heap):
        super().__init__()
        self.stock_map = stock_map
        self.queue = queue
        self.alerts = alerts
        self.heap = heap
        
        self.tick_count = 0
        self.running = False
        self.daemon = True  # Allows background thread to exit cleanly when server shuts down
        
        self._seed_initial_market_state()

    def _seed_initial_market_state(self):
        """Pre-populates the StockHashMap with baseline records and past history depth."""
        from structures.stock_map import StockRecord
        
        base_time = datetime.now()
        for sym, sector, price, volume in INITIAL_STOCKS:
            if not self.stock_map.contains(sym):
                record = StockRecord(sym, price, volume, sector)
                
                # Pre-fill historical ticks so delta metrics evaluate reliably
                for i in range(12, 0, -1):
                    historical_timestamp = (base_time - timedelta(days=i)).isoformat()
                    mock_variance = price * (1 + random.uniform(-0.04, 0.04))
                    record.price_history.append((historical_timestamp, round(mock_variance, 2)))
                
                self.stock_map.put(sym, record)
                self.heap.push(sym, volume)

    def run(self):
        """Main loop executing continuous random walk asset updates."""
        self.running = True
        while self.running:
            try:
                time.sleep(2.0)  # Generates an ingestion tick event every 2 seconds
                self._process_market_tick()
            except Exception as e:
                print(f"[@Simulator Engine Error]: {e}", flush=True)

    def _process_market_tick(self):
        """Selects a stock at random, applies market pricing adjustments, and updates metrics."""
        records = self.stock_map.all_records()
        if not records:
            return

        record = random.choice(records)
        
        # Multifactor Random Walk Variance Formulas
        volatility = 0.02  # 2% max swing per tick
        bias = 0.002       # Minor natural positive upward tail drift
        change_pct = random.uniform(-volatility, volatility) + bias
        
        new_price = max(1.00, round(record.price * (1 + change_pct), 2))
        added_volume = random.randint(500, 25000)
        new_volume = record.volume + added_volume
        
        # Save back into system structures
        self.stock_map.update(record.symbol, new_price, new_volume)
        
        current_timestamp = datetime.now().isoformat()
        record.price_history.append((current_timestamp, new_price))
        
        # Maintain history bound memory layout cap
        if len(record.price_history) > 200:
            record.price_history.pop(0)

        # Buffer data package to the ingestion pipeline queue safely
        tick_payload = {
            "symbol": record.symbol,
            "price": new_price,
            "volume": new_volume,
            "timestamp": current_timestamp
        }
        
        # Fallback mechanism to accommodate queue push variant signatures
        if hasattr(self.queue, 'enqueue'):
            self.queue.enqueue(tick_payload)
        elif hasattr(self.queue, 'push'):
            self.queue.push(tick_payload)

        # Re-rank market position inside top-K max heap
        self.heap.push(record.symbol, new_volume)
        
        # Scan alert configurations for thresholds hit
        self._evaluate_active_alerts(record.symbol, new_price)
        
        self.tick_count += 1

    def _evaluate_active_alerts(self, symbol: str, price: float):
        """
        Scans through all active alerts in the AlertStack.
        If a price threshold condition matches, toggles the trigger state.
        """
        # Retrieve the array layout representation from your custom stack structure
        active_alerts = self.alerts.all_alerts()
        
        for alert in active_alerts:
            # Only evaluate active, untriggered targets matching this token ticker symbol
            if alert.symbol == symbol and not alert.triggered:
                if alert.direction == "above" and price >= alert.threshold:
                    alert.triggered = True
                    print(f"🚨 [ALERT FIRED]: {symbol} crossed ABOVE ${alert.threshold}! (Current: ${price})", flush=True)
                    
                elif alert.direction == "below" and price <= alert.threshold:
                    alert.triggered = True
                    print(f"🚨 [ALERT FIRED]: {symbol} dropped BELOW ${alert.threshold}! (Current: ${price})", flush=True)

    def stop(self):
        """Gracefully alerts the background runtime tracking loop to halt operations."""
        self.running = False