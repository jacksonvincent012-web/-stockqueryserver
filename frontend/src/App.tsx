import React, { useState } from 'react'
import { useAuth } from './context/AuthContext'
import DashboardTab from './components/DashboardTab'
import StockDetailTab from './components/StockDetailTab'
import AlertsTab from './components/AlertsTab'
import GraphTab from './components/GraphTab'
import BenchmarksTab from './components/BenchmarksTab'
import AboutTab from './components/AboutTab'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import './styles/theme.css'

export default function App() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showLogin, setShowLogin] = useState(true)

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'stock-detail', label: 'Stock Detail' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'graph', label: 'Graph' },
    { key: 'benchmarks', label: 'Benchmarks' },
    { key: 'about', label: 'About' },
  ]

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-container">
        {showLogin ? (
          <LoginPage
            onSwitchToRegister={() => setShowLogin(false)}
            onSuccess={() => {}}
          />
        ) : (
          <RegisterPage
            onSwitchToLogin={() => setShowLogin(true)}
            onSuccess={() => setShowLogin(true)}
          />
        )}
      </div>
    )
  }

  const roleBadgeColor =
    user.role === 'admin' ? '#3b82f6' :
    user.role === 'analyst' ? '#00c896' :
    '#94a3b8'

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Stock Query Server</div>
        <div className="navbar-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="navbar-right">
          <span className="navbar-user">
            <span className="navbar-user-name">{user.username}</span>
            <span
              className="navbar-user-role"
              style={{ background: `${roleBadgeColor}20`, color: roleBadgeColor, borderColor: roleBadgeColor }}
            >
              {user.role}
            </span>
          </span>
          <button className="navbar-logout" onClick={logout}>
            Sign Out
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'stock-detail' && <StockDetailTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'graph' && <GraphTab />}
        {activeTab === 'benchmarks' && <BenchmarksTab />}
        {activeTab === 'about' && <AboutTab />}
      </main>
    </div>
  )
}
