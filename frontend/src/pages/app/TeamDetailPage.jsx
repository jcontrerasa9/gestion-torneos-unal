import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import TeamFormModal from '../../components/teams/TeamFormModal'
import { ArrowLeftIcon, BanIcon, CheckIcon, EditIcon, TrashIcon, UsersIcon } from '../../components/icons'

export default function TeamDetailPage() {
  const { id } = useParams()
  const { isAdmin, isCaptain } = useRole()
  const canManage = isAdmin || isCaptain

  const { data: teamRes, status: teamStatus, refetch: refetchTeam } = useFetch(
    `app:team:${id}`,
    () => api.get(`/teams/${id}`),
    { ttl: 60_000 },
  )
  const team = teamRes?.data ?? null

  const { data: rosterRes, status: rosterStatus, refetch: refetchRoster } = useFetch(
    'app:roster',
    () => listAll('/tournament-team-players'),
    { ttl: 60_000 },
  )

  const roster = useMemo(() => {
    const all = itemsOf(rosterRes)
    return all.filter(
      (p) =>
        String(p.tournament_team?.team?.id ?? p.tournament_team?.team_id) === String(id),
    )
  }, [rosterRes, id])

  const [editOpen, setEditOpen] = useState(false)
  const [toggleItem, setToggleItem] = useState(null)
  const [toggleBusy, setToggleBusy] = useState(false)
  const [toggleError, setToggleError] = useState(null)
  const [removeItem, setRemoveItem] = useState(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState(null)

  async function confirmToggle() {
    setToggleBusy(true)
    setToggleError(null)
    try {
      await api.patch(`/tournament-team-players/${toggleItem.id}/toggle-status`)
      setToggleItem(null)
      refetchRoster()
    } catch (err) {
      setToggleError(err.data?.message ?? err.message)
    } finally {
      setToggleBusy(false)
    }
  }

  async function confirmRemove() {
    setRemoveBusy(true)
    setRemoveError(null)
    try {
      await api.delete(`/tournament-team-players/${removeItem.id}`)
      setRemoveItem(null)
      refetchRoster()
    } catch (err) {
      setRemoveError(err.data?.message ?? err.message)
    } finally {
      setRemoveBusy(false)
    }
  }

  return (
    <div className="page">
      <Link to="/app/equipos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--ink-muted)', marginBottom: 8 }}>
        <ArrowLeftIcon width={15} height={15} /> Equipos
      </Link>

      {teamStatus === 'loading' && <TableSkeleton />}

      {team && (
        <>
          <PageHeader
            eyebrow="Equipo"
            title={team.name}
            subtitle={team.captain ? `Capitán: ${team.captain.first_name} ${team.captain.last_name}` : 'Sin capitán asignado'}
            actions={
              canManage && (
                <Button icon={EditIcon} size="sm" onClick={() => setEditOpen(true)}>
                  Editar equipo
                </Button>
              )
            }
          />

          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            <UsersIcon width={18} height={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Plantilla
          </h2>

          {rosterStatus === 'loading' && <TableSkeleton rows={4} />}

          {rosterStatus === 'ready' && roster.length === 0 && (
            <EmptyState
              icon={UsersIcon}
              title="Sin jugadores en la plantilla"
              text="Los jugadores aparecerán aquí cuando se aprueben sus solicitudes de incorporación."
            />
          )}

          {rosterStatus === 'ready' && roster.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Plantilla del equipo</caption>
                <thead>
                  <tr>
                    <th scope="col">Jugador</th>
                    <th scope="col" className="num">Dorsal</th>
                    <th scope="col">Posición</th>
                    <th scope="col">Torneo</th>
                    <th scope="col">Estado</th>
                    {canManage && <th scope="col"><span className="sr-only">Acciones</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="table__main">
                          {p.player?.first_name} {p.player?.last_name}
                        </span>
                      </td>
                      <td className="num">{p.jersey_number ?? '—'}</td>
                      <td>{p.position ?? '—'}</td>
                      <td>{p.tournament_team?.tournament?.name ?? p.tournament?.name ?? '—'}</td>
                      <td>
                        <Badge variant={p.is_active ? 'activo' : 'inactivo'}>
                          {p.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      {canManage && (
                        <td>
                          <div className="table__actions">
                            <button
                              type="button"
                              className={`icon-btn ${p.is_active ? '' : 'is-danger'}`}
                              aria-label={p.is_active ? `Desactivar a ${p.player?.first_name}` : `Activar a ${p.player?.first_name}`}
                              title={p.is_active ? 'Desactivar' : 'Activar'}
                              onClick={() => setToggleItem(p)}
                            >
                              {p.is_active ? <BanIcon /> : <CheckIcon />}
                            </button>
                            <button
                              type="button"
                              className="icon-btn is-danger"
                              aria-label={`Quitar a ${p.player?.first_name} de la plantilla`}
                              title="Quitar de la plantilla"
                              onClick={() => setRemoveItem(p)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <TeamFormModal
        open={editOpen}
        team={team}
        onClose={() => setEditOpen(false)}
        onSaved={() => refetchTeam()}
      />

      <ConfirmDialog
        open={Boolean(toggleItem)}
        title={toggleItem?.is_active ? 'Desactivar jugador' : 'Activar jugador'}
        message={toggleItem ? `${toggleItem.is_active ? 'Desactivar' : 'Activar'} a ${toggleItem.player?.first_name} ${toggleItem.player?.last_name} en la plantilla?` : ''}
        confirmLabel={toggleItem?.is_active ? 'Desactivar' : 'Activar'}
        busy={toggleBusy}
        error={toggleError}
        onConfirm={confirmToggle}
        onClose={() => setToggleItem(null)}
      />

      <ConfirmDialog
        open={Boolean(removeItem)}
        title="Quitar de la plantilla"
        message={removeItem ? `¿Quitar a ${removeItem.player?.first_name} ${removeItem.player?.last_name} de la plantilla? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Quitar jugador"
        busy={removeBusy}
        error={removeError}
        onConfirm={confirmRemove}
        onClose={() => setRemoveItem(null)}
      />
    </div>
  )
}
