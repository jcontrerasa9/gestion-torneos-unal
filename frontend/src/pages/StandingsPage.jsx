import { useCallback, useEffect, useState } from 'react'
import * as standingsApi from '../api/standings'
import { api } from '../api/client'
import { TrophyIcon } from '../components/icons'

function StandingsTable({ standings }) {
  if (!standings.length) {
    return (
      <section className="empty">
        <span className="empty__mark">
          <TrophyIcon />
        </span>
        <h2 className="empty__title">Sin datos de posiciones</h2>
        <p className="empty__text">
          Las posiciones se calcularán cuando se registren resultados de los partidos.
        </p>
      </section>
    )
  }

  return (
    <div className="standings-table" role="table" aria-label="Tabla de posiciones">
      <div className="standings-header" role="row">
        <div role="columnheader">#</div>
        <div role="columnheader" style={{ paddingLeft: 6 }}>Equipo</div>
        <div role="columnheader">PJ</div>
        <div role="columnheader">G</div>
        <div role="columnheader">E</div>
        <div role="columnheader">P</div>
        <div role="columnheader">GF</div>
        <div role="columnheader">GC</div>
        <div role="columnheader">Dif</div>
        <div role="columnheader">Pts</div>
      </div>

      {standings.map((s, i) => {
        const team = s.tournament_team?.team
        return (
          <div key={s.id} className="standings-row" role="row">
            <div className="standings-cell standings-cell--pos" role="cell">
              {i + 1 <= 3 ? (
                <span className={`standings-medal standings-medal--${i + 1}`}>
                  {i + 1}
                </span>
              ) : (
                i + 1
              )}
            </div>
            <div className="standings-cell standings-cell--team" role="cell">
              {team?.name ?? '—'}
            </div>
            <div className="standings-cell" role="cell">{s.matches_played}</div>
            <div className="standings-cell" role="cell">{s.wins}</div>
            <div className="standings-cell" role="cell">{s.draws}</div>
            <div className="standings-cell" role="cell">{s.losses}</div>
            <div className="standings-cell" role="cell">{s.goals_for}</div>
            <div className="standings-cell" role="cell">{s.goals_against}</div>
            <div className="standings-cell standings-dif" role="cell">
              {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
            </div>
            <div className="standings-cell standings-cell--pts" role="cell">
              {s.points}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StandingsSkeleton() {
  return (
    <div className="standings-table" aria-hidden="true">
      <div className="standings-header">
        <div>#</div><div>Equipo</div>
        <div>PJ</div><div>G</div><div>E</div><div>P</div>
        <div>GF</div><div>GC</div><div>Dif</div><div>Pts</div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="standings-skel-row">
          <span className="skeleton" style={{ width: 20, height: 14, justifySelf: 'center' }} />
          <span className="skeleton skeleton--md" />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
        </div>
      ))}
    </div>
  )
}

export default function StandingsPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [standings, setStandings] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/tournaments?page=1').then((r) => {
      setTournaments(r.data.data || [])
      if (r.data.data?.length) {
        setSelected(String(r.data.data[0].id))
      }
    }).catch(() => {})
  }, [])

  const load = useCallback(async (id) => {
    if (!id) return
    setStatus('loading')
    setError(null)
    try {
      const res = await standingsApi.byTournament(id)
      setStandings(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    if (selected) load(selected)
  }, [selected, load])

  const tournamentOpts = tournaments.map((t) => ({
    value: String(t.id),
    label: t.name,
  }))

  return (
    <div aria-busy={status === 'loading'}>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Tabla de posiciones</h1>
          <p className="page__subtitle">
            Clasificación actualizada de los torneos universitarios UNAL La Nubia.
          </p>
        </div>
        {tournamentOpts.length > 0 && (
          <div className="standings-selector">
            <label htmlFor="tournament-select" className="field__label" style={{ marginBottom: 0 }}>
              Torneo
            </label>
            <select
              id="tournament-select"
              className="field__select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {tournamentOpts.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button
            type="button"
            className="auth__switch"
            onClick={() => load(selected)}
            style={{ marginLeft: 'auto' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'loading' && <StandingsSkeleton />}

      {status === 'ready' && <StandingsTable standings={standings} />}
    </div>
  )
}