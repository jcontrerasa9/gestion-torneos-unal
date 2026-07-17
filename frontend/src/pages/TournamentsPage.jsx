import { useCallback, useEffect, useState } from 'react'
import * as tournamentsApi from '../api/tournaments'
import { useAuth } from '../context/useAuth'
import Badge from '../components/ui/Badge'
import Pagination from '../components/ui/Pagination'
import { AlertIcon, EditIcon, PlusIcon, TrophyIcon } from '../components/icons'
import { formatDateRange, tournamentLabels } from '../utils/format'
import TournamentFormModal from '../components/tournaments/TournamentFormModal'

const MODALITY_LABEL = tournamentLabels.modality
const STATUS_LABEL = tournamentLabels.status

function TournamentsTable({ items, canManage, onEdit }) {
  const cols = canManage
    ? 'minmax(180px, 1.6fr) auto auto minmax(180px, 1.2fr) auto'
    : 'minmax(180px, 1.6fr) auto auto minmax(180px, 1.2fr)'

  return (
    <div className="table" role="table" aria-label="Torneos">
      <div className="table__head" role="row" style={{ gridTemplateColumns: cols }}>
        <div role="columnheader">Nombre</div>
        <div role="columnheader">Modalidad</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Fechas</div>
        {canManage && <div role="columnheader" aria-label="Acciones">Acciones</div>}
      </div>

      {items.map((t) => (
        <div key={t.id} className="table__row" role="row" style={{ gridTemplateColumns: cols }}>
          <div className="table__cell table__cell--primary" role="cell" title={t.name}>
            <div className="table__stack">
              {t.name}
              {t.description && (
                <span className="table__stack-sub" title={t.description}>
                  {t.description}
                </span>
              )}
            </div>
          </div>
          <div className="table__cell" role="cell">
            <Badge variant="modalidad">
              {MODALITY_LABEL[t.modality] ?? t.modality}
            </Badge>
          </div>
          <div className="table__cell" role="cell">
            <Badge variant={t.status} withDot={t.status === 'en_curso'}>
              {STATUS_LABEL[t.status] ?? t.status}
            </Badge>
          </div>
          <div className="table__cell table__cell--meta" role="cell">
            {formatDateRange(t.start_date, t.end_date)}
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
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TournamentsSkeleton() {
  return (
    <div className="table" aria-hidden="true">
      <div className="table__head">
        <div>Nombre</div>
        <div>Modalidad</div>
        <div>Estado</div>
        <div>Fechas</div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
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
        <TrophyIcon />
      </span>
      <h2 className="empty__title">Aún no hay torneos</h2>
      <p className="empty__text">
        {canManage
          ? 'Crea el primer campeonato de Fútbol 5 o Fútbol 11 de esta temporada.'
          : 'Cuando el administrador cree campeonatos, aparecerán aquí.'}
      </p>
    </section>
  )
}

export default function TournamentsPage() {
  const { user } = useAuth()
  const canManage = user?.role?.name === 'admin'

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [active, setActive] = useState(null)

  const load = useCallback(async (targetPage) => {
    setStatus('loading')
    setError(null)
    try {
      const res = await tournamentsApi.list(targetPage)
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

  function openEdit(tournament) {
    setActive(tournament)
    setModalOpen(true)
  }

  function handleSaved() {
    load(page)
  }

  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Torneos</h1>
          <p className="page__subtitle">
            Gestiona los campeonatos de Fútbol 5 y Fútbol 11 de la UNAL La Nubia.
          </p>
        </div>
        {canManage && (
          <div className="page__actions">
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              <span className="btn__content">
                <PlusIcon />
                Nuevo torneo
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

      {status === 'loading' && <TournamentsSkeleton />}

      {status === 'ready' && items.length === 0 && (
        <EmptyState canManage={canManage} />
      )}

      {status === 'ready' && items.length > 0 && (
        <>
          <TournamentsTable
            items={items}
            canManage={canManage}
            onEdit={openEdit}
          />
          <Pagination
            page={page}
            lastPage={lastPage}
            onChange={handleChangePage}
          />
        </>
      )}

      <TournamentFormModal
        open={modalOpen}
        tournament={active}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  )
}