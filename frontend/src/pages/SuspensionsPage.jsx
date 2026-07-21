import { useCallback, useEffect, useState } from 'react'
import * as suspensionsApi from '../api/suspensions'
import { useAuth } from '../context/useAuth'
import { api } from '../api/client'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectField'
import FormField from '../components/ui/FormField'
import SubmitButton from '../components/ui/SubmitButton'
import { AlertIcon, PlusIcon } from '../components/icons'

// ── Table ──

function SuspensionsTable({ items, onCancel }) {
  return (
    <div className="table" role="table" aria-label="Sanciones">
      <div className="table__head" role="row">
        <div role="columnheader">Jugador</div>
        <div role="columnheader">Torneo</div>
        <div role="columnheader">Motivo</div>
        <div role="columnheader">Partidos</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Acciones</div>
      </div>

      {items.map((s) => (
        <div key={s.id} className="table__row" role="row">
          <div className="table__cell" role="cell">
            <span style={{ fontWeight: 600 }}>
              {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
            </span>
          </div>
          <div className="table__cell" role="cell">{s.tournament?.name ?? '—'}</div>
          <div className="table__cell" role="cell">{s.reason ?? '—'}</div>
          <div className="table__cell" role="cell">{s.matches_suspended}</div>
          <div className="table__cell" role="cell">
            <Badge variant={s.status}>
              {s.status === 'activa' ? 'Activa' : 'Cancelada'}
            </Badge>
          </div>
          <div className="table__cell table__cell--actions" role="cell">
            {s.status === 'activa' && (
              <button type="button" className="icon-btn is-danger" onClick={() => onCancel(s)}
                aria-label={`Cancelar sanción de ${s.player?.first_name}`} title="Cancelar">
                <span style={{ fontSize: 14, fontWeight: 700 }}>✕</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function SuspensionsSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Jugador</div><div>Torneo</div><div>Motivo</div><div>Partidos</div><div>Estado</div><div>Acciones</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--md" />
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

function EmptyState() {
  return (
    <section className="empty">
      <span className="empty__mark"><AlertIcon /></span>
      <h2 className="empty__title">No hay sanciones registradas</h2>
      <p className="empty__text">Las sanciones se generan automáticamente al registrar tarjetas en los partidos.</p>
    </section>
  )
}

// ── Form Modal ──

const EMPTY = { tournament_id: '', player_id: '', reason: '', matches_suspended: '1' }

function SuspensionFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY })
    setErrors({})
    setGlobalError(null)
    setPlayers([])
    api.get('/tournaments?page=1').then((r) => setTournaments(r.data.data || [])).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!form.tournament_id) { setPlayers([]); return }
    api.get(`/tournaments/${form.tournament_id}/players`).then((res) => {
      setPlayers(res.data || [])
    }).catch(() => setPlayers([]))
  }, [form.tournament_id])

  function update(f) { return (e) => setForm((p) => ({ ...p, [f]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setErrors({}); setGlobalError(null)
    try {
      await suspensionsApi.create(form)
      onSaved?.(); onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) setErrors(err.data.errors)
      else setGlobalError(err.message)
    } finally { setSubmitting(false) }
  }

  const tournamentOpts = tournaments.map((t) => ({ value: t.id, label: t.name }))
  const playerOpts = players.map((p) => ({ value: p.player.id, label: `${p.player.first_name} ${p.player.last_name} (#${p.jersey_number})` }))

  return (
    <Modal open={open} title="Nueva sanción" onClose={onClose}
      footer={<>
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
        <SubmitButton loading={submitting} form="susp-form">Sancionar</SubmitButton>
      </>}
    >
      {globalError && (<div className="auth__error modal__error" role="alert"><AlertIcon />{globalError}</div>)}
      <form id="susp-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <SelectField label="Torneo" name="tournament_id" value={form.tournament_id} onChange={update('tournament_id')} options={tournamentOpts} placeholder="Selecciona un torneo" required error={errors.tournament_id?.[0]} />
        <SelectField label="Jugador" name="player_id" value={form.player_id} onChange={update('player_id')} options={playerOpts} placeholder="Selecciona un jugador" required error={errors.player_id?.[0]} />
        <FormField label="Motivo" name="reason" value={form.reason} onChange={update('reason')} placeholder="Tarjeta roja directa, acumulación de amarillas…" required error={errors.reason?.[0]} />
        <FormField label="Partidos de sanción" name="matches_suspended" type="number" value={form.matches_suspended} onChange={update('matches_suspended')} placeholder="1" required error={errors.matches_suspended?.[0]} />
      </form>
    </Modal>
  )
}

// ── Page ──

export default function SuspensionsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role?.name === 'admin'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [fetchStatus, setFetchStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [cancelBusy, setCancelBusy] = useState(false)

  const load = useCallback(async (p) => {
    setFetchStatus('loading'); setError(null)
    try {
      const res = await suspensionsApi.list(p)
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
            <h1 className="page__title">Sanciones</h1>
            <p className="page__subtitle">Gestiona las sanciones disciplinarias de los torneos universitarios.</p>
          </div>
          {isAdmin && (
            <div className="page__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setModalOpen(true)}>
                <span className="btn__content"><PlusIcon />Nueva sanción</span>
              </button>
            </div>
          )}
        </header>

        {error && (<div className="error-banner" role="alert"><AlertIcon />{error}<button type="button" className="auth__switch" onClick={() => load(page)} style={{ marginLeft: 'auto' }}>Reintentar</button></div>)}
        {fetchStatus === 'loading' && <SuspensionsSkeleton />}
        {fetchStatus === 'ready' && items.length === 0 && <EmptyState />}
        {fetchStatus === 'ready' && items.length > 0 && (
          <>
            <SuspensionsTable items={items}
              onCancel={(s) => { setCancelling(s); setConfirmOpen(true) }}
            />
            <Pagination page={page} lastPage={lastPage} onChange={(n) => { if (n >= 1 && n <= lastPage) setPage(n) }} />
          </>
        )}
      </div>

      <SuspensionFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => load(page)} />
      <ConfirmDialog open={confirmOpen} title="Cancelar sanción"
        message={cancelling ? `¿Cancelar la sanción de «${cancelling.player?.first_name}» por «${cancelling.reason}»?` : ''}
        confirmLabel="Cancelar sanción" busy={cancelBusy}
        onConfirm={async () => {
          setCancelBusy(true)
          try { await suspensionsApi.cancel(cancelling.id); setConfirmOpen(false); setCancelling(null); load(page) }
          finally { setCancelBusy(false) }
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}