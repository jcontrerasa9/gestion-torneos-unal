import { useMemo } from 'react'
import { api } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import MatchCard from '../../components/matches/MatchCard'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, WhistleIcon } from '../../components/icons'

function sortAsc(a, b) {
  return `${a.match_date}T${a.match_time ?? ''}`.localeCompare(
    `${b.match_date}T${b.match_time ?? ''}`,
  )
}

export default function RefereeMatchesPage() {
  const { data, status, error, refetch } = useFetch(
    'referee:matches',
    () => api.get('/referee/matches'),
    { ttl: 30_000 },
  )

  const matches = useMemo(() => data?.data ?? [], [data])
  const live = matches.filter((m) => m.status === 'en_juego')
  const upcoming = matches.filter((m) => m.status === 'programado').sort(sortAsc)
  const finished = matches
    .filter((m) => m.status === 'finalizado')
    .sort(sortAsc)
    .reverse()

  return (
    <div className="page">
      <PageHeader
        eyebrow="Arbitraje"
        title="Mis partidos"
        subtitle="Toca un partido para registrar goles y finalizar con el resultado oficial."
      />

      {status === 'loading' && <CardsSkeleton count={3} />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar tus partidos.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && matches.length === 0 && (
        <EmptyState
          icon={WhistleIcon}
          title="Sin partidos asignados"
          text="Cuando el administrador te asigne un encuentro, aparecerá aquí."
        />
      )}

      {live.length > 0 && (
        <section aria-label="Partidos en juego">
          <h2 className="section__title" style={{ fontSize: 17, marginBottom: 12 }}>
            En juego
          </h2>
          <div className="ref-list">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} to={`/app/arbitraje/${m.id}`} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-label="Partidos programados">
          <h2 className="section__title" style={{ fontSize: 17, marginBottom: 12 }}>
            Programados
          </h2>
          <div className="ref-list">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} to={`/app/arbitraje/${m.id}`} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section aria-label="Partidos finalizados">
          <h2 className="section__title" style={{ fontSize: 17, marginBottom: 12 }}>
            Finalizados
          </h2>
          <div className="ref-list">
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} to={`/app/arbitraje/${m.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
