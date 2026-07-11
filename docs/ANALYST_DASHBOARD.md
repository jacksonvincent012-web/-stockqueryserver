# Analyst Dashboard

## Overview
The Analyst Dashboard is built for financial professionals who require deeper insights, institutional-grade tools, and raw market data. It prioritizes data density, rapid access to analytics, and professional aesthetics (including a highly requested 'White Theme' for institutional environments).

## Features & Use Cases Applied
- **Advanced Watchlists:** Analysts can maintain custom lists of monitored equities. These lists display daily momentum, sector classification, and direct external market links.
- **Top Movers & Analytics:** A dedicated feed showing real-time top gainers and losers. This leverages Heap Data Structures under the hood to maintain the top-K volatile assets.
- **Deep Market Reports:** Access to simulated earnings reports, macroeconomic indicators, and sector performance.
- **Compare Module:** A dense grid interface allowing analysts to compare historical data across multiple assets simultaneously.

## Algorithmic Complexity
Analysts often deal with larger datasets. The dashboard relies on:
- **Priority Queues (Heaps)** to constantly pull the most volatile stocks to the top of the feed without sorting the entire database $O(N \log K)$.
- **Hash Maps** to instantly retrieve company profiles and historical data $O(1)$.
