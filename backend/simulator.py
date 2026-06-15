"""Stock simulator — Generates realistic price data and background thread."""

import random
import threading
import time
from datetime import datetime, timedelta
from engine.stock_map import StockHashMap, StockRecord
from engine.ingestion_queue import IngestionQueue, Tick
from engine.top_k_heap import TopKHeap
from engine.alert_stack import AlertStack, Alert


SYMBOLS = [
    "AAPL", "GOOG", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX",
    "AMD", "INTC", "JPM", "GS", "BAC", "XOM", "CVX", "PFE",
    "JNJ", "WMT", "DIS", "COST", "UBER", "SPOT", "DASH", "CRWD"
]

SECTORS = {
    "AAPL": "TECH", "GOOG": "TECH", "MSFT": "TECH", "META": "TECH",
    "NVDA": "TECH", "AMD": "TECH", "INTC": "TECH", "NFLX": "TECH",
    "TSLA": "AUTO", "F": "AUTO", "GM": "AUTO",
    "JPM": "FINANCE", "GS": "FINANCE", "BAC": "FINANCE",
    "XOM": "ENERGY", "CVX": "ENERGY",
    "PFE": "PHARMA", "JNJ": "PHARMA",
    "WMT": "RETAIL", "COST": "RETAIL", "DIS": "RETAIL",
    "UBER": "MOBILITY", "LYFT": "MOBILITY",
    "SPOT": "MEDIA", "DASH": "MEDIA", "CRWD": "CYBERSEC"
}


class Simulator:
    def __init__(self, hash_map, queue, heap, alerts):
        self.hash_map = hash_map
        self.queue = queue
        self.heap = heap
        self.alerts = alerts
        self.running = False
        self.thread = None
        self.day_counter = 0
        self._initialize_stocks()

    def _initialize_stocks(self):
        """Create 24 stocks with 90-day price history."""
        for symbol in SYMBOLS:
            base_price = random.uniform(50, 500)
            sector = SECTORS.get(symbol, "TECH")

            # Generate 90-day history
            history = []
            current_price = base_price
            for days_ago in range(89, -1, -1):
                date = datetime.now() - timedelta(days=days_ago)
                change = random.uniform(-0.03, 0.03)
                current_price *= (1 + change)
                history.append((date.strftime("%Y-%m-%d"), round(current_price, 2)))

            volume = random.randint(1_000_000, 50_000_000)
            record = StockRecord(symbol, history[-1][1], volume, sector)
            record.price_history = history
            self.hash_map.put(symbol, record)

            # Add to heap for initial top-K
            self.heap.push(symbol, volume)

    def start(self):
        """Start background ticker thread."""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._tick_loop, daemon=True)
            self.thread.start()
            print(f"[Simulator] Started. Ticking every 2 seconds.")

    def stop(self):
        """Stop background thread."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)

    def _tick_loop(self):
        """Background thread: generate ticks every 2 seconds."""
        while self.running:
            try:
                self._generate_tick()
                time.sleep(2)
            except Exception as e:
                print(f"[Simulator] Error in tick loop: {e}")

    def _generate_tick(self):
        """Generate one tick, enqueue, and update maps."""
        symbol = random.choice(SYMBOLS)
        record = self.hash_map.get(symbol)

        if record:
            # Realistic price change: ±2%
            change = random.uniform(-0.02, 0.02)
            new_price = max(1, record.price * (1 + change))
            new_volume = random.randint(1_000_000, 50_000_000)

            # Enqueue tick
            tick = Tick(symbol, new_price, new_volume, datetime.now())
            self.queue.enqueue(tick)

            # Drain and update hash map
            ticks = self.queue.drain()
            for t in ticks:
                self.hash_map.update(t.symbol, t.price, t.volume)
                record_updated = self.hash_map.get(t.symbol)
                if record_updated:
                    record_updated.price_history.append(
                        (datetime.now().strftime("%Y-%m-%d"), t.price)
                    )
                    # Update heap
                    self.heap.push(t.symbol, t.volume)

                    # Check alerts
                    for alert in self.alerts.all_alerts():
                        if alert.symbol == t.symbol and t.price >= alert.threshold:
                            alert.triggered = True

    def get_all_records(self):
        """Return all stock records."""
        return self.hash_map.all_records()
