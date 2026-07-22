import { useOutletContext } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublicStandings } from '../../api/public'
import { itemsOf } from '../../api/helpers'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, TrophyIcon } from '../../components/icons'

const COLS = [
  { key: 'pj', label: 'PJ', field: 'matches_played' },
  { key: 'g', label: 'G', field: 'wins', hideS: true },
  { key: 'e', label: 'E', field: 'draws', hideS: true },
  { key: 'p', label: 'P', field: 'losses', hideS: true },
  { key: 'gf', label: 'GF', field: 'goals_for' },
  { key: 'gc', label: 'GC', field: 'goals_against', hideS: true },
]

export default function PublicStandings() {
  const { tournamentId } = useOutletContext()
  const { data, status, error, refetch } = useFetch(
    `public:standings:${tournamentId}`,
    () => fetchPublicStandings(tournamentId),
    { ttl: 60_000 },
  )
  const standings = itemsOf(data)

  if (status === 'loading') return <TableSkeleton rows={8} />

  if (status === 'error') {
    return (
      <div className="error-banner" role="alert">
        <AlertIcon />
        {error?.status === 401
          ? 'Esta tabla aún no está disponible públicamente. Inténtalo más tarde.'
          : (error?.message ?? 'No pudimos cargar la tabla de posiciones.')}
        <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <EmptyState
        icon={TrophyIcon}
        title="Sin posiciones todavía"
        text="La tabla se calculará automáticamente cuando se registren los primeros resultados."
      />
    )
  }

  return (
    <div className="table-wrap" aria-busy="false">
      <table className="table table--standings">
        <caption className="sr-only">Tabla de posiciones</caption>
        <thead>
          <tr>
            <th scope="col" className="num">#</th>
            <th scope="col">Equipo</th>
            {COLS.map((c) => (
              <th key={c.key} scope="col" className={`num ${c.hideS ? 'col-hide-s' : ''}`}>
                {c.label}
              </th>
            ))}
            <th scope="col" className="num">Dif</th>
            <th scope="col" className="num">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.id}>
              <td className="num">
                <span className={`standings-pos ${i < 3 ? `standings-pos--${i + 1}` : ''}`}>
                  {i + 1}
                </span>
              </td>
              <td>
                <span className="standings-team">
                  {s.tournament_team?.team?.name ?? '—'}
                </span>
              </td>
              {COLS.map((c) => (
                <td key={c.key} className={`num ${c.hideS ? 'col-hide-s' : ''}`}>
                  {s[c.field]}
                </td>
              ))}
              <td
                className={`num standings-dif--${s.goal_difference > 0 ? 'pos' : s.goal_difference < 0 ? 'neg' : ''}`}
              >
                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
              </td>
              <td className="num">
                <span className="standings-pts">{s.points}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
