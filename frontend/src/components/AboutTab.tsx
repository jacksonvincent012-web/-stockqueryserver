import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../context/api'

interface TestResult {
  stdout: string
  stderr: string
  returncode: number
  passed: boolean
}

export default function AboutTab() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [running, setRunning] = useState(false)

  const runTests = async () => {
    setRunning(true)
    try {
      const res = await apiFetch('/stock-query-server/api/tests')
      setTestResults(await res.json())
    } catch (err) {
      console.error('Failed to run tests:', err)
    }
    setRunning(false)
  }

  return (
    <div className="about">
      <section className="about-section">
        <h2>System Design - 5 Steps</h2>
        <div className="design-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Use Cases</h3>
              <ul>
                <li>Live stock ticker with real-time price updates (from simulator OR Yahoo Finance)</li>
                <li>7-day rolling metrics (avg, min, max, % change) computed via DSA engine</li>
                <li>Top-K stocks by volume or gain (heap-based ranking)</li>
                <li>Price alert stack with LIFO undo capability</li>
                <li>Sector graph traversal (BFS/DFS) showing connectivity</li>
                <li>Performance benchmarking at scale (N=1K/10K/100K) to verify Big-O</li>
                <li>Binary search on sorted price history for O(log n) lookups</li>
                <li>User authentication: register, login, JWT token management</li>
                <li>Role-based access: Admin (full), Analyst (alerts), Viewer (read-only)</li>
                <li>Persistent data storage: stocks, alerts, and users across restarts</li>
                <li>Real market data ingestion from Yahoo Finance or Alpha Vantage</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Constraints & Analysis</h3>
              <ul>
                <li>Max 24+ stocks in-memory (dict-backed hash map) or 10K+ in PostgreSQL</li>
                <li>Simulated ticks every 2s OR live quotes from Yahoo Finance API (rate-limited)</li>
                <li>Max alerts stack depth: unlimited (user-scoped when DB-backed)</li>
                <li>Top-K heap size: configurable (default 10)</li>
                <li>Latency target: &lt;100ms per API call (with DB: &lt;200ms)</li>
                <li>Auth: JWT expiry 1h, refresh token 7d, bcrypt password hashing</li>
                <li>RBAC: Admin (full), Analyst (create alerts), Viewer (read-only)</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Basic Design (Extended)</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Five-layer architecture: Frontend → API → DSA Engine → Database → Market Data
              </p>
              <pre>{`┌───────────────────────────────────────┐
│   React Frontend (Vite + Recharts)    │
│   + Auth pages (login/register)       │
│   + Role-aware UI (Admin/Analyst/     │
│     Viewer)                           │
│   + JWT stored in localStorage        │
└───────────────────────────────────────┘
                 │ HTTP/REST + JWT
┌───────────────────────────────────────┐
│  Flask API Server (Port 5000)         │
│  ├─ /api/auth/*   (register, login)  │
│  ├─ /api/stocks/* (JWT required)     │
│  ├─ /api/alerts/* (Analyst+)         │
│  ├─ /api/graph/*  (RBAC enforced)    │
│  ├─ /api/benchmarks                  │
│  └─ JWT middleware + RBAC decorator  │
└───────────────────────────────────────┘
                 │
┌───────────────────────────────────────┐
│  DSA Engine (Pure Python)             │
│  ├─ StockHashMap (dict) → O(1)       │
│  ├─ IngestionQueue (deque) → O(1)    │
│  ├─ AlertStack (list) → O(1)         │
│  ├─ TopKHeap (heapq) → O(log n)     │
│  ├─ SectorGraph (adj-list) → O(V+E) │
│  ├─ MergeSort → O(n log n)           │
│  └─ BinarySearch → O(log n)          │
└───────────────────────────────────────┘
                 │
┌───────────────────────────────────────┐
│  Persistent Database (PostgreSQL)     │
│  ├─ users: id, username, hash, role  │
│  ├─ stocks: symbol, date, price, vol │
│  └─ alerts: user_id, symbol, thresh  │
└───────────────────────────────────────┘
                 │
┌───────────────────────────────────────┐
│  Market Data Source                   │
│  ├─ Simulator (random ticks, testing) │
│  └─ Yahoo Finance / Alpha Vantage     │
│     (real prices via yfinance)        │
└───────────────────────────────────────┘`}</pre>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Bottlenecks & Solutions</h3>
              <ul>
                <li><strong>Hash Collisions:</strong> Python dict handles internally</li>
                <li><strong>Queue Memory:</strong> Drain every 2s, O(1) enqueue/dequeue</li>
                <li><strong>Heap Maintenance:</strong> Top-K only stores K items, O(log K) per update</li>
                <li><strong>Graph Traversal:</strong> BFS/DFS O(V+E), cached adjacency list</li>
                <li><strong>Cache Invalidation:</strong> Polling-based (2s interval), no TTL</li>
                <li><strong>Auth Overhead:</strong> JWT verification per request (~1ms), mitigated by middleware caching</li>
                <li><strong>DB Query Latency:</strong> Indexed columns (symbol, user_id) + connection pooling</li>
                <li><strong>API Rate Limits:</strong> Yahoo Finance capped at 5 req/min; queued with exponential backoff</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Scalability Path</h3>
              <ul>
                <li><strong>Phase 1 (Current):</strong> In-memory simulation, no auth, 37 tests passing</li>
                <li><strong>Phase 2 (Auth):</strong> JWT login, RBAC (Admin/Analyst/Viewer)</li>
                <li><strong>Phase 3 (Persistence):</strong> PostgreSQL for stocks, alerts, users</li>
                <li><strong>Phase 4 (Real Data):</strong> Yahoo Finance API replaces simulator</li>
                <li><strong>Phase 5 (Production):</strong> Redis caching, Docker, CI/CD</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Data Structure Complexity</h2>
        <div className="overflow-x-auto">
          <table className="complexity-table">
            <thead>
              <tr>
                <th>Data Structure</th>
                <th>Use Case</th>
                <th>Insert</th>
                <th>Lookup</th>
                <th>Delete</th>
                <th>Space</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: '#00c896' }}>StockHashMap</strong></td>
                <td>Symbol → Record lookup</td>
                <td>O(1)</td>
                <td>O(1)</td>
                <td>O(1)</td>
                <td>O(n)</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#3b82f6' }}>IngestionQueue</strong></td>
                <td>FIFO tick buffer</td>
                <td>O(1)</td>
                <td>N/A</td>
                <td>O(1)</td>
                <td>O(k)</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#8b5cf6' }}>AlertStack</strong></td>
                <td>LIFO alert management</td>
                <td>O(1)</td>
                <td>N/A</td>
                <td>O(1)</td>
                <td>O(a)</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#fbbf24' }}>TopKHeap</strong></td>
                <td>Top-K stocks by metric</td>
                <td>O(log k)</td>
                <td>O(1)</td>
                <td>O(log k)</td>
                <td>O(k)</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#f97316' }}>SectorGraph</strong></td>
                <td>Sector relationships</td>
                <td>O(1)</td>
                <td>N/A</td>
                <td>O(1)</td>
                <td>O(V+E)</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#06b6d4' }}>MergeSort</strong></td>
                <td>Sort price history</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>O(n log n) time, O(n) space</td>
              </tr>
              <tr>
                <td><strong style={{ color: '#ff4d6a' }}>BinarySearch</strong></td>
                <td>Find date range</td>
                <td>N/A</td>
                <td>O(log n)</td>
                <td>N/A</td>
                <td>O(1) space</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="about-section">
        <h2>Test Results (37 tests)</h2>
        {user?.role === 'admin' ? (
          <>
            <button onClick={runTests} disabled={running} className="run-btn">
              {running ? 'Running tests...' : 'Run Tests'}
            </button>
            {testResults && (
              <div className={`test-output ${testResults.passed ? 'passed' : 'failed'}`}>
                <pre>{testResults.stdout || testResults.stderr}</pre>
              </div>
            )}
          </>
        ) : (
          <div className="auth-error" style={{ marginTop: '0.5rem' }}>
            Only Admin users can run tests. Current role: <strong>{user?.role}</strong>
          </div>
        )}
      </section>

      <section className="about-section">
        <h2>Role Assignment</h2>
        <div className="overflow-x-auto">
          <table className="role-table">
            <tbody>
              <tr>
                <td><strong>Your Name</strong></td>
                <td>Full-Stack Developer, Tech Lead</td>
              </tr>
              <tr>
                <td><strong>Responsibilities</strong></td>
                <td>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '0.8125rem' }}>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      DSA Engine design & implementation (7 structures)
                    </li>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      Flask REST API + JWT auth + RBAC middleware
                    </li>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      React frontend with role-aware UI + auth pages
                    </li>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      PostgreSQL integration with SQLAlchemy ORM
                    </li>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      Yahoo Finance API ingestion (real market data)
                    </li>
                    <li style={{ paddingLeft: '1.25rem', position: 'relative', marginBottom: '0.375rem', color: '#94a3b8' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.5rem', width: '5px', height: '5px', background: '#00c896', borderRadius: '50%' }}></span>
                      Testing (37 pytest cases), benchmarking, Docker
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td><strong>Roles</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                    <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontWeight: 600 }}>Admin</span>
                    <span style={{ background: 'rgba(0,200,150,0.12)', color: '#00c896', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontWeight: 600 }}>Analyst</span>
                    <span style={{ background: 'rgba(148,163,184,0.12)', color: '#94a3b8', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontWeight: 600 }}>Viewer</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
