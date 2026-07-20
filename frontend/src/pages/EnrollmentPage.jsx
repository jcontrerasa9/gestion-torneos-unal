import { useCallback, useEffect, useState } from 'react'
import * as enrollmentApi from '../api/tournament-teams'
import { useAuth } from '../context/useAuth'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import {
  AlertIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '../components/icons'
import EnrollmentFormModal from '../components/enrollment/EnrollmentFormModal'

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

function EnrollmentTable({ items, isAdmin, onApprove, onReject, onDelete }) {
  return (
    <div className="table" role="table" aria-label="Inscripciones">
      <div className="table__head" role="row">
        <div role="columnheader">Torneo</div>
        <div role="columnheader">Equipo</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Solicitud</div>
        {isAdmin && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((i) => (
        <div key={i.id} className="table__row" role="row">
          <div className="table__cell" role="cell">
            <span style={{ fontWeight: 600 }}>{i.tournament?.name ?? '—'}</span>
          </div>

          <div className="table__cell" role="cell">
            <span style={{ fontWeight: 600 }}>{i.team?.name ?? '—'}</span>
          </div>

          <div className="table__cell" role="cell">
            <Badge variant={i.status}>
              {STATUS_LABEL[i.status] ?? i.status}
            </Badge>
          </div>

          <div className="table__cell table__cell--meta" role="cell">
            {i.request_date ?? '—'}
          </div>

          {isAdmin && (
            <div className="table__cell table__cell--actions" role="cell">
              {i.status === 'pendiente' && (
                <>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onApprove(i)}
                    aria-label={`Aprobar ${i.team?.name} en ${i.tournament?.name}`}
                    title="Aprobar"
                    style={{ color: '#86efac' }}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onReject(i)}
                    aria-label={`Rechazar ${i.team?.name} en ${i.tournament?.name}`}
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
                onClick={() => onDelete(i)}
                aria-label={`Eliminar ${i.team?.name} en ${i.tournament?.name}`}
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

function EnrollmentSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Torneo</div>
        <div>Equipo</div>
        <div>Estado</div>
        <div>Solicitud</div>
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
        <CheckIcon />
      </span>
      <h2 className="empty__title">Aún no hay inscripciones</h2>
      <p className="empty__text">
        Inscribe un equipo en un torneo para empezar a gestionar su participación.
      </p>
    </section>
  )
}

export default function EnrollmentPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'captain'
  const isAdmin = user?.role?.name === 'admin'

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
      const res = await enrollmentApi.list(targetPage)
      const payload = res.data
      setItems(payload.data)
      setLastPage(payload.last_page ?? 1)
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
      await enrollmentApi.update(item.id, { status: 'aprobada' })
      load(page)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReject(item) {
    try {
      await enrollmentApi.update(item.id, { status: 'rechazada' })
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
      await enrollmentApi.remove(deleting.id)
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
            <h1 className="page__title">Inscripciones</h1>
            <p className="page__subtitle">
              Inscribe equipos en los torneos y gestiona las solicitudes de participación.
            </p>
          </div>
          {canManage && (
            <div className="page__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
                <span className="btn__content">
                  <PlusIcon />
                  Nueva inscripción
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

        {fetchStatus === 'loading' && <EnrollmentSkeleton />}

        {fetchStatus === 'ready' && items.length === 0 && <EmptyState />}

        {fetchStatus === 'ready' && items.length > 0 && (
          <>
            <EnrollmentTable
              items={items}
              isAdmin={isAdmin}
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

      <EnrollmentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar inscripción"
        message={
          deleting
            ? `¿Seguro que quieres eliminar la inscripción de «${deleting.team?.name}» en «${deleting.tournament?.name}»?`
            : ''
        }
        confirmLabel="Eliminar inscripción"
        error={deleteError}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}