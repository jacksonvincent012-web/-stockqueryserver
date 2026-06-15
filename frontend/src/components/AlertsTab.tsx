import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../context/api'

interface Alert {
  symbol: string
  threshold: number
  triggered: boolean
}

export default function AlertsTab() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [symbol, setSymbol] = useState('')
  const [threshold, setThreshold] = useState('')
  const [symbols, setSymbols] = useState<string[]>([])

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

  const fetchAlerts = async () => {
    try {
      const res = await apiFetch('/stock-query-server/api/alerts')
      setAlerts(await res.json())
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol || !threshold) return

    try {
      await apiFetch('/stock-query-server/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, threshold: parseFloat(threshold) })
      })
      setSymbol('')
      setThreshold('')
      fetchAlerts()
    } catch (err) {
      console.error('Failed to add alert:', err)
    }
  }

  const handleUndo = async () => {
    try {
      await apiFetch('/stock-query-server/api/alerts/undo', { method: 'DELETE' })
      fetchAlerts()
    } catch (err) {
      console.error('Failed to undo:', err)
    }
  }

  const triggeredCount = alerts.filter(a => a.triggered).length
  const pendingCount = alerts.filter(a => !a.triggered).length

  return (
    <div className="alerts">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="alerts-section">
          <h2>Create Alert</h2>
          {user?.role === 'viewer' ? (
            <div className="auth-error" style={{ marginBottom: '1rem' }}>
              Viewers cannot create alerts. Ask an Analyst or Admin to create one.
            </div>
          ) : (
            <form onSubmit={handleAddAlert} className="alert-form">
              <select value={symbol} onChange={e => setSymbol(e.target.value)} required>
                <option value="">Select Symbol</option>
                {symbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Threshold price (e.g. 180.00)"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                required
              />
              <button type="submit" disabled={!symbol || !threshold}>Add Alert</button>
            </form>
          )}

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }}></span>
              <span className="text-muted">Pending: {pendingCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: '#ff4d6a' }}></span>
              <span className="text-muted">Triggered: {triggeredCount}</span>
            </div>
          </div>
        </section>

        <section className="alerts-section">
          <div className="alerts-header">
            <h2>Alert Stack</h2>
            {user?.role !== 'viewer' && (
              <button onClick={handleUndo} className="undo-btn" disabled={alerts.length === 0}>
                Undo Last
              </button>
            )}
          </div>
          <div className="alert-stack">
            {alerts.length === 0 ? (
              <div className="empty">No alerts yet. Create one above.</div>
            ) : (
              [...alerts].reverse().map((alert, idx) => (
                <div key={idx} className={`alert-item ${alert.triggered ? 'triggered' : ''}`}>
                  <div className="alert-symbol">{alert.symbol}</div>
                  <div className="alert-threshold">
                    Threshold: <strong>${alert.threshold.toFixed(2)}</strong>
                  </div>
                  <div className={`alert-status ${alert.triggered ? 'triggered' : 'pending'}`}>
                    {alert.triggered ? 'Triggered' : 'Pending'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
