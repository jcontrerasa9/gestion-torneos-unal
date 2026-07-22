import { useEffect } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { dedupe, readCache } from '../../api/cache'
import {
  fetchPublicMatches,
  fetchPublicScorers,
  fetchPublicStandings,
  fetchPublicTournament,
} from '../../api/public'
import { ArrowLeftIcon, BallIcon, CalendarIcon, TableIcon } from '../../components/icons'
import { formatDateRange, tournamentLabels } from '../../utils/format'

const TABS = [
  { to: 'posiciones', label: 'Posiciones', icon: TableIcon },
  { to: 'goleadores', label: 'Goleadores', icon: BallIcon },
  { to: 'calendario', label: 'Calendario', icon: CalendarIcon },
]

export default function TournamentPublic() {
  const { id } = useParams()
  const { data, status } = useFetch(
    `public:tournament:${id}`,
    () => fetchPublicTournament(id),
    { ttl: 120_000 },
  )
  const tournament = data?.data ?? null

  // ED-1: precarga las 3 tabs en paralelo; cada tab usa las mismas keys,
  // así que cambiar de tab es instantáneo (caché o dedupe en vuelo).
  useEffect(() => {
    const prefetch = [
      [`public:standings:${id}`, () => fetchPublicStandings(id)],
      [`public:scorers:${id}`, () => fetchPublicScorers(id)],
      ['public:matches', fetchPublicMatches],
    ]
    for (const [key, fetcher] of prefetch) {
      if (!readCache(key, 60_000)) {
        dedupe(key, fetcher).catch(() => {
          // El error lo muestra la tab correspondiente con opción de reintento.
        })
      }
    }
  }, [id])

  return (
    <>
      <section className="tournament-hero">
        <div className="tournament-hero__inner">
          <Link to="/torneos" className="tournament-hero__back">
            <ArrowLeftIcon width={15} height={15} />
            Todos los torneos
          </Link>
          <h1 className="tournament-hero__name">
            {status === 'loading' ? '…' : (tournament?.name ?? 'Torneo')}
          </h1>
          {tournament && (
            <div className="tournament-hero__meta">
              <span>{tournamentLabels.modality[tournament.modality] ?? tournament.modality}</span>
              <span>{formatDateRange(tournament.start_date, tournament.end_date)}</span>
            </div>
          )}
          <nav className="tabs" aria-label="Secciones del torneo">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={`/t/${id}/${tab.to}`}
                className={({ isActive }) =>
                  `tabs__item ${isActive ? 'is-active' : ''}`
                }
              >
                <tab.icon />
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </section>
      <div className="page">
        <Outlet context={{ tournamentId: id, tournament }} />
      </div>
    </>
  )
}
