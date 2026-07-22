import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Field from '../../components/ui/Field'
import SelectField from '../../components/ui/SelectField'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import { AlertIcon, BallIcon, CardIcon, EditIcon, FlagIcon, PlusIcon, TrashIcon } from '../../components/icons'
import { formatDate } from '../../utils/format'

const EVENT_OPTIONS = [
  { value: 'gol', label: 'Gol' },
  { value: 'tarjeta_amarilla', label: 'Tarjeta amarilla' },
  { value: 'tarjeta_roja', label: 'Tarjeta roja' },
]

function EventsFormModal({ open, event, matches, onClose, onSaved }) {
  const editing = Boolean(event)
  const [form, setForm] = useState({ match_id: '', player_id: '', event_type: 'gol', minute: '', description: '' })
  const [players, setPlayers] = useState([])
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    if (!open) return
    setForm({
      match_id: event?.match_id ?? '',
      player_id: event?.player_id ?? '',
      event_type: event?.event_type ?? 'gol',
      minute: event?.minute ?? '',
      description: event?.description ?? '',
    })
    setErrors({})
    setGlobalError(null)
  }, [open, event])

  useEffect(() => {
    if (!form.match_id) { setPlayers([]); return }
    const match = matches.find((m) => String(m.id) === String(form.match_id))
    if (match?.tournament_id) {
      api.get(`/tournaments/${match.tournament_id}/players`)
        .then((r) => setPlayers(r.data || []))
        .catch((err) => {
          setPlayers([])
          setGlobalError(`No pudimos cargar los jugadores: ${err.message}`)
        })
    }
  }, [form.match_id, matches])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    try {
      const payload = {
        match_id: Number(form.match_id),
        player_id: Number(form.player_id),
        event_type: form.event_type,
        minute: Number(form.minute),
      }
      if (form.description) payload.description = form.description
      if (editing) {
        await api.put(`/match-events/${event.id}`, payload)
      } else {
        await api.post('/match-events', payload)
      }
      onSaved?.()
      onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) setErrors(err.data.errors)
      else setGlobalError(err.message)
    }
  }

  const matchOpts = matches.map((m) => ({
    value: m.id,
    label: `${m.home_team?.name} vs ${m.away_team?.name} · ${formatDate(m.match_date)}`,
  }))

  const playerOpts = players.map((p) => ({
    value: p.player?.id ?? p.id,
    label: `${p.player?.first_name ?? ''} ${p.player?.last_name ?? ''} (${p.jersey_number ?? '#'})`,
  }))

  return (
    <Modal
      open={open}
      title={editing ? 'Editar evento' : 'Nuevo evento'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="event-form" busy={false}>{editing ? 'Guardar' : 'Registrar'}</Button>
        </>
      }
    >
      {globalError && <div className="form-error-banner" role="alert"><AlertIcon />{globalError}</div>}
      <form id="event-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Partido"
          value={form.match_id}
          onChange={update('match_id')}
          options={matchOpts}
          placeholder="Selecciona un partido"
          required
          error={errors.match_id?.[0]}
          className="field--full"
        />
        <SelectField
          label="Jugador"
          value={form.player_id}
          onChange={update('player_id')}
          options={playerOpts}
          placeholder={form.match_id ? 'Selecciona un jugador' : 'Primero selecciona un partido'}
          required
          error={errors.player_id?.[0]}
          className="field--full"
        />
        <SelectField
          label="Tipo de evento"
          value={form.event_type}
          onChange={update('event_type')}
          options={EVENT_OPTIONS}
          required
          error={errors.event_type?.[0]}
        />
        <Field
          label="Minuto"
          type="number"
          min={0}
          max={130}
          value={form.minute}
          onChange={update('minute')}
          required
          error={errors.minute?.[0]}
        />
        <Field
          label="Descripción"
          value={form.description}
          onChange={update('description')}
          placeholder="Opcional"
          error={errors.description?.[0]}
          className="field--full"
        />
      </form>
    </Modal>
  )
}

export default function EventsPage() {
  const [matches, setMatches] = useState([])
  const [matchesError, setMatchesError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const { data, status, error, refetch } = useFetch(
    'app:events',
    () => listAll('/match-events'),
    { ttl: 30_000 },
  )
  const items = itemsOf(data)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    listAll('/tournament-matches')
      .then((r) => setMatches(itemsOf(r)))
      .catch((err) => setMatchesError(err.message))
  }, [])

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await api.delete(`/match-events/${deleting.id}`)
      setDeleting(null)
      refetch()
    } catch (err) {
      setDeleteError(err.data?.message ?? err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  function eventLabel(type) {
    if (type === 'gol') return <span style={{ color: 'var(--pitch)', fontWeight: 600 }}><BallIcon width={14} height={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Gol</span>
    if (type === 'tarjeta_amarilla') return <span style={{ color: 'var(--amber)', fontWeight: 600 }}><CardIcon width={14} height={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Amarilla</span>
    return <span style={{ color: 'var(--red)', fontWeight: 600 }}><CardIcon width={14} height={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Roja</span>
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Incidencias"
        title="Eventos de partido"
        subtitle="Registra y administra goles, tarjetas amarillas y rojas."
        actions={<Button icon={PlusIcon} onClick={() => { setEditing(null); setFormOpen(true) }}>Nuevo evento</Button>}
      />

      {status === 'loading' && <TableSkeleton />}

      {matchesError && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          No pudimos cargar la lista de partidos: {matchesError}
        </div>
      )}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar los eventos.'}
          <button className="btn btn--ghost btn--sm" onClick={refetch}>Reintentar</button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <EmptyState
          icon={FlagIcon}
          title="Sin eventos registrados"
          text="Registra goles, tarjetas amarillas y rojas de los partidos."
          action={<Button icon={PlusIcon} onClick={() => { setEditing(null); setFormOpen(true) }}>Nuevo evento</Button>}
        />
      )}

      {status === 'ready' && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Eventos de partido</caption>
            <thead>
              <tr>
                <th scope="col">Partido</th>
                <th scope="col">Jugador</th>
                <th scope="col">Tipo</th>
                <th scope="col" className="num">Min.</th>
                <th scope="col" className="col-hide-s">Descripción</th>
                <th scope="col"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    {ev.match ? (
                      <span>
                        <span className="table__main">{ev.match.home_team?.name} vs {ev.match.away_team?.name}</span>
                        <span className="table__sub">{formatDate(ev.match.match_date)}</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {ev.player ? `${ev.player.first_name} ${ev.player.last_name}` : '—'}
                  </td>
                  <td>{eventLabel(ev.event_type)}</td>
                  <td className="num">{ev.minute}&apos;</td>
                  <td className="col-hide-s">{ev.description || '—'}</td>
                  <td>
                    <div className="table__actions">
                      <button type="button" className="icon-btn" aria-label="Editar" onClick={() => { setEditing(ev); setFormOpen(true) }}>
                        <EditIcon />
                      </button>
                      <button type="button" className="icon-btn is-danger" aria-label="Eliminar" onClick={() => setDeleting(ev)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EventsFormModal
        open={formOpen}
        event={editing}
        matches={matches}
        onClose={() => setFormOpen(false)}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar evento"
        message={deleting ? `¿Eliminar el evento de ${deleting.player?.first_name ?? 'este jugador'} al minuto ${deleting.minute}?` : ''}
        confirmLabel="Eliminar"
        busy={deleteBusy}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
