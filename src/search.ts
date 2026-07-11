import { IndexedStock } from './types';

export const INDEXED_STOCKS: IndexedStock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: '3.0T', popularity: 99, trending: true },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', marketCap: '300B', popularity: 75 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', marketCap: '260B', popularity: 92, trending: true },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology', marketCap: '1.8T', popularity: 96, trending: true },
  { symbol: 'ARM', name: 'Arm Holdings plc', sector: 'Technology', marketCap: '140B', popularity: 88 },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Banking', marketCap: '250B', popularity: 78 },
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Crypto', marketCap: '1.2T', popularity: 99, trending: true },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Finance', marketCap: '60B', popularity: 88 },
  { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy', marketCap: '300B', popularity: 80 },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Consumer', marketCap: '200B', popularity: 80 },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Crypto', marketCap: '400B', popularity: 94, trending: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: '2.0T', popularity: 95 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: '380B', popularity: 84 },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Banking', marketCap: '500B', popularity: 85 },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer', marketCap: '270B', popularity: 82 },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', marketCap: '750B', popularity: 88 },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Finance', marketCap: '400B', popularity: 82 },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: '1.2T', popularity: 95, trending: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', marketCap: '2.9T', popularity: 98, trending: true },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Technology', marketCap: '280B', popularity: 87 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', marketCap: '2.2T', popularity: 100, trending: true },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', marketCap: '160B', popularity: 70 },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', marketCap: '55B', popularity: 89 },
  { symbol: 'QQQ', name: 'Invesco QQQ', sector: 'ETFs', marketCap: '250B', popularity: 93 },
  { symbol: 'SOL', name: 'Solana', sector: 'Crypto', marketCap: '70B', popularity: 90 },
  { symbol: 'SPY', name: 'SPDR S&P 500', sector: 'ETFs', marketCap: '450B', popularity: 94, trending: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Technology', marketCap: '600B', popularity: 98, trending: true },
  { symbol: 'UBER', name: 'Uber Technologies', sector: 'Technology', marketCap: '150B', popularity: 83 },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', marketCap: '450B', popularity: 81 },
  { symbol: 'USDT', name: 'Tether USD', sector: 'Crypto', marketCap: '110B', popularity: 84 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Finance', marketCap: '550B', popularity: 83 },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'Banking', marketCap: '170B', popularity: 75 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', marketCap: '550B', popularity: 85 },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', marketCap: '400B', popularity: 80 },
  { symbol: 'XRP', name: 'Ripple', sector: 'Crypto', marketCap: '30B', popularity: 86 }
];

export const SECTORS = [
  'All',
  'Banking',
  'Consumer',
  'Crypto',
  'ETFs',
  'Energy',
  'Finance',
  'Healthcare',
  'Technology'
];

const SEARCH_HISTORY_KEY = 'app_user_search_history';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentSearch(symbol: string): void {
  try {
    const history = getRecentSearches().filter(s => s !== symbol);
    history.unshift(symbol);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch {}
}

export interface IntelligentSearchResult {
  results: IndexedStock[];
  isTrendingOrRecent: boolean;
  totalMatches: number;
}

/**
 * Intelligent search engine for multi-million user enterprise platform:
 * 1. Don't search on a single character (or only show recent/trending items).
 * 2. Start intelligent search after 2–3 characters.
 * 3. Show only top 5-10 ranked results (max 7).
 * 4. Rank by relevance, popularity, and user history—not alphabetically.
 * 5. Provide total matches so UI can display "View all results" option when needed.
 */
export function performIntelligentSearch(query: string, userHistory: string[] = []): IntelligentSearchResult {
  const q = query.trim().toLowerCase();

  // Rule 1 & 2: Don't search on a single character. Start intelligent search after 2-3 characters.
  if (q.length < 2) {
    const recentStocks = userHistory
      .map(sym => INDEXED_STOCKS.find(s => s.symbol === sym))
      .filter((s): s is IndexedStock => !!s);
    
    const trendingStocks = INDEXED_STOCKS
      .filter(s => !userHistory.includes(s.symbol))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    const combined = [...recentStocks, ...trendingStocks].slice(0, 7);
    return {
      results: combined,
      isTrendingOrRecent: true,
      totalMatches: combined.length
    };
  }

  // Filter matching stocks
  const matched = INDEXED_STOCKS.filter(stock => {
    const sym = stock.symbol.toLowerCase();
    const name = stock.name.toLowerCase();
    const sec = stock.sector.toLowerCase();
    return sym.includes(q) || name.includes(q) || sec.includes(q);
  });

  // Rule 4: Rank by relevance, popularity, and user history—not alphabetically
  const scored = matched.map(stock => {
    let score = stock.popularity || 50;
    
    // User history boost
    if (userHistory.includes(stock.symbol)) {
      score += 300;
    }

    const sym = stock.symbol.toLowerCase();
    const name = stock.name.toLowerCase();
    const sec = stock.sector.toLowerCase();

    // Relevance scoring
    if (sym === q) {
      score += 1000;
    } else if (sym.startsWith(q)) {
      score += 600;
    } else if (name.startsWith(q)) {
      score += 400;
    } else if (sym.includes(q)) {
      score += 200;
    } else if (name.includes(q)) {
      score += 150;
    } else if (sec.includes(q)) {
      score += 50;
    }

    return { stock, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Rule 3: Show only the top 5–10 ranked results (we use 7)
  const topRanked = scored.slice(0, 7).map(item => item.stock);

  return {
    results: topRanked,
    isTrendingOrRecent: false,
    totalMatches: scored.length
  };
}
