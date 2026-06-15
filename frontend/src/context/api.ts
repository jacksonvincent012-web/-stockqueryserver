const STORAGE_KEY = 'stock_query_auth'

interface StoredAuth {
  user: { email: string; username: string; role: string }
  accessToken: string
  refreshToken: string
}

function getAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.user && parsed.accessToken && parsed.refreshToken) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return null
}

function setAuth(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function doRefresh(): Promise<string | null> {
  const auth = getAuth()
  if (!auth) return null
  try {
    const res = await fetch('/stock-query-server/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: auth.refreshToken }),
    })
    if (!res.ok) {
      clearAuth()
      return null
    }
    const data = await res.json()
    const updated = { ...auth, accessToken: data.access_token }
    setAuth(updated)
    return data.access_token
  } catch {
    clearAuth()
    return null
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const auth = getAuth()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (auth) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`
  }
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  let res = await fetch(path, { ...options, headers })

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await doRefresh()
      isRefreshing = false
      refreshQueue.forEach(cb => cb(newToken || ''))
      refreshQueue = []

      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        res = await fetch(path, { ...options, headers })
      } else {
        clearAuth()
        window.location.reload()
      }
    } else {
      // Another refresh is in flight, wait for it
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve)
      })
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        res = await fetch(path, { ...options, headers })
      }
    }
  }

  return res
}
