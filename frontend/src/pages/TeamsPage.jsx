import { useCallback, useEffect, useState } from 'react'
import * as teamsApi from '../api/teams'
import { useAuth } from '../context/useAuth'
import Pagination from '../components/ui/Pagination'
import { AlertIcon, EditIcon, PlusIcon, ShieldIcon, TrashIcon } from '../components/icons'
import TeamFormModal from '../components/teams/TeamFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function TeamsTable({ items, canManage, onEdit, onDelete }) {
  const cols = canManage
    ? 'minmax(0, 1fr) minmax(0, 0.8fr) auto'
    : 'minmax(0, 1fr) minmax(0, 0.8fr)'

  return (
    <div className="table" role="table" aria-label="Equipos">
      <div className="table__head" role="row" style={{ gridTemplateColumns: cols }}>
        <div role="columnheader">Nombre</div>
        <div role="columnheader">Capitán</div>
        {canManage && <div role="columnheader">Acciones</div>}
      </div>

      {items.map((t) => (
        <div key={t.id} className="table__row" role="row" style={{ gridTemplateColumns: cols }}>
          <div className="table__cell" role="cell">
            <span style={{ fontWeight: 600 }}>{t.name}</span>
          </div>

          <div className="table__cell table__cell--meta" role="cell">
            {t.captain
              ? `${t.captain.first_name} ${t.captain.last_name}`
              : 'Sin capitán'}
          </div>

          {canManage && (
            <div className="table__cell table__cell--actions" role="cell">
              <button
                type="button"
                className="icon-btn"
                onClick={() => onEdit(t)}
                aria-label={`Editar ${t.name}`}
                title="Editar"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                className="icon-btn is-danger"
                onClick={() => onDelete(t)}
                aria-label={`Eliminar ${t.name}`}
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

function TeamsSkeleton() {
  const cols = 'minmax(0, 1fr) minmax(0, 0.8fr)'

  return (
    <div className="table" aria-hidden="true">
      <div className="table__head" style={{ gridTemplateColumns: cols }}>
        <div>Nombre</div>
        <div>Capitán</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ gridTemplateColumns: cols }}>
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--md" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canManage }) {
  return (
    <section className="empty">
      <span className="empty__mark">
        <ShieldIcon />
      </span>
      <h2 className="empty__title">Aún no hay equipos</h2>
      <p className="empty__text">
        {canManage
          ? 'Crea el primer equipo para inscribirlo en los torneos.'
          : 'Cuando el administrador o un capitán registre equipos, aparecerán aquí.'}
      </p>
    </section>
  )
}

export default function TeamsPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin' || user?.role?.name === 'captain'

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
      const res = await teamsApi.list(targetPage)
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

  function openEdit(team) {
    setActive(team)
    setModalOpen(true)
  }

  function handleSaved() {
    load(page)
  }

  function openDelete(team) {
    setDeleting(team)
    setDeleteError(null)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await teamsApi.remove(deleting.id)
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
            <h1 className="page__title">Equipos</h1>
            <p className="page__subtitle">
              Administra los equipos inscritos en los torneos de la UNAL La Nubia.
            </p>
          </div>
          {canManage && (
            <div className="page__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
                <span className="btn__content">
                  <PlusIcon />
                  Nuevo equipo
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

        {status === 'loading' && <TeamsSkeleton />}

        {status === 'ready' && items.length === 0 && (
          <EmptyState canManage={canManage} />
        )}

        {status === 'ready' && items.length > 0 && (
          <>
            <TeamsTable
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

      <TeamFormModal
        open={modalOpen}
        team={active}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar equipo"
        message={
          deleting
            ? `¿Seguro que quieres eliminar «${deleting.name}»? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar equipo"
        error={deleteError}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  )
}