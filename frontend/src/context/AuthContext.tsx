import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  email: string
  username: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string, username?: string) => Promise<string | null>
  googleSignIn: (idToken: string, email: string, name: string) => Promise<string | null>
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'stock_query_auth'

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.user && parsed.accessToken && parsed.refreshToken) {
        return { ...parsed, loading: false }
      }
    }
  } catch { /* ignore */ }
  return { user: null, accessToken: null, refreshToken: null, loading: false }
}

function saveAuth(state: AuthState) {
  if (state.user && state.accessToken && state.refreshToken) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({ ...loadAuth(), loading: true }))

  useEffect(() => {
    // Verify stored token is still valid by calling /me
    const verify = async () => {
      const saved = loadAuth()
      if (!saved.accessToken) {
        setState({ user: null, accessToken: null, refreshToken: null, loading: false })
        return
      }
      try {
        const res = await fetch('/stock-query-server/api/auth/me', {
          headers: { Authorization: `Bearer ${saved.accessToken}` },
        })
        if (res.ok) {
          const user = await res.json()
          setState({ user, accessToken: saved.accessToken, refreshToken: saved.refreshToken, loading: false })
        } else {
          // Token expired, try refresh
          const refreshRes = await fetch('/stock-query-server/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: saved.refreshToken }),
          })
          if (refreshRes.ok) {
            const data = await refreshRes.json()
            const newState = {
              user: saved.user,
              accessToken: data.access_token,
              refreshToken: saved.refreshToken,
              loading: false,
            }
            setState(newState)
            saveAuth(newState)
          } else {
            setState({ user: null, accessToken: null, refreshToken: null, loading: false })
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch {
        setState({ user: null, accessToken: null, refreshToken: null, loading: false })
      }
    }
    verify()
  }, [])

  const setAuth = (user: User, accessToken: string, refreshToken: string) => {
    const newState: AuthState = { user, accessToken, refreshToken, loading: false }
    setState(newState)
    saveAuth(newState)
  }

  const clearAuth = () => {
    const newState: AuthState = { user: null, accessToken: null, refreshToken: null, loading: false }
    setState(newState)
    saveAuth(newState)
  }

  const handleResponse = async (res: Response): Promise<string | null> => {
    const data = await res.json()
    if (!res.ok) return data.error || 'Request failed'
    setAuth(data.user, data.access_token, data.refresh_token)
    return null
  }

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/stock-query-server/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return handleResponse(res)
    } catch { return 'Network error' }
  }, [])

  const register = useCallback(async (email: string, password: string, username?: string): Promise<string | null> => {
    try {
      const res = await fetch('/stock-query-server/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })
      return handleResponse(res)
    } catch { return 'Network error' }
  }, [])

  const googleSignIn = useCallback(async (idToken: string, email: string, name: string): Promise<string | null> => {
    try {
      const res = await fetch('/stock-query-server/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken, email, name }),
      })
      return handleResponse(res)
    } catch { return 'Network error' }
  }, [])

  const logout = useCallback(async () => {
    if (state.refreshToken) {
      try {
        await fetch('/stock-query-server/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.accessToken}`,
          },
          body: JSON.stringify({ refresh_token: state.refreshToken }),
        })
      } catch { /* ignore */ }
    }
    clearAuth()
  }, [state.accessToken, state.refreshToken])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!state.refreshToken) return false
    try {
      const res = await fetch('/stock-query-server/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: state.refreshToken }),
      })
      if (!res.ok) {
        clearAuth()
        return false
      }
      const data = await res.json()
      const newState: AuthState = {
        ...state,
        accessToken: data.access_token,
      }
      setState(newState)
      saveAuth(newState)
      return true
    } catch {
      clearAuth()
      return false
    }
  }, [state])

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      googleSignIn,
      logout,
      refreshAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
