import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import SelectField from '../ui/SelectField'
import { TableSkeleton } from '../ui/TableSkeleton'
import MatchFormModal from './MatchFormModal'
import { AlertIcon, EditIcon, PlusIcon, TrashIcon, WhistleIcon } from '../icons'
import { formatDate, formatTime, matchLabels } from '../../utils/format'

function matchTournamentId(m) {
  return m.tournament_id ?? m.tournament?.id ?? null
}

function sortDesc(a, b) {
  return `${b.match_date ?? ''}T${b.match_time ?? ''}`.localeCompare(
    `${a.match_date ?? ''}T${a.match_time ?? ''}`,
  )
}

export function MatchesPanel({ tournamentId }) {
  const { isAdmin } = useRole()

  const { data, status, error, refetch } = useFetch(
    'app:matches',
    () => listAll('/tournament-matches'),
    { ttl: 30_000 },
  )
  const { data: tournamentsRes } = useFetch(
    tournamentId ? null : 'app:tournaments',
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )

  const [filter, setFilter] = useState('')
  const effectiveTournament = tournamentId ? String(tournamentId) : filter

  const matches = useMemo(
    () =>
      itemsOf(data)
        .filter(
          (m) =>
            !effectiveTournament ||
            String(matchTournamentId(m) ?? '') === effectiveTournament,
        )
        .sort(sortDesc),
    [data, effectiveTournament],
  )

  // RF-08: partidos pendientes sin árbitro asignado (prioridad del admin)
  const unassigned = useMemo(
    () =>
      matches.filter(
        (m) =>
          !m.referee &&
          !m.referee_id &&
          !['finalizado', 'cancelado'].includes(m.status),
      ),
    [matches],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { run: deleteMatch, busy: deleteBusy, error: deleteError } = useMutation(
    (id) => api.delete(`/tournament-matches/${id}`),
    {
      invalidate: ['app:matches'],
      successMessage: 'Partido eliminado',
      onSuccess: () => setDeleting(null),
    },
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(match) {
    setEditing(match)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMatch(deleting.id)
    } catch {
      // El error se muestra dentro del diálogo de confirmación.
    }
  }

  const tournamentOpts = [
    { value: '', label: 'Todos los torneos' },
    ...itemsOf(tournamentsRes).map((t) => ({ value: String(t.id), label: t.name })),
  ]

  return (
    <section className="panel" aria-label="Partidos">
      <div className="panel__head">
        <h2 className="panel__title">
          {tournamentId ? 'Partidos del torneo' : 'Todos los partidos'}
        </h2>
        {isAdmin && (
          <Button size="sm" icon={PlusIcon} onClick={openCreate}>
            Nuevo partido
          </Button>
        )}
      </div>

      <div className="panel__body">
        {!tournamentId && (
          <div className="filter-bar">
            <SelectField
              aria-label="Filtrar por torneo"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={tournamentOpts}
            />
          </div>
        )}

        {status === 'loading' && <TableSkeleton rows={5} />}

        {isAdmin && status === 'ready' && unassigned.length > 0 && (
          <section className="unassigned" aria-label="Partidos sin árbitro asignado">
            <p className="unassigned__title">
              <WhistleIcon width={15} height={15} />
              Sin árbitro asignado ({unassigned.length})
            </p>
            <ul className="unassigned__list">
              {unassigned.map((m) => (
                <li key={m.id} className="unassigned__item">
                  <span className="unassigned__match">
                    {m.home_team?.name ?? '—'} vs {m.away_team?.name ?? '—'}
                    <span className="unassigned__meta">
                      {formatDate(m.match_date)} · {formatTime(m.match_time)}
                    </span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                    Asignar
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {status === 'error' && (
          <div className="error-banner" role="alert">
            <AlertIcon />
            {error?.message ?? 'No pudimos cargar los partidos.'}
            <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
              Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && matches.length === 0 && (
          <EmptyState
            icon={WhistleIcon}
            title="Sin partidos"
            text={
              effectiveTournament
                ? 'No hay partidos programados para este torneo.'
                : 'Aún no hay partidos programados.'
            }
            action={
              isAdmin && (
                <Button size="sm" icon={PlusIcon} onClick={openCreate}>
                  Nuevo partido
                </Button>
              )
            }
          />
        )}

        {status === 'ready' && matches.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Partidos de los torneos</caption>
              <thead>
                <tr>
                  <th scope="col">{tournamentId ? 'Fecha' : 'Torneo · Fecha'}</th>
                  <th scope="col">Partido</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="num">
                    Resultado
                  </th>
                  <th scope="col">Árbitro</th>
                  {isAdmin && (
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {tournamentId ? (
                        <>
                          <span className="table__main">{formatDate(m.match_date)}</span>
                          <span className="table__sub">{formatTime(m.match_time)}</span>
                        </>
                      ) : (
                        <>
                          <span className="table__main">{m.tournament?.name ?? '—'}</span>
                          <span className="table__sub">
                            {formatDate(m.match_date)} · {formatTime(m.match_time)}
                          </span>
                        </>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {m.home_team?.name ?? '—'} vs {m.away_team?.name ?? '—'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={m.status} withDot={m.status === 'en_juego'}>
                        {matchLabels[m.status] ?? m.status}
                      </Badge>
                    </td>
                    <td className="num">
                      {m.home_score != null && m.away_score != null
                        ? `${m.home_score} — ${m.away_score}`
                        : '—'}
                    </td>
                    <td>
                      {m.referee ? (
                        `${m.referee.first_name} ${m.referee.last_name}`
                      ) : (
                        <span style={{ color: 'var(--ink-muted)' }}>Sin asignar</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="table__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Editar partido ${m.home_team?.name ?? ''} vs ${m.away_team?.name ?? ''}`}
                          onClick={() => openEdit(m)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn is-danger"
                          aria-label={`Eliminar partido ${m.home_team?.name ?? ''} vs ${m.away_team?.name ?? ''}`}
                          onClick={() => setDeleting(m)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && (
        <MatchFormModal
          open={formOpen}
          match={editing}
          fixedTournamentId={tournamentId}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar partido"
        message={`¿Eliminar el partido ${deleting?.home_team?.name ?? ''} vs ${deleting?.away_team?.name ?? ''}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar partido"
        busy={deleteBusy}
        error={deleteError?.message}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}
