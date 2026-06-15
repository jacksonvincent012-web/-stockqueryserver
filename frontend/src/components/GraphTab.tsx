import React, { useState, useEffect } from 'react'
import { apiFetch } from '../context/api'

interface AdjacencyList {
  [key: string]: string[]
}

export default function GraphTab() {
  const [adjacencyList, setAdjacencyList] = useState<AdjacencyList>({})
  const [selectedNode, setSelectedNode] = useState('TECH')
  const [traversal, setTraversal] = useState<string[]>([])
  const [traversalType, setTraversalType] = useState<'bfs' | 'dfs'>('bfs')

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await apiFetch('/stock-query-server/api/graph/adjacency')
        setAdjacencyList(await res.json())
      } catch (err) {
        console.error('Failed to fetch graph:', err)
      }
    }
    fetchGraph()
  }, [])

  const handleTraverse = async () => {
    try {
      const endpoint = traversalType === 'bfs' ? 'bfs' : 'dfs'
      const res = await apiFetch(`/stock-query-server/api/graph/${endpoint}?from=${selectedNode}`)
      const data = await res.json()
      setTraversal(data.traversal)
    } catch (err) {
      console.error('Failed to traverse:', err)
    }
  }

  const nodes = Object.keys(adjacencyList)

  return (
    <div className="graph">
      <section className="graph-section">
        <h2>Sector Graph Traversal</h2>
        <div className="controls">
          <label>Start Node:
            <select value={selectedNode} onChange={e => setSelectedNode(e.target.value)}>
              {nodes.map(node => (
                <option key={node} value={node}>{node}</option>
              ))}
            </select>
          </label>
          <label>Method:
            <select value={traversalType} onChange={e => setTraversalType(e.target.value as any)}>
              <option value="bfs">BFS (Breadth-First)</option>
              <option value="dfs">DFS (Depth-First)</option>
            </select>
          </label>
          <button onClick={handleTraverse} className="run-btn">
            Run Traversal
          </button>
        </div>
      </section>

      <section className="graph-section">
        <h2>Adjacency List</h2>
        <div className="adjacency-view">
          {Object.entries(adjacencyList).map(([node, neighbors]) => {
            const isSelected = node === selectedNode
            return (
              <div
                key={node}
                className="node-edges"
                style={{
                  borderColor: isSelected ? 'rgba(251,191,36,0.4)' : undefined,
                  boxShadow: isSelected ? '0 0 20px rgba(251,191,36,0.06)' : undefined,
                }}
              >
                <div className="node-name" style={{
                  color: isSelected ? '#fbbf24' : undefined,
                }}>
                  {node} {isSelected && '(start)'}
                </div>
                <div className="edges">
                  {neighbors.length === 0 ? (
                    <span className="text-muted text-xs italic">No outgoing edges</span>
                  ) : (
                    neighbors.map(neighbor => (
                      <span key={neighbor} className="edge-arrow">→ {neighbor}</span>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="graph-section">
        <h2>{traversalType.toUpperCase()} Traversal Result</h2>
        <div className="traversal-result">
          {traversal.length === 0 ? (
            <p className="text-muted text-sm">Select a start node and run traversal to see results. The path will show the order nodes are visited.</p>
          ) : (
            <>
              <div className="traversal-path">
                {traversal.map((node, idx) => (
                  <React.Fragment key={node}>
                    <span className="traversal-node"
                      style={{
                        background: idx === 0
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : undefined,
                      }}
                    >
                      {node}
                    </span>
                    {idx < traversal.length - 1 && <span className="traversal-arrow">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted">
                Total nodes visited: {traversal.length} | Method: {traversalType.toUpperCase()} | Start: {selectedNode}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
