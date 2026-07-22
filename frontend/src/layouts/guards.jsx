import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useRole } from '../hooks/useRole'
import { BallIcon } from '../components/icons'

export function FullScreenLoader({ label = 'Cargando…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '60svh',
        display: 'grid',
        placeItems: 'center',
        alignContent: 'center',
        gap: 14,
        color: 'var(--pitch)',
      }}
    >
      <span className="brand__mark" style={{ width: 48, height: 48, borderRadius: 14 }}>
        <BallIcon />
      </span>
      <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>{label}</span>
    </div>
  )
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader label="Verificando sesión…" />
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return children
}

export function RequireRole({ roles, children }) {
  const { role } = useRole()
  if (!roles.includes(role)) {
    return <Navigate to="/app" replace />
  }
  return children
}
