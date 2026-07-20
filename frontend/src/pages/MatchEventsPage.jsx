import { useCallback, useEffect, useState } from 'react'
import * as meApi from '../api/match-events'
import { useAuth } from '../context/useAuth'
import { api } from '../api/client'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectField'
import FormField from '../components/ui/FormField'
import SubmitButton from '../components/ui/SubmitButton'
import {
  AlertIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons'

const EVENT_LABEL = {
  gol: 'Gol',
  tarjeta_amarilla: 'Tarjeta Amarilla',
  tarjeta_roja: 'Tarjeta Roja',
  sustitucion: 'Sustitución',
}

const EVENT_OPTIONS = [
  { value: 'gol', label: 'Gol' },
  { value: 'tarjeta_amarilla', label: 'Tarjeta Amarilla' },
  { value: 'tarjeta_roja', label: 'Tarjeta Roja' },
  { value: 'sustitucion', label: 'Sustitución' },
]

// ── Table ──

function EventsTable({ items, canManage, onEdit, onDelete }) {
  return (
    <div className="table" role="table" aria-label="Eventos">
      <div className="table__head" role="row">
        <div role="columnheader">Partido</div>
        <div role="columnheader">Jugador</div>
        <div role="columnheader">Evento</div>
        <div role="columnheader">Min.</div>
        <div role="columnheader">Descripción</div>
        {canManage && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((e) => (
        <div key={e.id} className="table__row" role="row">
          <div className="table__cell" role="cell">
            <div className="table__stack">
              <span style={{ fontWeight: 600 }}>
                {e.match?.home_team?.name ?? '—'} vs {e.match?.away_team?.name ?? '—'}
              </span>
              <span className="table__stack-sub">
                {e.match?.tournament?.name ?? '—'}
              </span>
            </div>
          </div>
          <div className="table__cell" role="cell">
            {e.player
              ? `${e.player.first_name} ${e.player.last_name}`
              : '—'}
          </div>
          <div className="table__cell" role="cell">
            <Badge variant={e.event_type}>
              {EVENT_LABEL[e.event_type] ?? e.event_type}
            </Badge>
          </div>
          <div className="table__cell" role="cell">{e.minute}&apos;</div>
          <div className="table__cell table__cell--meta" role="cell">
            {e.description || '—'}
          </div>
          {canManage && (
            <div className="table__cell table__cell--actions" role="cell">
              <button type="button" className="icon-btn" onClick={() => onEdit(e)} aria-label="Editar" title="Editar">
                <EditIcon />
              </button>
              <button type="button" className="icon-btn is-danger" onClick={() => onDelete(e)} aria-label="Eliminar" title="Eliminar">
                <TrashIcon />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function EventsSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Partido</div><div>Jugador</div><div>Evento</div><div>Min.</div><div>Descripción</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canManage }) {
  return (
    <section className="empty">
      <span className="empty__mark"><AlertIcon /></span>
      <h2 className="empty__title">Aún no hay eventos registrados</h2>
      <p className="empty__text">
        {canManage
          ? 'Registra goles, tarjetas y sustituciones de los partidos en curso.'
          : 'Cuando el árbitro registre eventos de los partidos, aparecerán aquí.'}
      </p>
    </section>
  )
}

// ── Form Modal ──

const EMPTY = { match_id: '', player_id: '', event_type: '', minute: '', description: '' }

function buildInitial(event) {
  if (!event) return { ...EMPTY }
  return {
    match_id: event.match_id ?? '',
    player_id: event.player_id ?? '',
    event_type: event.event_type ?? '',
    minute: event.minute ?? '',
    description: event.description ?? '',
  }
}

function EventFormModal({ open, event, onClose, onSaved }) {
  const editing = Boolean(event)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (!open) return
    setForm(buildInitial(event))
    setErrors({})
    setGlobalError(null)
    api.get('/tournament-matches?page=1').then((r) => setMatches(r.data.data || [])).catch(() => {})
  }, [open, event])

  useEffect(() => {
    if (!form.match_id) { setPlayers([]); return }
    api.get(`/tournament-matches/${form.match_id}`).then((r) => {
      const match = r.data
      api.get(`/tournaments/${match.tournament_id}/players`).then((res) => {
        setPlayers(res.data || [])
      }).catch(() => setPlayers([]))
    }).catch(() => setPlayers([]))
  }, [form.match_id])

  function update(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setErrors({}); setGlobalError(null)
    try {
      if (editing) await meApi.update(event.id, form)
      else await meApi.create(form)
      onSaved?.(); onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) setErrors(err.data.errors)
      else setGlobalError(err.message)
    } finally { setSubmitting(false) }
  }

  const matchOpts = matches.map((m) => ({ value: m.id, label: `${m.home_team?.name} vs ${m.away_team?.name} — ${m.tournament?.name}` }))
  const playerOpts = players.map((p) => ({ value: p.player.id, label: `${p.player.first_name} ${p.player.last_name} (#${p.jersey_number})` }))

  return (
    <Modal open={open} title={editing ? 'Editar evento' : 'Nuevo evento'} onClose={onClose}
      footer={<>
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
        <SubmitButton loading={submitting} form="me-form">{editing ? 'Guardar' : 'Registrar'}</SubmitButton>
      </>}
    >
      {globalError && (<div className="auth__error modal__error" role="alert"><AlertIcon />{globalError}</div>)}
      <form id="me-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <SelectField label="Partido" name="match_id" value={form.match_id} onChange={update('match_id')} options={matchOpts} placeholder="Selecciona un partido" required error={errors.match_id?.[0]} />
        <SelectField label="Jugador" name="player_id" value={form.player_id} onChange={update('player_id')} options={playerOpts} placeholder="Selecciona un jugador" required error={errors.player_id?.[0]} />
        <div className="auth__row">
          <SelectField label="Evento" name="event_type" value={form.event_type} onChange={update('event_type')} options={EVENT_OPTIONS} placeholder="Tipo de evento" required error={errors.event_type?.[0]} />
          <FormField label="Minuto" name="minute" type="number" value={form.minute} onChange={update('minute')} placeholder="23" required error={errors.minute?.[0]} />
        </div>
        <FormField label="Descripción" name="description" value={form.description} onChange={update('description')} placeholder="Gol de tiro libre…" error={errors.description?.[0]} />
      </form>
    </Modal>
  )
}

// ── Page ──

export default function MatchEventsPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'referee'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [fetchStatus, setFetchStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const load = useCallback(async (p) => {
    setFetchStatus('loading'); setError(null)
    try {
      const res = await meApi.list(p)
      setItems(res.data.data)
      setLastPage(res.data.last_page ?? 1)
    } catch (err) { setError(err.message) }
    finally { setFetchStatus('ready') }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  return (
    <>
      <div aria-busy={fetchStatus === 'loading'}>
        <header className="page__head">
          <div className="page__title-block">
            <h1 className="page__title">Eventos de partido</h1>
            <p className="page__subtitle">Registra goles, tarjetas y sustituciones de los encuentros.</p>
          </div>
          {canManage && (
            <div className="page__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => { setActive(null); setModalOpen(true) }}>
                <span className="btn__content"><PlusIcon />Nuevo evento</span>
              </button>
            </div>
          )}
        </header>

        {error && (<div className="error-banner" role="alert"><AlertIcon />{error}<button type="button" className="auth__switch" onClick={() => load(page)} style={{ marginLeft: 'auto' }}>Reintentar</button></div>)}
        {fetchStatus === 'loading' && <EventsSkeleton />}
        {fetchStatus === 'ready' && items.length === 0 && <EmptyState canManage={canManage} />}
        {fetchStatus === 'ready' && items.length > 0 && (
          <>
            <EventsTable items={items} canManage={canManage}
              onEdit={(ev) => { setActive(ev); setModalOpen(true) }}
              onDelete={(ev) => { setDeleting(ev); setConfirmOpen(true) }}
            />
            <Pagination page={page} lastPage={lastPage} onChange={(n) => { if (n >= 1 && n <= lastPage) setPage(n) }} />
          </>
        )}
      </div>

      <EventFormModal open={modalOpen} event={active} onClose={() => setModalOpen(false)} onSaved={() => load(page)} />
      <ConfirmDialog open={confirmOpen} title="Eliminar evento"
        message={deleting ? `¿Eliminar el evento «${EVENT_LABEL[deleting.event_type]}» del minuto ${deleting.minute}'?` : ''}
        confirmLabel="Eliminar" error={deleteError} busy={deleteBusy}
        onConfirm={async () => {
          setDeleteBusy(true); setDeleteError(null)
          try { await meApi.remove(deleting.id); setConfirmOpen(false); setDeleting(null); load(page) }
          catch (err) { setDeleteError(err.message) }
          finally { setDeleteBusy(false) }
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}