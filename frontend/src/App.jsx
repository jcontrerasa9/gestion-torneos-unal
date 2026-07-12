import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <section id="loading">
        <p>Cargando…</p>
      </section>
    )
  }

  return user ? <Dashboard /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App