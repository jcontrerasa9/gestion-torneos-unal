import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublicTournaments } from '../../api/public'
import { itemsOf } from '../../api/helpers'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, TrophyIcon } from '../../components/icons'
import { formatDateRange, tournamentLabels } from '../../utils/format'

export default function PublicTournaments() {
  const { data, status, error, refetch } = useFetch(
    'public:tournaments',
    fetchPublicTournaments,
    { ttl: 60_000 },
  )
  const tournaments = itemsOf(data)

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">Competiciones</p>
          <h1 className="page__title">Torneos</h1>
          <p className="page__subtitle">
            Elige un torneo para ver sus posiciones, goleadores y calendario.
          </p>
        </div>
      </header>

      {status === 'loading' && <CardsSkeleton count={3} />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar los torneos.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && tournaments.length === 0 && (
        <EmptyState
          icon={TrophyIcon}
          title="No hay torneos publicados"
          text="Cuando la administración publique un torneo, aparecerá aquí."
        />
      )}

      {status === 'ready' && tournaments.length > 0 && (
        <div className="tournament-cards">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/t/${t.id}/posiciones`} className="tournament-card">
              <div className="tournament-card__top">
                <h2 className="tournament-card__name">{t.name}</h2>
                <Badge variant={t.status} withDot={t.status === 'en_curso'}>
                  {tournamentLabels.status[t.status] ?? t.status}
                </Badge>
              </div>
              <span className="tournament-card__dates">
                {tournamentLabels.modality[t.modality] ?? t.modality} ·{' '}
                {formatDateRange(t.start_date, t.end_date)}
              </span>
              {t.description && (
                <p className="tournament-card__desc">{t.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
