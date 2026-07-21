import { useCallback, useEffect, useState } from 'react'
import * as rosterApi from '../api/roster'
import { useAuth } from '../context/useAuth'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { AlertIcon, UserIcon } from '../components/icons'

// ── Table ──

function RosterTable({ items, canManage, onToggle, onRemove }) {
  const cols = canManage
    ? 'minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) minmax(0, 0.6fr) auto auto'
    : 'minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) minmax(0, 0.6fr) auto'

  return (
    <div className="table" role="table" aria-label="Plantilla">
      <div className="table__head" role="row" style={{ gridTemplateColumns: cols }}>
        <div role="columnheader">Jugador</div>
        <div role="columnheader">Equipo</div>
        <div role="columnheader">Torneo</div>
        <div role="columnheader">Posición</div>
        <div role="columnheader">Estado</div>
        {canManage && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((p) => (
        <div key={p.id} className="table__row" role="row" style={{ gridTemplateColumns: cols }}>
          <div className="table__cell" role="cell">
            <div className="table__stack">
              <span style={{ fontWeight: 600 }}>
                {p.player ? `${p.player.first_name} ${p.player.last_name}` : '—'}
              </span>
              {p.jersey_number && (
                <span className="table__stack-sub">#{p.jersey_number}</span>
              )}
            </div>
          </div>
          <div className="table__cell" role="cell">
            {p.tournament_team?.team?.name ?? '—'}
          </div>
          <div className="table__cell" role="cell">
            {p.tournament?.name ?? '—'}
          </div>
          <div className="table__cell" role="cell">{p.position ?? '—'}</div>
          <div className="table__cell" role="cell">
            <Badge variant={p.is_active ? 'en_curso' : 'cancelado'}>
              {p.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          {canManage && (
            <div className="table__cell table__cell--actions" role="cell">
              <button type="button" className="icon-btn"
                onClick={() => onToggle(p)}
                aria-label={p.is_active ? 'Desactivar' : 'Activar'} title={p.is_active ? 'Desactivar' : 'Activar'}>
                {p.is_active ? '⏸' : '▶'}
              </button>
              <button type="button" className="icon-btn is-danger"
                onClick={() => onRemove(p)} aria-label="Quitar" title="Quitar">
                ✕
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RosterSkeleton() {
  const cols = 'minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.8fr) minmax(0, 0.6fr) auto'

  return (
    <div className="table" aria-hidden="true">
      <div className="table__head" style={{ gridTemplateColumns: cols }}>
        <div>Jugador</div><div>Equipo</div><div>Torneo</div><div>Posición</div><div>Estado</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ gridTemplateColumns: cols }}>
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--md" />
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
      <span className="empty__mark"><UserIcon /></span>
      <h2 className="empty__title">No hay jugadores en plantilla</h2>
      <p className="empty__text">Los jugadores aparecerán aquí cuando sean aprobados en las solicitudes de ingreso.</p>
    </section>
  )
}

// ── Page ──

export default function RosterPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'captain'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [fetchStatus, setFetchStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  const load = useCallback(async (p) => {
    setFetchStatus('loading'); setError(null)
    try {
      const res = await rosterApi.list(p)
      setItems(res.data.data)
      setLastPage(res.data.last_page ?? 1)
    } catch (err) { setError(err.message) }
    finally { setFetchStatus('ready') }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  async function handleToggle(p) {
    try { await rosterApi.toggleActive(p.id); load(page) }
    catch (err) { setError(err.message) }
  }

  async function handleRemove() {
    try {
      await rosterApi.remove(removing.id)
      setConfirmOpen(false); setRemoving(null); load(page)
    } catch (err) { setError(err.message) }
  }

  return (
    <>
      <div aria-busy={fetchStatus === 'loading'}>
        <header className="page__head">
          <div className="page__title-block">
            <h1 className="page__title">Plantilla</h1>
            <p className="page__subtitle">Jugadores inscritos en los equipos de cada torneo.</p>
          </div>
        </header>

        {error && (<div className="error-banner" role="alert"><AlertIcon />{error}<button type="button" className="auth__switch" onClick={() => load(page)} style={{ marginLeft: 'auto' }}>Reintentar</button></div>)}
        {fetchStatus === 'loading' && <RosterSkeleton />}
        {fetchStatus === 'ready' && items.length === 0 && <EmptyState />}
        {fetchStatus === 'ready' && items.length > 0 && (
          <>
            <RosterTable items={items} canManage={canManage}
              onToggle={handleToggle}
              onRemove={(p) => { setRemoving(p); setConfirmOpen(true) }}
            />
            <Pagination page={page} lastPage={lastPage} onChange={(n) => { if (n >= 1 && n <= lastPage) setPage(n) }} />
          </>
        )}
      </div>

      <ConfirmDialog open={confirmOpen} title="Quitar jugador"
        message={removing ? `¿Quitar a «${removing.player?.first_name}» de «${removing.tournament_team?.team?.name}»?` : ''}
        confirmLabel="Quitar" onConfirm={handleRemove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}