import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import TournamentFormModal from '../../components/tournaments/TournamentFormModal'
import {
  AlertIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  TrophyIcon,
} from '../../components/icons'
import { formatDateRange, tournamentLabels } from '../../utils/format'

export default function TournamentsPage() {
  const { isAdmin } = useRole()

  const { data, status, error, refetch } = useFetch(
    'app:tournaments',
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )
  const tournaments = itemsOf(data)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { run: deleteTournament, busy: deleteBusy, error: deleteError } = useMutation(
    (id) => api.delete(`/tournaments/${id}`),
    {
      invalidate: ['app:tournaments'],
      successMessage: 'Torneo eliminado',
      onSuccess: () => setDeleting(null),
    },
  )

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(tournament) {
    setEditing(tournament)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteTournament(deleting.id)
    } catch {
      // El error se muestra dentro del diálogo de confirmación.
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Competiciones"
        title="Torneos"
        subtitle="Competiciones de la comunidad UNAL: modalidad, fechas y estado de cada certamen."
        actions={
          isAdmin && (
            <Button icon={PlusIcon} onClick={openCreate}>
              Nuevo torneo
            </Button>
          )
        }
      />

      {status === 'loading' && <CardsSkeleton count={4} />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar los torneos.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && tournaments.length === 0 && (
        <EmptyState
          icon={TrophyIcon}
          title="Aún no hay torneos"
          text={
            isAdmin
              ? 'Crea el primer torneo para habilitar inscripciones y partidos.'
              : 'Cuando se programe un torneo aparecerá aquí.'
          }
          action={
            isAdmin && (
              <Button icon={PlusIcon} onClick={openCreate}>
                Nuevo torneo
              </Button>
            )
          }
        />
      )}

      {status === 'ready' && tournaments.length > 0 && (
        <div className="tournament-cards">
          {tournaments.map((t) => (
            <Link key={t.id} to={`/app/torneos/${t.id}`} className="tournament-card">
              <div className="tournament-card__top">
                <h2 className="tournament-card__name">{t.name}</h2>
                <Badge variant={t.status} withDot={t.status === 'en_curso'}>
                  {tournamentLabels.status[t.status] ?? t.status}
                </Badge>
              </div>
              <p className="tournament-card__dates">
                {tournamentLabels.modality[t.modality] ?? t.modality}
                {' · '}
                {formatDateRange(t.start_date, t.end_date)}
              </p>
              {t.description && (
                <p className="tournament-card__desc">{t.description}</p>
              )}
              {isAdmin && (
                <div className="tournament-card__foot">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Editar ${t.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      openEdit(t)
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn is-danger"
                    aria-label={`Eliminar ${t.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleting(t)
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {isAdmin && (
        <TournamentFormModal
          open={formOpen}
          tournament={editing}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar torneo"
        message={`¿Eliminar el torneo "${deleting?.name}"? Se eliminarán también sus inscripciones y partidos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar torneo"
        busy={deleteBusy}
        error={deleteError?.message}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
