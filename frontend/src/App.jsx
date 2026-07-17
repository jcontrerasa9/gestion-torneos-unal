import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Login from './components/Login'
import Register from './components/Register'
import AppShell from './components/AppShell'
import HeroBall from './components/auth/HeroBall'
import './App.css'
import './shell.css'

function AuthGate() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('login')

  if (loading) {
    return (
      <div className="auth__loading" role="status" aria-live="polite">
        <span className="auth__loading-mark">
          <HeroBall width={28} height={28} />
        </span>
        <span className="sr-only">Cargando torneos…</span>
      </div>
    )
  }

  if (user) return <AppShell />

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