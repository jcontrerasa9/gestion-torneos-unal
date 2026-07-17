import { useCallback, useEffect, useState } from 'react'
import * as matchesApi from '../api/matches'
import Badge from '../components/ui/Badge'
import Pagination from '../components/ui/Pagination'
import { AlertIcon, TrophyIcon } from '../components/icons'
import { formatDate, formatTime, matchLabels } from '../utils/format'

const STATUS_LABEL = matchLabels

function MatchesTable({ items }) {
  return (
    <div className="table" role="table" aria-label="Partidos">
      <div className="table__head" role="row">
        <div role="columnheader">Torneo · Fecha</div>
        <div role="columnheader">Partido</div>
        <div role="columnheader">Estado</div>
        <div role="columnheader">Resultado</div>
      </div>

      {items.map((m) => (
        <div key={m.id} className="table__row" role="row">
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

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

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

  return (
    <div aria-busy={status === 'loading'}>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Partidos</h1>
          <p className="page__subtitle">
            Programa y gestiona los encuentros de cada torneo de la UNAL La Nubia.
          </p>
        </div>
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
          <MatchesTable items={items} />
          <Pagination
            page={page}
            lastPage={lastPage}
            onChange={handleChangePage}
          />
        </>
      )}
    </div>
  )
}