import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import TournamentFormModal from '../../components/tournaments/TournamentFormModal'
import { EnrollmentsPanel } from '../../components/enrollment/EnrollmentsPanel'
import { MatchesPanel } from '../../components/matches/MatchesPanel'
import {
  AlertIcon,
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  TrophyIcon,
  UsersIcon,
  WhistleIcon,
} from '../../components/icons'
import { formatDateRange, tournamentLabels } from '../../utils/format'

export default function TournamentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useRole()

  const { data, status, error, refetch } = useFetch(
    `app:tournament:${id}`,
    () => api.get(`/tournaments/${id}`),
    { ttl: 30_000 },
  )
  const tournament = data?.data ?? null

  const [tab, setTab] = useState('inscripciones')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { run: deleteTournament, busy: deleteBusy, error: deleteError } = useMutation(
    () => api.delete(`/tournaments/${id}`),
    {
      invalidate: ['app:tournaments'],
      successMessage: 'Torneo eliminado',
      onSuccess: () => navigate('/app/torneos'),
    },
  )

  async function confirmDelete() {
    try {
      await deleteTournament()
    } catch {
      // El error se muestra dentro del diálogo de confirmación.
    }
  }

  return (
    <div className="page">
      <Link
        to="/app/torneos"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          width: 'fit-content',
          font: '600 13px/1 var(--font-body)',
          color: 'var(--pitch)',
        }}
      >
        <ArrowLeftIcon width={15} height={15} />
        Todos los torneos
      </Link>

      {status === 'loading' && <CardsSkeleton count={2} />}

      {status === 'error' && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar el torneo.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && !tournament && (
        <EmptyState
          icon={TrophyIcon}
          title="Torneo no encontrado"
          text="El torneo que buscas no existe o fue eliminado."
        />
      )}

      {status === 'ready' && tournament && (
        <>
          <header className="page__head">
            <div>
              <p className="page__eyebrow">Torneo</p>
              <h1 className="page__title">{tournament.name}</h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 10,
                }}
              >
                <Badge variant={tournament.modality}>
                  {tournamentLabels.modality[tournament.modality] ?? tournament.modality}
                </Badge>
                <Badge
                  variant={tournament.status}
                  withDot={tournament.status === 'en_curso'}
                >
                  {tournamentLabels.status[tournament.status] ?? tournament.status}
                </Badge>
                <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                  {formatDateRange(tournament.start_date, tournament.end_date)}
                </span>
              </div>
              {tournament.description && (
                <p className="page__subtitle">{tournament.description}</p>
              )}
            </div>
            {isAdmin && (
              <div className="page__actions">
                <Button variant="ghost" icon={EditIcon} onClick={() => setEditOpen(true)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  icon={TrashIcon}
                  onClick={() => setDeleteOpen(true)}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </header>

          <div className="tabs" role="tablist" aria-label="Secciones del torneo">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'inscripciones'}
              className={`tabs__item ${tab === 'inscripciones' ? 'is-active' : ''}`}
              onClick={() => setTab('inscripciones')}
            >
              <UsersIcon />
              Inscripciones
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'partidos'}
              className={`tabs__item ${tab === 'partidos' ? 'is-active' : ''}`}
              onClick={() => setTab('partidos')}
            >
              <WhistleIcon />
              Partidos
            </button>
          </div>

          {tab === 'inscripciones' ? (
            <EnrollmentsPanel tournamentId={id} />
          ) : (
            <MatchesPanel tournamentId={id} />
          )}
        </>
      )}

      {isAdmin && (
        <TournamentFormModal
          open={editOpen}
          tournament={tournament}
          onClose={() => setEditOpen(false)}
          onSaved={refetch}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar torneo"
        message={`¿Eliminar el torneo "${tournament?.name}"? Se eliminarán también sus inscripciones y partidos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar torneo"
        busy={deleteBusy}
        error={deleteError?.message}
        onConfirm={confirmDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
