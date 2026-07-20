import { useCallback, useEffect, useState } from 'react'
import * as prApi from '../api/player-requests'
import { useAuth } from '../context/useAuth'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import { AlertIcon, CheckIcon, PlusIcon, TrashIcon, UserIcon, XIcon } from '../components/icons'
import PlayerRequestFormModal from '../components/player-requests/PlayerRequestFormModal'

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

function RequestsTable({ items, canManage, onApprove, onReject, onDelete }) {
  const cols = canManage
    ? 'minmax(0, 0.8fr) minmax(0, 1fr) auto auto auto auto auto'
    : 'minmax(0, 0.8fr) minmax(0, 1fr) auto auto auto auto'

  return (
    <div className="table" role="table" aria-label="Solicitudes">
      <div className="table__head" role="row" style={{ gridTemplateColumns: cols }}>
        <div role="columnheader">Jugador</div>
        <div role="columnheader">Equipo · Torneo</div>
        <div role="columnheader">Dorsal</div>
        <div role="columnheader">Posición</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Solicitud</div>
        {canManage && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((r) => (
        <div key={r.id} className="table__row" role="row" style={{ gridTemplateColumns: cols }}>
          <div className="table__cell" role="cell">
            <span style={{ fontWeight: 600 }}>
              {r.player
                ? `${r.player.first_name} ${r.player.last_name}`
                : '—'}
            </span>
          </div>

          <div className="table__cell" role="cell">
            <div className="table__stack">
              <span style={{ fontWeight: 600 }}>
                {r.tournament_team?.team?.name ?? '—'}
              </span>
              <span className="table__stack-sub">
                {r.tournament_team?.tournament?.name ?? '—'}
              </span>
            </div>
          </div>

          <div className="table__cell" role="cell">
            {r.jersey_number ?? '—'}
          </div>

          <div className="table__cell" role="cell">
            {r.position ?? '—'}
          </div>

          <div className="table__cell" role="cell">
            <Badge variant={r.status}>
              {STATUS_LABEL[r.status] ?? r.status}
            </Badge>
          </div>

          <div className="table__cell table__cell--meta" role="cell">
            {r.request_date ?? '—'}
          </div>

          {canManage && (
            <div className="table__cell table__cell--actions" role="cell">
              {r.status === 'pendiente' && (
                <>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onApprove(r)}
                    aria-label={`Aprobar solicitud de ${r.player?.first_name}`}
                    title="Aprobar"
                    style={{ color: '#86efac' }}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onReject(r)}
                    aria-label={`Rechazar solicitud de ${r.player?.first_name}`}
                    title="Rechazar"
                    style={{ color: '#fda4b1' }}
                  >
                    <XIcon />
                  </button>
                </>
              )}
              <button
                type="button"
                className="icon-btn is-danger"
                onClick={() => onDelete(r)}
                aria-label={`Eliminar solicitud de ${r.player?.first_name}`}
                title="Eliminar"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RequestsSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Jugador</div>
        <div>Equipo · Torneo</div>
        <div>Dorsal</div>
        <div>Posición</div>
        <div>Estado</div>
        <div>Solicitud</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canCreate }) {
  return (
    <section className="empty">
      <span className="empty__mark">
        <UserIcon />
      </span>
      <h2 className="empty__title">Aún no hay solicitudes</h2>
      <p className="empty__text">
        {canCreate
          ? 'Solicita tu ingreso a uno de los equipos inscritos en los torneos.'
          : 'Cuando los jugadores envíen solicitudes de ingreso, aparecerán aquí.'}
      </p>
    </section>
  )
}

export default function PlayerRequestsPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'captain'
  const canCreate = user?.role?.name === 'player'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [fetchStatus, setFetchStatus] = useState('loading')
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const load = useCallback(async (targetPage) => {
    setFetchStatus('loading')
    setError(null)
    try {
      const res = await prApi.list(targetPage)
      setItems(res.data.data)
      setLastPage(res.data.last_page ?? 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setFetchStatus('ready')
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [page, load])

  function handleChangePage(next) {
    if (next < 1 || next > lastPage) return
    setPage(next)
  }

  function openCreate() {
    setModalOpen(true)
  }

  function handleSaved() {
    load(page)
  }

  async function handleApprove(item) {
    try {
      await prApi.update(item.id, { status: 'aprobada' })
      load(page)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReject(item) {
    try {
      await prApi.update(item.id, { status: 'rechazada' })
      load(page)
    } catch (err) {
      setError(err.message)
    }
  }

  function openDelete(item) {
    setDeleting(item)
    setDeleteError(null)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await prApi.remove(deleting.id)
      setConfirmOpen(false)
      setDeleting(null)
      load(page)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <>
      <div aria-busy={fetchStatus === 'loading'}>
        <header className="page__head">
          <div className="page__title-block">
            <h1 className="page__title">Solicitudes</h1>
            <p className="page__subtitle">
              Solicita ingreso a un equipo y consulta el estado de tus peticiones.
            </p>
          </div>
          {canCreate && (
            <div className="page__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
                <span className="btn__content">
                  <PlusIcon />
                  Nueva solicitud
                </span>
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <AlertIcon />
            {error}
            <button
              type="button"
              className="auth__switch"
              onClick={() => load(page)}
              style={{ marginLeft: 'auto' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {fetchStatus === 'loading' && <RequestsSkeleton />}

        {fetchStatus === 'ready' && items.length === 0 && (
          <EmptyState canCreate={canCreate} />
        )}

        {fetchStatus === 'ready' && items.length > 0 && (
          <>
            <RequestsTable
              items={items}
              canManage={canManage}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={openDelete}
            />
            <Pagination
              page={page}
              lastPage={lastPage}
              onChange={handleChangePage}
            />
          </>
        )}
      </div>

      <PlayerRequestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar solicitud"
        message={
          deleting
            ? `¿Seguro que quieres eliminar la solicitud de «${deleting.player?.first_name}» para «${deleting.tournament_team?.team?.name}»?`
            : ''
        }
        confirmLabel="Eliminar solicitud"
        error={deleteError}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}