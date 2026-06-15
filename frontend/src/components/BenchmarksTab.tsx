import React, { useState } from 'react'
import { apiFetch } from '../context/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BenchmarkResult {
  operation: string
  n: number
  time_ms: number
  big_o: string
}

const CHART_COLORS = ['#00c896', '#3b82f6', '#fbbf24', '#8b5cf6', '#ff4d6a', '#06b6d4', '#f97316']

export default function BenchmarksTab() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [running, setRunning] = useState(false)

  const runBenchmarks = async () => {
    setRunning(true)
    try {
      const res = await apiFetch('/stock-query-server/api/benchmarks')
      setResults(await res.json())
    } catch (err) {
      console.error('Failed to run benchmarks:', err)
    }
    setRunning(false)
  }

  const groupedByOperation = Array.from(
    new Set(results.map(r => r.operation))
  ).map(op => ({
    operation: op,
    data: results.filter(r => r.operation === op)
  }))

  return (
    <div className="benchmarks">
      <section className="benchmarks-section">
        <h2>DSA Performance Benchmarks</h2>
        <p className="text-muted text-sm mb-4">
          Tests 7 data structure operations at N=1K, 10K, and 100K to verify asymptotic complexity.
        </p>
        <button onClick={runBenchmarks} disabled={running} className="run-btn">
          {running ? 'Running benchmarks...' : 'Run Benchmarks'}
        </button>
      </section>

      {results.length === 0 ? (
        <div className="empty" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Click "Run Benchmarks" to test performance at scale. Results will display timing for each operation at N=1K, 10K, and 100K.
        </div>
      ) : (
        <>
          <section className="benchmarks-section">
            <h2>Results</h2>
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Big-O</th>
                    <th>N=1K</th>
                    <th>N=10K</th>
                    <th>N=100K</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByOperation.map(({ operation, data }) => (
                    <tr key={operation}>
                      <td className="op-name">{operation}</td>
                      <td className="big-o">{data[0].big_o}</td>
                      <td className="time">{data.find(d => d.n === 1000)?.time_ms.toFixed(3)}ms</td>
                      <td className="time">{data.find(d => d.n === 10000)?.time_ms.toFixed(3)}ms</td>
                      <td className="time">{data.find(d => d.n === 100000)?.time_ms.toFixed(3)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="benchmarks-section">
            <h2>Timing Chart</h2>
            <div className="space-y-6">
              {groupedByOperation.map(({ operation, data }, opIdx) => (
                <div key={operation} className="chart-container">
                  <h3 className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[opIdx % CHART_COLORS.length] }}></span>
                    {operation}
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.map(d => ({ ...d, label: `N=${d.n}` }))}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
                      <Tooltip
                        contentStyle={{
                          background: '#0d1225',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          color: '#f1f5f9',
                          fontSize: '0.8125rem',
                        }}
                      />
                      <Bar
                        dataKey="time_ms"
                        fill={CHART_COLORS[opIdx % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={80}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
