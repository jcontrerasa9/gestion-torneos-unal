import { useOutletContext } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublicScorers } from '../../api/public'
import { itemsOf } from '../../api/helpers'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, BallIcon } from '../../components/icons'

export default function PublicScorers() {
  const { tournamentId } = useOutletContext()
  const { data, status, error, refetch } = useFetch(
    `public:scorers:${tournamentId}`,
    () => fetchPublicScorers(tournamentId),
    { ttl: 60_000 },
  )
  const scorers = itemsOf(data)

  if (status === 'loading') return <TableSkeleton rows={8} />

  if (status === 'error') {
    return (
      <div className="error-banner" role="alert">
        <AlertIcon />
        {error?.status === 401
          ? 'Esta tabla aún no está disponible públicamente. Inténtalo más tarde.'
          : (error?.message ?? 'No pudimos cargar la tabla de goleadores.')}
        <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  if (scorers.length === 0) {
    return (
      <EmptyState
        icon={BallIcon}
        title="Sin goles registrados"
        text="La tabla de goleadores se actualiza automáticamente con cada gol que registra el árbitro."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Tabla de goleadores</caption>
        <thead>
          <tr>
            <th scope="col" className="num">#</th>
            <th scope="col">Jugador</th>
            <th scope="col" className="num">Goles</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={s.player_id ?? i}>
              <td className="num">
                <span className={`standings-pos ${i < 3 ? `standings-pos--${i + 1}` : ''}`}>
                  {i + 1}
                </span>
              </td>
              <td>
                <span className="standings-team">
                  {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
                </span>
              </td>
              <td className="num">
                <span className="standings-pts">{s.goals}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
