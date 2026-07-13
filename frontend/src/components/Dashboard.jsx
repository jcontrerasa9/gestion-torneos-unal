import { useAuth } from '../context/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="auth__loading">
      <div className="auth__card auth__enter" style={{ alignItems: 'center', textAlign: 'center', gap: '14px' }}>
        <span className="auth__brand-mark">
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