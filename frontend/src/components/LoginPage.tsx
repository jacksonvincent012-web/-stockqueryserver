import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

interface LoginPageProps {
  onSwitchToRegister: () => void
  onSuccess: () => void
}

export default function LoginPage({ onSwitchToRegister, onSuccess }: LoginPageProps) {
  const { login, googleSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      onSuccess()
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('')
    setLoading(true)
    const idToken = credentialResponse.credential || ''
    const err = await googleSignIn(idToken, `${Date.now()}-google@temp.dev`, 'Google User')
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      onSuccess()
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-in failed. Try email login instead.')
  }

  const fillDemo = (role: string, pw: string) => {
    setEmail(`${role}@stockquery.io`)
    setPassword(pw)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">Stock Query Server</div>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <div className="auth-google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="pill"
              />
            </div>
          </>
        )}

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <button onClick={onSwitchToRegister} className="auth-link-btn">
            Create one
          </button>
        </div>

        <details className="auth-demo">
          <summary>Demo accounts (click to fill)</summary>
          <div className="auth-demo-accounts">
            <button onClick={() => fillDemo('admin', 'admin123')}>Admin</button>
            <button onClick={() => fillDemo('analyst', 'analyst123')}>Analyst</button>
            <button onClick={() => fillDemo('viewer', 'viewer123')}>Viewer</button>
          </div>
        </details>
      </div>
    </div>
  )
}
