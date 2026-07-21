import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import ballMark from '../assets/ball.svg'
import { navByRow } from '../nav'
import { LogoutIcon } from './icons'
import TournamentsPage from '../pages/TournamentsPage'
import TeamsPage from '../pages/TeamsPage'
import MatchesPage from '../pages/MatchesPage'
import EnrollmentPage from '../pages/EnrollmentPage'
import PlayerRequestsPage from '../pages/PlayerRequestsPage'
import StandingsPage from '../pages/StandingsPage'
import MatchEventsPage from '../pages/MatchEventsPage'
import ScorersPage from '../pages/ScorersPage'
import SuspensionsPage from '../pages/SuspensionsPage'
import RosterPage from '../pages/RosterPage'
import RefereeDashboard from '../pages/RefereeDashboard'

function NavRow({ items, view, setView }) {
  if (!items.length) return null
  return (
    <nav className="shell__nav" aria-label="Principal">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = view === item.key
        const cls = ['shell__nav-item', isActive ? 'is-active' : '', item.comingSoon ? 'is-coming' : ''].filter(Boolean).join(' ')
        return (
          <button key={item.key} type="button" className={cls}
            onClick={() => !item.comingSoon && setView(item.key)}
            aria-current={isActive ? 'page' : undefined} disabled={item.comingSoon}>
            <Icon /><span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const [view, setView] = useState('tournaments')
  const { primary, secondary } = navByRow(user.role?.name)

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

        <div className="shell__topbar-inner">
          {primary.length > 0 && <NavRow items={primary} view={view} setView={setView} />}
          {secondary.length > 0 && <NavRow items={secondary} view={view} setView={setView} />}
        </div>

        <div className="shell__user">
          <div className="shell__user-id">
            <span className="shell__user-name">{user.first_name} {user.last_name}</span>
            <span className="shell__user-role">{user.role?.name}</span>
          </div>
          <span className="shell__avatar" aria-hidden="true">{initials.toUpperCase()}</span>
          <button type="button" className="shell__logout" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main className="shell__main">
        {view === 'tournaments' && <TournamentsPage />}
        {view === 'teams' && <TeamsPage onNavigateToRoster={() => setView('roster')} />}
        {view === 'matches' && <MatchesPage />}
        {view === 'standings' && <StandingsPage />}
        {view === 'scorers' && <ScorersPage />}
        {view === 'roster' && <RosterPage />}
        {view === 'suspensions' && <SuspensionsPage />}
        {view === 'referee' && <RefereeDashboard />}
        {view === 'match-events' && <MatchEventsPage />}
        {view === 'enrollment' && <EnrollmentPage />}
        {view === 'player-requests' && <PlayerRequestsPage />}
      </main>
    </div>
  )
}