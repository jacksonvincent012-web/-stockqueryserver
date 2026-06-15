import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

interface RegisterPageProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export default function RegisterPage({ onSwitchToLogin, onSuccess }: RegisterPageProps) {
  const { register, googleSignIn } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const err = await register(email, password, username || undefined)
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
    setError('Google sign-in failed. Try email registration instead.')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">Stock Query Server</div>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="reg-username">Username (optional)</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Your display name"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <div className="auth-password-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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
          <div className="auth-field">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <div className="auth-password-wrapper">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
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
                text="signup_with"
                shape="pill"
              />
            </div>
          </>
        )}

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button onClick={onSwitchToLogin} className="auth-link-btn">
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
