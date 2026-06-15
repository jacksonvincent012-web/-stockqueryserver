import React, { useState, useEffect } from 'react'
import { apiFetch } from '../context/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Stock {
  symbol: string
  price: number
  volume: number
  sector: string
  pct_change_7d?: number
}

interface CacheStats {
  hits: number
  misses: number
  total: number
  hit_rate: number
}

interface TopKItem {
  symbol: string
  metric: number
}

interface Alert {
  symbol: string
  threshold: number
  triggered: boolean
}

const SECTOR_COLORS: Record<string, string> = {
  'TECH': '#3b82f6',
  'FINANCE': '#00c896',
  'HEALTHCARE': '#8b5cf6',
  'ENERGY': '#fbbf24',
  'CONSUMER': '#f97316',
}

export default function DashboardTab() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [topK, setTopK] = useState<TopKItem[]>([])
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [k, setK] = useState(5)
  const [by, setBy] = useState<'volume' | 'gain'>('volume')

  const fetchData = async () => {
    try {
      const [stocksRes, topKRes, cacheRes, alertsRes] = await Promise.all([
        apiFetch('/stock-query-server/api/stocks'),
        apiFetch(`/stock-query-server/api/top-k?k=${k}&by=${by}`),
        apiFetch('/stock-query-server/api/cache/stats'),
        apiFetch('/stock-query-server/api/alerts')
      ])
      const stocksData: Stock[] = await stocksRes.json()
      const detailedStocks = await Promise.all(
        stocksData.slice(0, 20).map(async (s) => {
          try {
            const res = await apiFetch(`/stock-query-server/api/stocks/${s.symbol}`)
            const detail = await res.json()
            return { ...s, pct_change_7d: detail.pct_change_7d }
          } catch {
            return { ...s, pct_change_7d: 0 }
          }
        })
      )
      setStocks(detailedStocks)
      setTopK((await topKRes.json()).top_k)
      setCacheStats(await cacheRes.json())
      setAlerts(await alertsRes.json())
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [k, by])

  const isAlertTriggered = (symbol: string) =>
    alerts.some(a => a.symbol === symbol && a.triggered)

  const hasActiveAlert = (symbol: string) =>
    alerts.some(a => a.symbol === symbol && !a.triggered)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="loading">Loading live data feed...</div>
    </div>
  )

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <h2>Live Ticker</h2>
        <div className="overflow-x-auto">
          <table className="ticker-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
                <th>Volume</th>
                <th>Sector</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(s => {
                const change = s.pct_change_7d ?? 0
                const isGain = change >= 0
                const sectorColor = SECTOR_COLORS[s.sector] || '#94a3b8'
                return (
                  <tr key={s.symbol}>
                    <td className="symbol">{s.symbol}</td>
                    <td className="price">${s.price.toFixed(2)}</td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          background: isGain ? 'rgba(0,200,150,0.12)' : 'rgba(255,77,106,0.12)',
                          color: isGain ? '#00c896' : '#ff4d6a',
                        }}
                      >
                        {isGain ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="volume">{(s.volume / 1e6).toFixed(1)}M</td>
                    <td>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: sectorColor }}
                      >
                        {s.sector}
                      </span>
                    </td>
                    <td>
                      {isAlertTriggered(s.symbol) ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-loss text-white">
                          Triggered
                        </span>
                      ) : hasActiveAlert(s.symbol) ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-primary text-white">
                          Active
                        </span>
                      ) : (
                        <span className="text-muted text-xs">--</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="dashboard-section">
          <h2>Top-K Stocks</h2>
          <div className="controls">
            <label>K:
              <input type="number" min="1" max="20" value={k} onChange={e => setK(Math.max(1, Math.min(20, +e.target.value)))} />
            </label>
            <label>By:
              <select value={by} onChange={e => setBy(e.target.value as any)}>
                <option value="volume">Volume</option>
                <option value="gain">Gain %</option>
              </select>
            </label>
          </div>
          <div className="top-k-list">
            {topK.map((item, i) => (
              <div key={i} className="top-k-item">
                <span className="rank">#{i + 1}</span>
                <span className="symbol">{item.symbol}</span>
                <span className="metric">{item.metric.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Cache Performance</h2>
          {cacheStats ? (
            <div className="cache-stats">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#3b82f6' }}>{cacheStats.hits}</div>
                <div className="stat-label">Hits</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f97316' }}>{cacheStats.misses}</div>
                <div className="stat-label">Misses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{
                  color: cacheStats.hit_rate > 50 ? '#00c896' : '#fbbf24'
                }}>
                  {cacheStats.hit_rate.toFixed(1)}%
                </div>
                <div className="stat-label">Hit Rate</div>
              </div>
            </div>
          ) : (
            <div className="empty">No cache data</div>
          )}
        </section>
      </div>
    </div>
  )
}
