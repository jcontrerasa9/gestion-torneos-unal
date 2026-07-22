import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublicMatches } from '../../api/public'
import { itemsOf } from '../../api/helpers'
import MatchCard from '../../components/matches/MatchCard'
import CalendarSubscription from '../../components/matches/CalendarSubscription'
import EmptyState from '../../components/ui/EmptyState'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, CalendarIcon } from '../../components/icons'

function sortByDateAsc(a, b) {
  return `${a.match_date}T${a.match_time ?? ''}`.localeCompare(
    `${b.match_date}T${b.match_time ?? ''}`,
  )
}

export default function PublicSchedule() {
  const { tournamentId, tournament } = useOutletContext()
  const { data, status, error, refetch } = useFetch(
    'public:matches',
    fetchPublicMatches,
    { ttl: 60_000 },
  )

  const matches = useMemo(
    () => itemsOf(data).filter((m) => String(m.tournament_id) === String(tournamentId)),
    [data, tournamentId],
  )

  const live = matches.filter((m) => m.status === 'en_juego')
  const upcoming = matches.filter((m) => m.status === 'programado').sort(sortByDateAsc)
  const finished = matches
    .filter((m) => m.status === 'finalizado')
    .sort(sortByDateAsc)
    .reverse()

  if (status === 'loading') return <CardsSkeleton count={4} />

  if (status === 'error') {
    return (
      <div className="error-banner" role="alert">
        <AlertIcon />
        {error?.status === 401
          ? 'El calendario aún no está disponible públicamente. Inténtalo más tarde.'
          : (error?.message ?? 'No pudimos cargar el calendario.')}
        <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="filter-bar" style={{ justifyContent: 'flex-end' }}>
        <CalendarSubscription
          tournamentId={tournamentId}
          tournamentName={tournament?.name}
        />
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Sin partidos programados"
          text="Cuando la administración publique el calendario del torneo, los partidos aparecerán aquí."
        />
      ) : (
        <>
          {live.length > 0 && (
            <section aria-label="Partidos en juego">
              <div className="section__head">
                <h2 className="section__title" style={{ fontSize: 17 }}>En juego</h2>
              </div>
              <div className="match-cards">
                {live.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section aria-label="Próximos partidos">
              <div className="section__head">
                <h2 className="section__title" style={{ fontSize: 17 }}>Próximos</h2>
              </div>
              <div className="match-cards">
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {finished.length > 0 && (
            <section aria-label="Resultados">
              <div className="section__head">
                <h2 className="section__title" style={{ fontSize: 17 }}>Resultados</h2>
              </div>
              <div className="match-cards">
                {finished.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
