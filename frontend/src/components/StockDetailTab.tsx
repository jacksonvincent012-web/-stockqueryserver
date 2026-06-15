import React, { useState, useEffect } from 'react'
import { apiFetch } from '../context/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Stock {
  symbol: string
  price: number
  volume: number
  sector: string
  avg_7d: number
  min_7d: number
  max_7d: number
  pct_change_7d: number
  history_length: number
}

interface PriceHistoryItem {
  date: string
  price: number
}

export default function StockDetailTab() {
  const [symbol, setSymbol] = useState('AAPL')
  const [stock, setStock] = useState<Stock | null>(null)
  const [history, setHistory] = useState<PriceHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [symbols, setSymbols] = useState<string[]>([])
  const [searchTarget, setSearchTarget] = useState('')
  const [searchResult, setSearchResult] = useState<{ index: number; date: string; price: number } | null>(null)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await apiFetch('/stock-query-server/api/stocks')
        const stocks = await res.json()
        setSymbols(stocks.map((s: any) => s.symbol))
      } catch (err) {
        console.error('Failed to fetch symbols:', err)
      }
    }
    fetchSymbols()
  }, [])

  const fetchStock = async (sym: string) => {
    setLoading(true)
    setSearchResult(null)
    setSearchError('')
    try {
      const [detailRes, historyRes] = await Promise.all([
        apiFetch(`/stock-query-server/api/stocks/${sym}`),
        apiFetch(`/stock-query-server/api/stocks/${sym}/history`)
      ])
      setStock(await detailRes.json())
      const histData = await historyRes.json()
      setHistory(histData.history.map((h: any) => ({ date: h.date, price: parseFloat(h.price) })))
    } catch (err) {
      console.error('Failed to fetch stock:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStock(symbol)
  }, [symbol])

  const handleBinarySearch = () => {
    const target = searchTarget.trim()
    if (!target) {
      setSearchError('Enter a price value to search')
      return
    }
    const targetPrice = parseFloat(target)
    if (isNaN(targetPrice)) {
      setSearchError('Enter a valid numeric price')
      return
    }
    const sortedHistory = [...history].sort((a, b) => a.price - b.price)
    const prices = sortedHistory.map(h => h.price)
    let left = 0, right = prices.length - 1
    let found = -1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (Math.abs(prices[mid] - targetPrice) < 0.001) {
        found = mid
        break
      } else if (prices[mid] < targetPrice) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    if (found >= 0) {
      setSearchResult({ index: found, date: sortedHistory[found].date, price: sortedHistory[found].price })
      setSearchError('')
    } else {
      setSearchError(`Price $${targetPrice.toFixed(2)} not found in price history (O(log n) search)`)
      setSearchResult(null)
    }
  }

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d
  }

  return (
    <div className="stock-detail">
      <section className="stock-detail-section">
        <h2>Stock Lookup</h2>
        <div className="symbol-selector">
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            {symbols.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="loading">Loading stock data...</div>
        </div>
      ) : stock ? (
        <>
          <section className="stock-detail-section">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="!mb-0">{stock.symbol}</h2>
              <span className="text-sm text-muted font-medium">{stock.sector}</span>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Current Price</div>
                <div className="metric-value" style={{ color: '#fbbf24' }}>${stock.price.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">7-Day Avg</div>
                <div className="metric-value" style={{ color: '#3b82f6' }}>${stock.avg_7d.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">7-Day Min</div>
                <div className="metric-value" style={{ color: '#ff4d6a' }}>${stock.min_7d.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">7-Day Max</div>
                <div className="metric-value" style={{ color: '#00c896' }}>${stock.max_7d.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">7-Day Change</div>
                <div className={`metric-value ${stock.pct_change_7d >= 0 ? 'gain' : 'loss'}`}>
                  {stock.pct_change_7d >= 0 ? '+' : ''}{stock.pct_change_7d.toFixed(2)}%
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">History Length</div>
                <div className="metric-value" style={{ color: '#8b5cf6' }}>{stock.history_length} days</div>
              </div>
            </div>
          </section>

          <section className="stock-detail-section">
            <h2>90-Day Price History</h2>
            {history.length > 0 && (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={history.map(h => ({ ...h, date: formatDate(h.date) }))}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c896" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        background: '#0d1225',
                        border: '1px solid #1e293b',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9',
                        fontSize: '0.8125rem',
                      }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#00c896" fill="url(#priceGradient)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="stock-detail-section">
            <h2>Binary Search - Price Lookup</h2>
            <p className="text-muted text-sm mb-3">
              Search for a price in the sorted 90-day history using O(log n) binary search.
              Enter a price value to find its position in the sorted price list.
            </p>
            <div className="flex gap-3 items-center flex-wrap">
              <input
                type="number"
                step="0.01"
                placeholder="Enter price (e.g. 150.00)"
                value={searchTarget}
                onChange={e => setSearchTarget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBinarySearch()}
                className="flex-1 min-w-[200px]"
                style={{
                  background: '#080c18',
                  color: '#f1f5f9',
                  border: '1px solid #1e293b',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button onClick={handleBinarySearch} className="run-btn">
                Search
              </button>
            </div>
            {searchResult && (
              <div className="mt-3" style={{
                background: 'rgba(0,200,150,0.06)',
                border: '1px solid rgba(0,200,150,0.25)',
                borderRadius: '0.5rem',
                padding: '1rem',
              }}>
                <div style={{ color: '#00c896', fontSize: '0.875rem', fontWeight: 600 }}>
                  Found: ${searchResult.price.toFixed(2)} at index {searchResult.index} (sorted ascending) on {searchResult.date}
                </div>
              </div>
            )}
            {searchError && (
              <div className="mt-3" style={{
                background: 'rgba(255,77,106,0.06)',
                border: '1px solid rgba(255,77,106,0.25)',
                borderRadius: '0.5rem',
                padding: '1rem',
              }}>
                <div style={{ color: '#ff4d6a', fontSize: '0.875rem', fontWeight: 500 }}>
                  {searchError}
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="error">Stock data not available</div>
        </div>
      )}
    </div>
  )
}
