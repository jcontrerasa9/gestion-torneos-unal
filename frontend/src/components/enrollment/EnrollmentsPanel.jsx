import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import { useToast } from '../ui/Toast'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import SelectField from '../ui/SelectField'
import { TableSkeleton } from '../ui/TableSkeleton'
import EnrollmentFormModal from './EnrollmentFormModal'
import { AlertIcon, CheckIcon, PlusIcon, TrashIcon, UsersIcon, XIcon } from '../icons'
import { formatDate } from '../../utils/format'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

const CONFIRM_COPY = {
  aprobada: {
    title: 'Aprobar inscripción',
    confirmLabel: 'Aprobar',
    danger: false,
    toast: 'Inscripción aprobada',
    message: (e) =>
      `Vas a aprobar la inscripción de ${e.team?.name ?? 'este equipo'} en ${e.tournament?.name ?? 'este torneo'}.`,
  },
  rechazada: {
    title: 'Rechazar inscripción',
    confirmLabel: 'Rechazar',
    danger: true,
    toast: 'Inscripción rechazada',
    message: (e) =>
      `Vas a rechazar la inscripción de ${e.team?.name ?? 'este equipo'} en ${e.tournament?.name ?? 'este torneo'}. Si cambia la decisión, el equipo tendrá que volver a solicitarla.`,
  },
  eliminar: {
    title: 'Eliminar inscripción',
    confirmLabel: 'Eliminar',
    danger: true,
    toast: 'Inscripción eliminada',
    message: (e) =>
      `Vas a eliminar la inscripción de ${e.team?.name ?? 'este equipo'} en ${e.tournament?.name ?? 'este torneo'}. Esta acción no se puede deshacer.`,
  },
}

function enrollmentTournamentId(e) {
  return e.tournament_id ?? e.tournament?.id ?? null
}

export function EnrollmentsPanel({ tournamentId }) {
  const { isAdmin, isCaptain } = useRole()
  const toast = useToast()
  const canRequest = isAdmin || isCaptain

  const { data, status, error, refetch } = useFetch(
    'app:enrollments',
    () => listAll('/tournament-teams'),
    { ttl: 30_000 },
  )
  const { data: tournamentsRes } = useFetch(
    tournamentId ? null : 'app:tournaments',
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )

  const [filter, setFilter] = useState('')
  const effectiveTournament = tournamentId ? String(tournamentId) : filter

  const enrollments = useMemo(() => {
    const all = itemsOf(data)
    if (!effectiveTournament) return all
    return all.filter(
      (e) => String(enrollmentTournamentId(e) ?? '') === effectiveTournament,
    )
  }, [data, effectiveTournament])

  const [formOpen, setFormOpen] = useState(false)
  const [confirm, setConfirm] = useState(null) // { kind: 'aprobada' | 'rechazada' | 'eliminar', enrollment }

  const { run, busy: confirmBusy, error: confirmError } = useMutation(
    (c) =>
      c.kind === 'eliminar'
        ? api.delete(`/tournament-teams/${c.enrollment.id}`)
        : api.put(`/tournament-teams/${c.enrollment.id}`, { status: c.kind }),
    {
      invalidate: ['app:enrollments'],
      onSuccess: () => {
        toast.success(CONFIRM_COPY[confirm.kind].toast)
        setConfirm(null)
      },
    },
  )

  async function confirmAction() {
    if (!confirm) return
    try {
      await run(confirm)
    } catch {
      // El error se muestra dentro del diálogo de confirmación.
    }
  }

  const tournamentOpts = [
    { value: '', label: 'Todos los torneos' },
    ...itemsOf(tournamentsRes).map((t) => ({ value: String(t.id), label: t.name })),
  ]

  const copy = confirm ? CONFIRM_COPY[confirm.kind] : null

  return (
    <section className="panel" aria-label="Inscripciones">
      <div className="panel__head">
        <h2 className="panel__title">
          {tournamentId ? 'Inscripciones del torneo' : 'Todas las inscripciones'}
        </h2>
        {canRequest && (
          <Button size="sm" icon={PlusIcon} onClick={() => setFormOpen(true)}>
            Nueva inscripción
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

        {status === 'loading' && <TableSkeleton rows={4} />}

        {status === 'error' && (
          <div className="error-banner" role="alert">
            <AlertIcon />
            {error?.message ?? 'No pudimos cargar las inscripciones.'}
            <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
              Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && enrollments.length === 0 && (
          <EmptyState
            icon={UsersIcon}
            title="Sin inscripciones"
            text={
              effectiveTournament
                ? 'No hay inscripciones registradas para este torneo.'
                : 'Aún no hay solicitudes de inscripción.'
            }
            action={
              canRequest && (
                <Button size="sm" icon={PlusIcon} onClick={() => setFormOpen(true)}>
                  Nueva inscripción
                </Button>
              )
            }
          />
        )}

        {status === 'ready' && enrollments.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Inscripciones de equipos a torneos</caption>
              <thead>
                <tr>
                  {!tournamentId && <th scope="col">Torneo</th>}
                  <th scope="col">Equipo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha</th>
                  {isAdmin && (
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    {!tournamentId && <td>{e.tournament?.name ?? '—'}</td>}
                    <td>
                      <span className="table__main">{e.team?.name ?? '—'}</span>
                    </td>
                    <td>
                      <Badge variant={e.status}>
                        {STATUS_LABELS[e.status] ?? e.status}
                      </Badge>
                    </td>
                    <td>{formatDate(e.request_date)}</td>
                    {isAdmin && (
                      <td className="table__actions">
                        {e.status === 'pendiente' && (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Aprobar inscripción de ${e.team?.name ?? 'equipo'}`}
                              onClick={() => setConfirm({ kind: 'aprobada', enrollment: e })}
                            >
                              <CheckIcon />
                            </button>
                            <button
                              type="button"
                              className="icon-btn is-danger"
                              aria-label={`Rechazar inscripción de ${e.team?.name ?? 'equipo'}`}
                              onClick={() => setConfirm({ kind: 'rechazada', enrollment: e })}
                            >
                              <XIcon />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="icon-btn is-danger"
                          aria-label={`Eliminar inscripción de ${e.team?.name ?? 'equipo'}`}
                          onClick={() => setConfirm({ kind: 'eliminar', enrollment: e })}
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

      {canRequest && (
        <EnrollmentFormModal
          open={formOpen}
          fixedTournamentId={tournamentId}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={copy?.title ?? ''}
        message={copy ? copy.message(confirm.enrollment) : ''}
        confirmLabel={copy?.confirmLabel}
        danger={copy?.danger ?? true}
        busy={confirmBusy}
        error={confirmError?.message}
        onConfirm={confirmAction}
        onClose={() => setConfirm(null)}
      />
    </section>
  )
}
