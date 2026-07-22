import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useRole } from '../../hooks/useRole'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import TeamFormModal from '../../components/teams/TeamFormModal'
import { AlertIcon, EditIcon, ShieldIcon, TrashIcon, UsersIcon, PlusIcon } from '../../components/icons'

export default function TeamsPage() {
  const { isAdmin, isCaptain } = useRole()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const { data, status, error, refetch } = useFetch(
    'app:teams',
    () => listAll('/teams'),
    { ttl: 60_000 },
  )
  const teams = itemsOf(data)

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await api.delete(`/teams/${deleting.id}`)
      setDeleting(null)
      refetch()
    } catch (err) {
      setDeleteError(err.data?.message ?? err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Clubes"
        title="Equipos"
        subtitle="Gestiona los equipos y sus plantillas."
        actions={
          (isAdmin || isCaptain) && (
            <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true) }}>
              Nuevo equipo
            </Button>
          )
        }
      />

      {status === 'loading' && <TableSkeleton />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar los equipos.'}
          <button className="btn btn--ghost btn--sm" onClick={refetch}>Reintentar</button>
        </div>
      )}

      {status === 'ready' && teams.length === 0 && (
        <EmptyState
          icon={ShieldIcon}
          title="No hay equipos"
          text="Crea el primer equipo para comenzar a inscribirlo en torneos."
          action={
            (isAdmin || isCaptain) && (
              <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true) }}>
                Nuevo equipo
              </Button>
            )
          }
        />
      )}

      {status === 'ready' && teams.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Listado de equipos</caption>
            <thead>
              <tr>
                <th scope="col">Equipo</th>
                <th scope="col">Capitán</th>
                <th scope="col"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="table__main">{t.name}</span>
                  </td>
                  <td>
                    {t.captain
                      ? `${t.captain.first_name} ${t.captain.last_name}`
                      : <span style={{ color: 'var(--ink-muted)' }}>Sin capitán</span>}
                  </td>
                  <td>
                    <div className="table__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Ver plantilla de ${t.name}`}
                        title="Ver plantilla"
                        onClick={() => navigate(`/app/equipos/${t.id}`)}
                      >
                        <UsersIcon />
                      </button>
                      {(isAdmin || isCaptain) && (
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Editar ${t.name}`}
                          title="Editar"
                          onClick={() => { setEditing(t); setModalOpen(true) }}
                        >
                          <EditIcon />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          className="icon-btn is-danger"
                          aria-label={`Eliminar ${t.name}`}
                          title="Eliminar"
                          onClick={() => setDeleting(t)}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeamFormModal
        open={modalOpen}
        team={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar equipo"
        message={deleting ? `¿Seguro que quieres eliminar el equipo "${deleting.name}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar equipo"
        busy={deleteBusy}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
