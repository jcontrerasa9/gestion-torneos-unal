import { useCallback, useEffect, useState } from 'react'
import * as standingsApi from '../api/standings'
import { api } from '../api/client'
import { TrophyIcon } from '../components/icons'

function StandingsTable({ standings }) {
  const rows = standings.map((s, i) => {
    const team = s.tournament_team?.team
    return {
      pos: i + 1,
      name: team?.name ?? '—',
      pj: s.matches_played,
      g: s.wins,
      e: s.draws,
      p: s.losses,
      gf: s.goals_for,
      gc: s.goals_against,
      dif: s.goal_difference,
      pts: s.points,
    }
  })

  if (rows.length === 0) {
    return (
      <section className="empty" style={{ marginTop: 32 }}>
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
    <div
      className="table"
      role="table"
      aria-label="Tabla de posiciones"
      style={{ marginTop: 24 }}
    >
      <div
        className="table__head standings__head"
        role="row"
      >
        <div role="columnheader">#</div>
        <div role="columnheader" className="standings__team-col">Equipo</div>
        <div role="columnheader" className="standings__num">PJ</div>
        <div role="columnheader" className="standings__num">G</div>
        <div role="columnheader" className="standings__num">E</div>
        <div role="columnheader" className="standings__num">P</div>
        <div role="columnheader" className="standings__num">GF</div>
        <div role="columnheader" className="standings__num">GC</div>
        <div role="columnheader" className="standings__num">Dif</div>
        <div role="columnheader" className="standings__num standings__pts-col">
          Pts
        </div>
      </div>

      {rows.map((r) => (
        <div
          key={r.name + r.pos}
          className="table__row standings__row"
          role="row"
        >
          <div className="table__cell standings__pos" role="cell">
            {r.pos <= 3 ? (
              <span className={`standings__medal standings__medal--${r.pos}`}>
                {r.pos}
              </span>
            ) : (
              r.pos
            )}
          </div>
          <div
            className="table__cell standings__team-col"
            role="cell"
            style={{ fontWeight: 600 }}
          >
            {r.name}
          </div>
          <div className="table__cell standings__num" role="cell">{r.pj}</div>
          <div className="table__cell standings__num" role="cell">{r.g}</div>
          <div className="table__cell standings__num" role="cell">{r.e}</div>
          <div className="table__cell standings__num" role="cell">{r.p}</div>
          <div className="table__cell standings__num" role="cell">{r.gf}</div>
          <div className="table__cell standings__num" role="cell">{r.gc}</div>
          <div className="table__cell standings__num" role="cell">
            {r.dif > 0 ? `+${r.dif}` : r.dif}
          </div>
          <div
            className="table__cell standings__num standings__pts"
            role="cell"
          >
            {r.pts}
          </div>
        </div>
      ))}
    </div>
  )
}

function StandingsSkeleton() {
  return (
    <div className="table" aria-hidden="true" style={{ marginTop: 24 }}>
      <div className="table__head standings__head">
        <div>#</div><div>Equipo</div>
        <div>PJ</div><div>G</div><div>E</div><div>P</div>
        <div>GF</div><div>GC</div><div>Dif</div><div>Pts</div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
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
            Consulta la clasificación actualizada de los torneos universitarios.
          </p>
        </div>
      </header>

      {tournamentOpts.length > 0 && (
        <div style={{ maxWidth: 340 }}>
          <label htmlFor="tournament-select" className="field__label">
            Torneo
          </label>
          <select
            id="tournament-select"
            className="field__select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ marginTop: 8 }}
          >
            {tournamentOpts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert" style={{ marginTop: 16 }}>
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