import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function Root() {
  const app = (
    <AuthProvider>
      <App />
    </AuthProvider>
  )

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {app}
      </GoogleOAuthProvider>
    )
  }

  return app
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
