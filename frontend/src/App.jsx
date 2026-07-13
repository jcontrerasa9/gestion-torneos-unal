import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { BrandMark } from './components/auth/AuthLayout'
import './App.css'

function AuthGate() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('login')

  if (loading) {
    return (
      <div className="auth__loading" role="status" aria-live="polite">
        <span className="auth__loading-mark">
          <BrandMark />
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