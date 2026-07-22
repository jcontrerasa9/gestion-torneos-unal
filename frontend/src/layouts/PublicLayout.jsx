import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { BallIcon, MenuIcon, XIcon } from '../components/icons'

export function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand" aria-label="Torneos UNAL — inicio">
      <span className="brand__mark" aria-hidden="true">
        <BallIcon />
      </span>
      <span>
        Torneos UNAL
        <small>Sede La Nubia</small>
      </span>
    </Link>
  )
}

export default function PublicLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="pub">
      <header className="pub__topbar">
        <div className="pub__topbar-inner">
          <Brand />
          <button
            type="button"
            className="icon-btn pub__burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
          <nav className={`pub__nav ${open ? 'is-open' : ''}`} aria-label="Navegación pública">
            <NavLink to="/" end className={({ isActive }) => `pub__nav-link ${isActive ? 'is-active' : ''}`}>
              Inicio
            </NavLink>
            <NavLink to="/torneos" className={({ isActive }) => `pub__nav-link ${isActive ? 'is-active' : ''}`}>
              Torneos
            </NavLink>
            {user ? (
              <Link to="/app" className="btn btn--primary btn--sm pub__nav-cta">
                Ir a la app
              </Link>
            ) : (
              <Link to="/login" className="btn btn--primary btn--sm pub__nav-cta">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="pub__main">
        <Outlet />
      </main>

      <footer className="pub__footer">
        <div className="pub__footer-inner">
          <span>Torneos UNAL · Sede La Nubia</span>
          <span>Fútbol 5 y Fútbol 11 · Posiciones y goleadores actualizados tras cada partido</span>
        </div>
      </footer>
    </div>
  )
}
