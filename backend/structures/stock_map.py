"""StockHashMap — O(1) symbol → StockRecord lookup."""

class StockRecord:
    def __init__(self, symbol, price, volume, sector):
        self.symbol = symbol
        self.price = price
        self.volume = volume
        self.sector = sector
        self.price_history = []  # list of (date, price) tuples


class StockHashMap:
    def __init__(self):
        self.map = {}

    def put(self, symbol, record):
        """Insert or update stock record. O(1)."""
        self.map[symbol] = record

    def get(self, symbol):
        """Retrieve stock by symbol. O(1). Returns None if not found."""
        return self.map.get(symbol)

    def update(self, symbol, price, volume):
        """Update price/volume for existing symbol. O(1)."""
        if symbol in self.map:
            self.map[symbol].price = price
            self.map[symbol].volume = volume
            return True
        return False

    def all_records(self):
        """Return list of all records. O(n)."""
        return list(self.map.values())

    def remove(self, symbol):
        """Remove symbol from map. O(1)."""
        if symbol in self.map:
            del self.map[symbol]
            return True
        return False

    def size(self):
        """Return number of records. O(1)."""
        return len(self.map)
