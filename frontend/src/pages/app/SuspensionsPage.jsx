import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import SelectField from '../../components/ui/SelectField'
import TextAreaField from '../../components/ui/TextAreaField'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import {
  AlertIcon,
  BanIcon,
  PlusIcon,
} from '../../components/icons'

const STATUS_LABELS = {
  activa: 'Activa',
  cancelada: 'Cancelada',
}

function suspensionTournamentId(s) {
  return s.tournament_id ?? s.tournament?.id ?? null
}

/** Enrollments de un torneo → jugadores únicos por player.id. */
function uniquePlayers(enrollments) {
  const seen = new Set()
  const unique = []
  for (const e of enrollments) {
    const pid = e.player?.id
    if (!pid || seen.has(pid)) continue
    seen.add(pid)
    unique.push(e)
  }
  return unique
}

// ── Modal de nueva sanción ──

const EMPTY_FORM = { tournament_id: '', player_id: '', reason: '', matches: '' }

function SuspensionFormModal({ open, tournaments, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [players, setPlayers] = useState([])
  const [playersLoading, setPlayersLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM })
      setErrors({})
      setGlobalError(null)
      setPlayers([])
    }
  }, [open])

  // Carga los jugadores del torneo seleccionado
  const tournamentId = form.tournament_id
  useEffect(() => {
    if (!open || !tournamentId) {
      setPlayers([])
      return
    }
    let cancelled = false
    setPlayersLoading(true)
    api
      .get(`/tournaments/${tournamentId}/players`)
      .then((res) => {
        if (!cancelled) setPlayers(uniquePlayers(res.data ?? []))
      })
      .catch((err) => {
        if (!cancelled) {
          setPlayers([])
          setGlobalError(`No pudimos cargar los jugadores: ${err.message}`)
        }
      })
      .finally(() => {
        if (!cancelled) setPlayersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, tournamentId])

  const { run, busy } = useMutation(
    (payload) => api.post('/suspensions', payload),
    {
      invalidate: ['app:suspensions'],
      successMessage: 'Sanción registrada',
      onSuccess: () => onClose?.(),
    },
  )

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleTournamentChange(e) {
    const value = e.target.value
    setForm((f) => ({ ...f, tournament_id: value, player_id: '' }))
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setErrors({})
    setGlobalError(null)

    const payload = {
      tournament_id: form.tournament_id,
      player_id: form.player_id,
      reason: form.reason,
      matches: Number(form.matches),
    }

    try {
      await run(payload)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setGlobalError(err.message)
      }
    }
  }

  const tournamentOpts = tournaments.map((t) => ({
    value: String(t.id),
    label: t.name,
  }))
  const playerOpts = players.map((p) => ({
    value: String(p.player.id),
    label: `${p.player.first_name} ${p.player.last_name} (#${p.jersey_number ?? '—'})`,
  }))

  return (
    <Modal
      open={open}
      title="Nueva sanción"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="suspension-form" busy={busy}>
            Registrar sanción
          </Button>
        </>
      }
    >
      {globalError && (
        <div className="form-error-banner" role="alert" style={{ marginBottom: 14 }}>
          <AlertIcon />
          {globalError}
        </div>
      )}

      <form id="suspension-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Torneo"
          value={form.tournament_id}
          onChange={handleTournamentChange}
          options={tournamentOpts}
          placeholder="Selecciona un torneo"
          required
          error={errors.tournament_id?.[0]}
        />
        <SelectField
          label="Jugador"
          value={form.player_id}
          onChange={update('player_id')}
          options={playerOpts}
          placeholder={
            !form.tournament_id
              ? 'Selecciona primero un torneo'
              : playersLoading
                ? 'Cargando jugadores…'
                : 'Selecciona un jugador'
          }
          required
          disabled={!form.tournament_id || playersLoading}
          error={errors.player_id?.[0]}
        />

        <TextAreaField
          className="field--full"
          label="Motivo"
          value={form.reason}
          onChange={update('reason')}
          placeholder="Tarjeta roja directa, acumulación de amarillas…"
          rows={3}
          required
          error={errors.reason?.[0]}
        />

        <Field
          label="Partidos de sanción"
          type="number"
          min="1"
          value={form.matches}
          onChange={update('matches')}
          placeholder="1"
          required
          error={errors.matches?.[0]}
        />
      </form>
    </Modal>
  )
}

// ── Página ──

export default function SuspensionsPage() {
  const { data, status, error, refetch } = useFetch(
    'app:suspensions',
    () => listAll('/suspensions'),
    { ttl: 30_000 },
  )
  const { data: tournamentsRes } = useFetch(
    'app:tournaments',
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )
  const tournaments = itemsOf(tournamentsRes)

  const [filter, setFilter] = useState('')
  const suspensions = useMemo(() => {
    const all = itemsOf(data)
    if (!filter) return all
    return all.filter(
      (s) => String(suspensionTournamentId(s) ?? '') === filter,
    )
  }, [data, filter])

  const [formOpen, setFormOpen] = useState(false)
  const [canceling, setCanceling] = useState(null)

  const { run: cancelSuspension, busy: cancelBusy, error: cancelError } = useMutation(
    (id) => api.delete(`/suspensions/${id}`),
    {
      invalidate: ['app:suspensions'],
      successMessage: 'Sanción cancelada',
      onSuccess: () => setCanceling(null),
    },
  )

  async function confirmCancel() {
    if (!canceling) return
    try {
      await cancelSuspension(canceling.id)
    } catch {
      // El error se muestra dentro del diálogo de confirmación.
    }
  }

  const tournamentOpts = [
    { value: '', label: 'Todos los torneos' },
    ...tournaments.map((t) => ({ value: String(t.id), label: t.name })),
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Disciplina"
        title="Sanciones"
        subtitle="Suspensiones de jugadores por torneo: motivo y número de partidos."
        actions={
          <Button icon={PlusIcon} onClick={() => setFormOpen(true)}>
            Nueva sanción
          </Button>
        }
      />

      <div className="filter-bar">
        <SelectField
          aria-label="Filtrar por torneo"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={tournamentOpts}
        />
      </div>

      {status === 'loading' && <TableSkeleton rows={5} />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar las sanciones.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && suspensions.length === 0 && (
        <EmptyState
          icon={BanIcon}
          title="Sin sanciones"
          text={
            filter
              ? 'No hay sanciones registradas para este torneo.'
              : 'Aún no hay sanciones registradas.'
          }
          action={
            <Button icon={PlusIcon} onClick={() => setFormOpen(true)}>
              Nueva sanción
            </Button>
          }
        />
      )}

      {status === 'ready' && suspensions.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Sanciones de jugadores</caption>
            <thead>
              <tr>
                <th scope="col">Jugador</th>
                <th scope="col">Torneo</th>
                <th scope="col">Motivo</th>
                <th scope="col" className="num">
                  Partidos
                </th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {suspensions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="table__main">
                      {s.player
                        ? `${s.player.first_name} ${s.player.last_name}`
                        : '—'}
                    </span>
                  </td>
                  <td>{s.tournament?.name ?? '—'}</td>
                  <td>{s.reason ?? '—'}</td>
                  <td className="num">{s.matches ?? '—'}</td>
                  <td>
                    <Badge variant={s.status}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </Badge>
                  </td>
                  <td className="table__actions">
                    {s.status === 'activa' && (
                      <button
                        type="button"
                        className="icon-btn is-danger"
                        aria-label={`Cancelar la sanción de ${s.player?.first_name ?? ''} ${s.player?.last_name ?? ''}`}
                        onClick={() => setCanceling(s)}
                      >
                        <BanIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SuspensionFormModal
        open={formOpen}
        tournaments={tournaments}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(canceling)}
        title="Cancelar sanción"
        message={
          canceling
            ? `Vas a cancelar la sanción de ${canceling.player?.first_name ?? ''} ${canceling.player?.last_name ?? ''} en ${canceling.tournament?.name ?? 'este torneo'} (${canceling.matches} partido${canceling.matches === 1 ? '' : 's'}). El jugador quedará habilitado de inmediato.`
            : ''
        }
        confirmLabel="Cancelar sanción"
        busy={cancelBusy}
        error={cancelError?.message}
        onConfirm={confirmCancel}
        onClose={() => setCanceling(null)}
      />
    </div>
  )
}
