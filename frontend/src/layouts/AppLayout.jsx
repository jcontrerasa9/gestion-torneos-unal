import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useRole } from '../hooks/useRole'
import { navForRole } from '../nav'
import { Brand } from './PublicLayout'
import { LogoutIcon, MoreIcon } from '../components/icons'

const ROLE_LABELS = {
  admin: 'Administrador',
  captain: 'Capitán',
  referee: 'Árbitro',
  player: 'Jugador',
  student: 'Estudiante',
}

function UserBlock({ user, onLogout }) {
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`
  return (
    <div className="app__sidebar-foot">
      <span className="avatar" aria-hidden="true">
        {initials.toUpperCase()}
      </span>
      <div className="app__user">
        <span className="app__user-name">
          {user.first_name} {user.last_name}
        </span>
        <span className="app__user-role">
          {ROLE_LABELS[user.role?.name] ?? user.role?.name}
        </span>
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={onLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogoutIcon />
      </button>
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const items = navForRole(role)
  const mobileItems = items.filter((i) => i.mobile).slice(0, 4)
  const moreItems = items.filter((i) => !mobileItems.includes(i))

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const linkCls = (base) =>
    ({ isActive }) => `${base} ${isActive ? 'is-active' : ''}`.trim()

  return (
    <div className="app">
      {/* Sidebar (desktop) */}
      <aside className="app__sidebar">
        <div className="app__brand">
          <Brand to="/app" />
        </div>
        <nav className="app__nav" aria-label="Navegación principal">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkCls('app__nav-item')}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <UserBlock user={user} onLogout={handleLogout} />
      </aside>

      {/* Topbar (móvil) */}
      <header className="app__topbar">
        <Brand to="/app" />
        <div className="app__user">
          <span className="app__user-name">
            {user.first_name} {user.last_name}
          </span>
          <span className="app__user-role">
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
      </header>

      <main className="app__main">
        <Outlet />
      </main>

      {/* Bottom bar (móvil) */}
      <nav className="app__bottombar" aria-label="Navegación móvil">
        {mobileItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkCls('app__bottombar-item')}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          className="app__bottombar-item"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
        >
          <MoreIcon />
          Más
        </button>
      </nav>

      {/* Sheet "Más" */}
      {moreOpen && (
        <div className="more-sheet" role="dialog" aria-modal="true" aria-label="Más opciones">
          <button
            type="button"
            className="more-sheet__backdrop"
            onClick={() => setMoreOpen(false)}
            aria-label="Cerrar"
          />
          <div className="more-sheet__panel">
            <div className="more-sheet__grip" aria-hidden="true" />
            {moreItems.map((item) => (
              <button
                key={item.to}
                type="button"
                className="more-sheet__item"
                onClick={() => {
                  setMoreOpen(false)
                  navigate(item.to)
                }}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="more-sheet__item is-danger"
              onClick={() => {
                setMoreOpen(false)
                handleLogout()
              }}
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
