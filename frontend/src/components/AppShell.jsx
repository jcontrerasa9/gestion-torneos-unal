import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import ballMark from '../assets/ball.svg'
import { filterNavForRole } from '../nav'
import { LogoutIcon } from './icons'
import TournamentsPage from '../pages/TournamentsPage'
import TeamsPage from '../pages/TeamsPage'
import MatchesPage from '../pages/MatchesPage'
import EnrollmentPage from '../pages/EnrollmentPage'
import PlayerRequestsPage from '../pages/PlayerRequestsPage'

export default function AppShell() {
  const { user, logout } = useAuth()
  const [view, setView] = useState('tournaments')
  const nav = filterNavForRole(user.role?.name)

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`

  return (
    <div className="shell">
      <header className="shell__topbar">
        <div className="shell__brand">
          <span className="shell__brand-mark">
            <img src={ballMark} alt="" role="presentation" />
          </span>
          Torneos UNAL
        </div>

        <nav className="shell__nav" aria-label="Principal">
          {nav.map((item) => {
            const Icon = item.icon
            const isActive = view === item.key
            const className = [
              'shell__nav-item',
              isActive ? 'is-active' : '',
              item.comingSoon ? 'is-coming' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={item.key}
                type="button"
                className={className}
                onClick={() => !item.comingSoon && setView(item.key)}
                aria-current={isActive ? 'page' : undefined}
                disabled={item.comingSoon}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="shell__user">
          <div className="shell__user-id">
            <span className="shell__user-name">
              {user.first_name} {user.last_name}
            </span>
            <span className="shell__user-role">{user.role?.name}</span>
          </div>
          <span className="shell__avatar" aria-hidden="true">
            {initials.toUpperCase()}
          </span>
          <button
            type="button"
            className="shell__logout"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main className="shell__main">
        {view === 'tournaments' && <TournamentsPage />}
        {view === 'teams' && <TeamsPage />}
        {view === 'matches' && <MatchesPage />}
        {view === 'enrollment' && <EnrollmentPage />}
        {view === 'player-requests' && <PlayerRequestsPage />}
      </main>
    </div>
  )
}