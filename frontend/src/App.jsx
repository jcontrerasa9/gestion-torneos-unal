import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function AuthGate() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('login')

  if (loading) {
    return (
      <div className="auth__loading" role="status" aria-live="polite">
        <span className="auth__loading-mark">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.5l2.7 2.7-1 3.8 3.7 1 1 3.8-2.7 2.7-3.7-1-2.7 2.7-1-3.8-3.7-1 1-3.8 3.7-1z"
              fill="white"
              opacity="0.95"
            />
            <path
              d="M12 7.5l1.4 1.4-.5 1.9 1.9.5.5 1.9-1.4 1.4-1.9-.5-1.4 1.4-.5-1.9-1.9-.5.5-1.9 1.9-.5z"
              fill="#7c3aed"
            />
          </svg>
        </span>
        <span className="sr-only">Cargando torneos…</span>
      </div>
    )
  }

  if (user) return <Dashboard />

  return view === 'register' ? (
    <Register onSwitch={setView} />
  ) : (
    <Login onSwitch={setView} />
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App