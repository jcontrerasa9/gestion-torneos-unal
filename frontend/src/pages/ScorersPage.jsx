import { useCallback, useEffect, useState } from 'react'
import * as scorersApi from '../api/scorers'
import { api } from '../api/client'
import { TrophyIcon } from '../components/icons'

function ScorersTable({ scorers }) {
  if (!scorers.length) {
    return (
      <section className="empty">
        <span className="empty__mark"><TrophyIcon /></span>
        <h2 className="empty__title">Sin datos de goleadores</h2>
        <p className="empty__text">La tabla se actualizará cuando se registren goles en los partidos.</p>
      </section>
    )
  }

  return (
    <div className="standings-table" role="table" aria-label="Goleadores">
      <div className="standings-header" role="row">
        <div role="columnheader">#</div>
        <div role="columnheader" style={{ paddingLeft: 6 }}>Jugador</div>
        <div role="columnheader">Goles</div>
      </div>

      {scorers.map((s, i) => (
        <div key={s.id} className="standings-row" role="row">
          <div className="standings-cell standings-cell--pos" role="cell">
            {i + 1 <= 3 ? (
              <span className={`standings-medal standings-medal--${i + 1}`}>{i + 1}</span>
            ) : (i + 1)}
          </div>
          <div className="standings-cell standings-cell--team" role="cell">
            {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
          </div>
          <div className="standings-cell standings-cell--pts" role="cell">{s.goals}</div>
        </div>
      ))}
    </div>
  )
}

function ScorersSkeleton() {
  return (
    <div className="standings-table" aria-hidden="true">
      <div className="standings-header"><div>#</div><div>Jugador</div><div>Goles</div></div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="standings-skel-row">
          <span className="skeleton" style={{ width: 20, height: 14, justifySelf: 'center' }} />
          <span className="skeleton skeleton--md" />
          <span className="skeleton" style={{ width: 24, height: 14, justifySelf: 'center' }} />
        </div>
      ))}
    </div>
  )
}

export default function ScorersPage() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [scorers, setScorers] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/tournaments?page=1').then((r) => {
      setTournaments(r.data.data || [])
      if (r.data.data?.length) setSelected(String(r.data.data[0].id))
    }).catch(() => {})
  }, [])

  const load = useCallback(async (id) => {
    if (!id) return
    setStatus('loading')
    setError(null)
    try {
      const res = await scorersApi.list(id)
      setScorers(res.data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('ready')
    }
  }, [])

  useEffect(() => { if (selected) load(selected) }, [selected, load])

  return (
    <div aria-busy={status === 'loading'}>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Tabla de goleadores</h1>
          <p className="page__subtitle">Ranking de máximos anotadores de los torneos universitarios.</p>
        </div>
        {tournaments.length > 0 && (
          <div className="standings-selector">
            <label htmlFor="ts" className="field__label" style={{ marginBottom: 0 }}>Torneo</label>
            <select id="ts" className="field__select" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {tournaments.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
        )}
      </header>

      {error && (<div className="error-banner" role="alert">{error}<button type="button" className="auth__switch" onClick={() => load(selected)} style={{ marginLeft: 'auto' }}>Reintentar</button></div>)}
      {status === 'loading' && <ScorersSkeleton />}
      {status === 'ready' && <ScorersTable scorers={scorers} />}
    </div>
  )
}