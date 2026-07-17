import { useCallback, useEffect, useState } from 'react'
import * as matchesApi from '../api/matches'
import { useAuth } from '../context/useAuth'
import Badge from '../components/ui/Badge'
import Pagination from '../components/ui/Pagination'
import {
  AlertIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
} from '../components/icons'
import { formatDate, formatTime, matchLabels } from '../utils/format'
import MatchFormModal from '../components/matches/MatchFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const STATUS_LABEL = matchLabels

function MatchesTable({ items, canManage, onEdit, onDelete }) {
  const cols = canManage
    ? 'minmax(0, 1.1fr) minmax(0, 1.5fr) auto auto auto'
    : 'minmax(0, 1.1fr) minmax(0, 1.5fr) auto auto'

  return (
    <div className="table" role="table" aria-label="Partidos">
      <div className="table__head" role="row" style={{ gridTemplateColumns: cols }}>
        <div role="columnheader">Torneo · Fecha</div>
        <div role="columnheader">Partido</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Resultado</div>
        {canManage && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((m) => (
        <div key={m.id} className="table__row" role="row" style={{ gridTemplateColumns: cols }}>
          <div className="table__cell" role="cell">
            <div className="table__stack">
              <span style={{ fontWeight: 600 }}>
                {m.tournament?.name ?? '—'}
              </span>
              <span className="table__stack-sub">
                {formatDate(m.match_date)}{' · '}{formatTime(m.match_time)}
              </span>
            </div>
          </div>

          <div className="table__cell" role="cell">
            <div className="table__stack">
              <span style={{ fontWeight: 600 }}>
                {m.home_team?.name ?? 'Local'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                vs
              </span>
              <span style={{ fontWeight: 600 }}>
                {m.away_team?.name ?? 'Visitante'}
              </span>
            </div>
          </div>

          <div className="table__cell" role="cell">
            <Badge variant={m.status} withDot={m.status === 'en_juego'}>
              {STATUS_LABEL[m.status] ?? m.status}
            </Badge>
          </div>

          <div className="table__cell" role="cell">
            {m.home_score != null && m.away_score != null ? (
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                {m.home_score}{' '}
                <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                  —
                </span>{' '}
                {m.away_score}
              </span>
            ) : (
              <span style={{ color: 'var(--text-dim)' }}>—</span>
            )}
          </div>

          {canManage && (
            <div className="table__cell table__cell--actions" role="cell">
              <button
                type="button"
                className="icon-btn"
                onClick={() => onEdit(m)}
                aria-label={`Editar ${m.home_team?.name} vs ${m.away_team?.name}`}
                title="Editar"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                className="icon-btn is-danger"
                onClick={() => onDelete(m)}
                aria-label={`Eliminar ${m.home_team?.name} vs ${m.away_team?.name}`}
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

function MatchesSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Fecha</div>
        <div>Partido</div>
        <div>Estado</div>
        <div>Resultado</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
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
      <span className="empty__mark">
        <TrophyIcon />
      </span>
      <h2 className="empty__title">Aún no hay partidos</h2>
      <p className="empty__text">
        Cuando el administrador programe los encuentros de cada torneo,
        aparecerán en esta lista con sus resultados.
      </p>
    </section>
  )
}

export default function MatchesPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const load = useCallback(async (targetPage) => {
    setStatus('loading')
    setError(null)
    try {
      const res = await matchesApi.list(targetPage)
      const payload = res.data
      setItems(payload.data)
      setLastPage(payload.last_page ?? 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('ready')
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
    setActive(null)
    setModalOpen(true)
  }

  function openEdit(match) {
    setActive(match)
    setModalOpen(true)
  }

  function handleSaved() {
    load(page)
  }

  function openDelete(match) {
    setDeleting(match)
    setDeleteError(null)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await matchesApi.remove(deleting.id)
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
    <div aria-busy={status === 'loading'}>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Partidos</h1>
          <p className="page__subtitle">
            Programa y gestiona los encuentros de cada torneo de la UNAL La Nubia.
          </p>
        </div>
        {canManage && (
          <div className="page__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
              <span className="btn__content">
                <PlusIcon />
                Nuevo partido
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

      {status === 'loading' && <MatchesSkeleton />}

      {status === 'ready' && items.length === 0 && <EmptyState />}

      {status === 'ready' && items.length > 0 && (
        <>
          <MatchesTable
            items={items}
            canManage={canManage}
            onEdit={openEdit}
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

      <MatchFormModal
        open={modalOpen}
        match={active}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar partido"
        message={
          deleting
            ? `¿Seguro que quieres eliminar el partido «${deleting.home_team?.name} vs ${deleting.away_team?.name}»?`
            : ''
        }
        confirmLabel="Eliminar partido"
        error={deleteError}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}