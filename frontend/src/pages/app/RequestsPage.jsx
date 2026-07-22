import { useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useRole } from '../../hooks/useRole'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/TableSkeleton'
import PlayerRequestFormModal from '../../components/player-requests/PlayerRequestFormModal'
import { AlertIcon, CheckIcon, PlusIcon, TrashIcon, UserIcon, XIcon } from '../../components/icons'

export default function RequestsPage() {
  const { isAdmin, isCaptain, isPlayer } = useRole()
  const canManage = isAdmin || isCaptain

  const { data, status, error, refetch } = useFetch(
    'app:requests',
    () => listAll('/player-requests'),
    { ttl: 30_000 },
  )
  const items = itemsOf(data)

  const [createOpen, setCreateOpen] = useState(false)
  const [actionItem, setActionItem] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function openAction(item, type) {
    setActionItem(item)
    setActionType(type)
    setActionError(null)
  }

  async function confirmAction() {
    setActionBusy(true)
    setActionError(null)
    try {
      await api.patch(`/player-requests/${actionItem.id}/${actionType}`)
      setActionItem(null)
      setActionType(null)
      refetch()
    } catch (err) {
      setActionError(err.data?.message ?? err.message)
    } finally {
      setActionBusy(false)
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await api.delete(`/player-requests/${deleting.id}`)
      setDeleting(null)
      refetch()
    } catch (err) {
      setDeleteError(err.data?.message ?? err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  const actionTitle = actionType === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'
  const actionMessage = actionItem
    ? `${actionType === 'approve' ? 'Aprobar' : 'Rechazar'} la solicitud de ${actionItem.player?.first_name} ${actionItem.player?.last_name} para ${actionItem.tournament_team?.team?.name}?`
    : ''

  return (
    <div className="page">
      <PageHeader
        eyebrow="Incorporaciones"
        title="Solicitudes de jugadores"
        subtitle="Gestiona las solicitudes de incorporación a equipos."
        actions={
          isPlayer && (
            <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>
              Nueva solicitud
            </Button>
          )
        }
      />

      {status === 'loading' && <TableSkeleton />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar las solicitudes.'}
          <button className="btn btn--ghost btn--sm" onClick={refetch}>Reintentar</button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <EmptyState
          icon={UserIcon}
          title="Sin solicitudes"
          text={isPlayer ? 'Envía una solicitud para unirte a un equipo inscrito en un torneo.' : 'No hay solicitudes pendientes de revisar.'}
          action={isPlayer && <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>Nueva solicitud</Button>}
        />
      )}

      {status === 'ready' && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Solicitudes de jugadores</caption>
            <thead>
              <tr>
                <th scope="col">Jugador</th>
                <th scope="col">Equipo · Torneo</th>
                <th scope="col" className="num col-hide-s">Dorsal</th>
                <th scope="col" className="col-hide-s">Posición</th>
                <th scope="col">Estado</th>
                <th scope="col"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="table__main">
                      {r.player?.first_name} {r.player?.last_name}
                    </span>
                  </td>
                  <td>
                    <span className="table__main">{r.tournament_team?.team?.name}</span>
                    <span className="table__sub">{r.tournament_team?.tournament?.name}</span>
                  </td>
                  <td className="num col-hide-s">{r.jersey_number ?? '—'}</td>
                  <td className="col-hide-s">{r.position ?? '—'}</td>
                  <td>
                    <Badge variant={r.status}>{r.status}</Badge>
                  </td>
                  <td>
                    <div className="table__actions">
                      {canManage && r.status === 'pendiente' && (
                        <>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Aprobar solicitud de ${r.player?.first_name}`}
                            title="Aprobar"
                            onClick={() => openAction(r, 'approve')}
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-btn is-danger"
                            aria-label={`Rechazar solicitud de ${r.player?.first_name}`}
                            title="Rechazar"
                            onClick={() => openAction(r, 'reject')}
                          >
                            <XIcon />
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          className="icon-btn is-danger"
                          aria-label={`Eliminar solicitud de ${r.player?.first_name}`}
                          title="Eliminar"
                          onClick={() => setDeleting(r)}
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

      <PlayerRequestFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(actionItem)}
        title={actionTitle}
        message={actionMessage}
        confirmLabel={actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
        danger={actionType === 'reject'}
        busy={actionBusy}
        error={actionError}
        onConfirm={confirmAction}
        onClose={() => { setActionItem(null); setActionType(null) }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar solicitud"
        message={deleting ? `¿Eliminar la solicitud de ${deleting.player?.first_name} ${deleting.player?.last_name}?` : ''}
        confirmLabel="Eliminar"
        busy={deleteBusy}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
