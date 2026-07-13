import { useAuth } from '../context/useAuth'
import { BrandMark } from './auth/AuthLayout'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="auth__loading">
      <div
        className="auth__card auth__enter"
        style={{ alignItems: 'center', textAlign: 'center', gap: '14px' }}
      >
        <span className="auth__brand-mark">
          <BrandMark />
        </span>
        <h1 className="auth__title" style={{ margin: 0 }}>
          Hola, {user.first_name} {user.last_name}
        </h1>
        <p className="auth__subtitle">
          Rol: <strong style={{ color: 'var(--purple-light)' }}>{user.role?.name ?? '—'}</strong>
        </p>
        <button type="button" className="btn btn--primary" onClick={logout}>
          <span className="btn__content">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}