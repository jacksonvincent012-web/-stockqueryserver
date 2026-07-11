# Analyst Module — Stock Query Server (Python Flask)

The **Analyst Module** is a read-and-analyze layer built with Python (Flask) that consumes processed market data from the core Data Structure & Algorithm (DSA) backend engine. It provides real-time financial analytics and time-series insights to the Analyst Dashboard without modifying core system administration state.

---

## ⚙️ Core Backend Architecture & DSA Integration

The system processes continuous market ticks through a stream-based pipeline:
```
Ingestion Queue → Tick Processor → DSA Engine → Storage + Analytics
```

### All 8 Core DSA Structures Utilized:
1. **Stock Query Service (HashMap — O(1))**: Instant lookup of ticker metadata, quotes (`price`, `volume`, `market_cap`, `daily change`).
2. **Market Analytics Engine (Min-Heap / Max-Heap Top-K — O(N log K))**: Dynamically maintains rankings for **Top Gainers**, **Top Losers**, and **Most Active Stocks**, alongside real-time **Sector Performance Summaries**.
3. **Alert Rule Engine (Stack LIFO — O(1) Undo)**: Allows analysts to define custom threshold rules (`ABOVE`, `BELOW`, `VOLUME_SPIKE`, `PERCENT_CHANGE`). Rules are stored in a LIFO Stack for instant undo functionality. Incoming market ticks are continuously evaluated against active rules automatically by the backend.
4. **Historical Data Engine (Merge Sort O(N log N) & Binary Search O(log N))**: Retrieves historical OHLC (Open, High, Low, Close) time-series data, guaranteeing strict chronological ordering via Merge Sort and fast date-range/timestamp lookups via Binary Search.
5. **Sector Exploration Engine (Graph BFS/DFS — O(V + E))**: Models market sectors, industries, and individual stocks as a relationship graph. Supports Breadth-First Search (BFS) and Depth-First Search (DFS) traversal for visual relationship maps.
6. **Cache Layer (LRU Cache — O(1))**: Caches frequent symbol lookups, historical chart queries, and search requests. Automatically evicts the least recently used queries when capacity is reached.

---

## 🚀 Setup & Running the Server

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask Analyst Server**:
   ```bash
   python -m backend.analyst.server
   ```
   The server listens by default on `http://0.0.0.0:5000`.

---

## 🔌 API Endpoints Reference

All endpoints return structured JSON conforming to financial analytics standards.

| Method | Endpoint | Description | DSA Used |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/stocks/<symbol>` | Fast stock quote & daily change lookup | **HashMap** (O(1)) |
| **GET** | `/api/analytics/top` | Top gainers, losers, active stocks, & sector summary | **Min-Heap / Max-Heap** |
| **POST** | `/api/alerts/create` | Create custom threshold alert rule | **Stack (LIFO)** |
| **GET** | `/api/alerts` | Retrieve active rules & triggered alerts history | **Stack & Pipeline** |
| **DELETE**| `/api/alerts/undo` | Pop latest alert rule from stack (undo action) | **Stack (LIFO)** |
| **GET** | `/api/history/<symbol>`| OHLC time-series retrieval | **Merge Sort & Binary Search**|
| **POST** | `/api/search` | Substring/prefix symbol search | **LRU Cache + HashMap** |
| **GET** | `/api/sectors/bfs` | Graph Breadth-First Search traversal | **Graph BFS** (O(V + E)) |
| **GET** | `/api/sectors/dfs` | Graph Depth-First Search traversal | **Graph DFS** (O(V + E)) |
| **GET** | `/api/cache/stats` | Cache hits, misses, capacity, & hit ratio | **LRU Cache** (O(1)) |

---

## 📥 Example API Requests & Responses

### 1. Stock Query (`GET /api/stocks/AAPL`)
```json
{
  "symbol": "AAPL",
  "price": 191.25,
  "volume": 12000,
  "change_percent": 1.2,
  "market_cap": 2980000000000.0
}
```

### 2. Market Analytics (`GET /api/analytics/top`)
```json
{
  "top_gainers": ["NVDA", "TSLA"],
  "top_losers": ["INTC", "IBM"],
  "most_active": ["AAPL", "AMZN"],
  "sector_performance": {
    "Technology Sector": { "avg_change_percent": 1.45, "stock_count": 4 },
    "Consumer Discretionary": { "avg_change_percent": 2.60, "stock_count": 2 }
  }
}
```

### 3. Create Alert Rule (`POST /api/alerts/create`)
**Request Body:**
```json
{
  "symbol": "TSLA",
  "condition": "ABOVE",
  "threshold": 250
}
```
**Response:**
```json
{
  "rule_id": "rule_1_4821",
  "symbol": "TSLA",
  "condition": "ABOVE",
  "threshold": 250.0,
  "status": "ACTIVE"
}
```
*Note: When live ticks stream in via `/api/ticks/ingest`, the backend evaluates active rules and logs triggered alert events automatically.*
