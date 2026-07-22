import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import * as meApi from '../api/match-events'
import Badge from '../components/ui/Badge'
import { AlertIcon, TrophyIcon } from '../components/icons'

const EVENT_LABEL = {
  gol: '⚽ Gol',
  tarjeta_amarilla: '🟡 Amarilla',
  tarjeta_roja: '🔴 Roja',
}

const EVENT_OPTIONS = [
  { value: 'gol', label: '⚽ Gol' },
  { value: 'tarjeta_amarilla', label: '🟡 Amarilla' },
  { value: 'tarjeta_roja', label: '🔴 Roja' },
]

export default function RefereeDashboard() {
  const [matches, setMatches] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [players, setPlayers] = useState([])
  const [form, setForm] = useState({ player_id: '', event_type: '', minute: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [finalizing, setFinalizing] = useState(false)
  const [finishForm, setFinishForm] = useState({ home_score: '', away_score: '' })

  const active = matches.find((m) => m.id === activeId)

  const loadMatches = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.get('/referee/matches')
      setMatches(res.data || [])
      if (res.data?.length && !activeId) setActiveId(res.data[0].id)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [activeId])

  useEffect(() => { loadMatches() }, [loadMatches])

  useEffect(() => {
    if (!activeId) { setPlayers([]); return }
    api.get(`/tournaments/${active?.tournament_id}/players`).then((r) => {
      setPlayers(r.data || [])
    }).catch(() => setPlayers([]))
  }, [activeId, active?.tournament_id])

  const reloadMatch = async () => {
    if (!activeId) return
    const res = await api.get(`/tournament-matches/${activeId}`)
    setMatches((prev) => prev.map((m) => m.id === activeId ? res.data : m))
  }

  async function handleCreateEvent(e) {
    e.preventDefault()
    if (!form.player_id || !form.event_type || !form.minute) {
      setFormError('Completa jugador, evento y minuto'); return
    }
    setSubmitting(true); setFormError(null)
    try {
      await meApi.create({ match_id: activeId, ...form, minute: parseInt(form.minute) })
      setForm({ player_id: '', event_type: '', minute: '' })
      await reloadMatch()
    } catch (err) {
      setFormError(err.data?.message || err.message)
    } finally { setSubmitting(false) }
  }

  async function handleFinalize() {
    setFinalizing(true); setFormError(null)
    try {
      await api.patch(`/tournament-matches/${activeId}/results`, {
        home_score: parseInt(finishForm.home_score),
        away_score: parseInt(finishForm.away_score),
        status: 'finalizado',
      })
      await loadMatches()
      setFinishForm({ home_score: '', away_score: '' })
    } catch (err) {
      setFormError(err.data?.message || err.message)
    } finally { setFinalizing(false) }
  }

  const playerOpts = players.map((p) => ({
    value: p.player.id,
    label: `${p.player.first_name} ${p.player.last_name} (#${p.jersey_number})`,
  }))

  if (loading) {
    return (
      <div className="ref-loading">
        <span className="shell__brand-mark" style={{ width: 48, height: 48, borderRadius: 14 }}>
          <TrophyIcon />
        </span>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Cargando partidos…</p>
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="ref-loading">
        <TrophyIcon />
        <h2 style={{ marginTop: 16, fontWeight: 700 }}>Sin partidos asignados</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', maxWidth: 320 }}>
          No tienes partidos programados o en curso. Cuando el administrador te asigne un encuentro, aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="referee">
      {/* match selector */}
      <div className="ref-tabs">
        {matches.map((m) => (
          <button key={m.id} type="button"
            className={`ref-tab ${m.id === activeId ? 'ref-tab--active' : ''}`}
            onClick={() => setActiveId(m.id)}>
            {m.home_team?.name} vs {m.away_team?.name}
          </button>
        ))}
      </div>

      {error && (<div className="error-banner" role="alert"><AlertIcon />{error}</div>)}

      {active && (
        <div className="ref-card">
          {/* match header */}
          <div className="ref-header">
            <span className="ref-tournament">{active.tournament?.name}</span>
            <div className="ref-teams">
              <span className="ref-team-name">{active.home_team?.name}</span>
              <span className="ref-vs">
                {active.home_score != null ? `${active.home_score} - ${active.away_score}` : 'vs'}
              </span>
              <span className="ref-team-name">{active.away_team?.name}</span>
            </div>
            <Badge variant={active.status}>
              {active.status === 'en_juego' ? 'En juego' : 'Programado'}
            </Badge>
          </div>

          {/* quick actions */}
          <div className="ref-actions">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 10 }}>
              Registrar evento
            </h3>
            <form className="ref-form" onSubmit={handleCreateEvent}>
              <select className="field__select" value={form.event_type}
                onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))}>
                <option value="" disabled hidden>Tipo</option>
                {EVENT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <input className="field__input field__input--plain" type="number" placeholder="Minuto"
                value={form.minute} onChange={(e) => setForm((p) => ({ ...p, minute: e.target.value }))}
                min={0} max={120} style={{ width: 100, flexShrink: 0 }} />
              <select className="field__select" value={form.player_id}
                onChange={(e) => setForm((p) => ({ ...p, player_id: e.target.value }))}>
                <option value="" disabled hidden>Jugador</option>
                {playerOpts.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              <button type="submit" className="btn btn--primary btn--sm" disabled={submitting} style={{ flexShrink: 0 }}>
                {submitting ? '…' : 'Registrar'}
              </button>
            </form>
            {formError && (<div className="auth__error" role="alert" style={{ marginTop: 10 }}><AlertIcon />{formError}</div>)}
          </div>

          {/* events list */}
          <div className="ref-events">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 10 }}>
              Eventos del partido
            </h3>
            {(!active.events || active.events.length === 0) ? (
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Sin eventos registrados aún.</p>
            ) : (
              <div className="ref-event-list">
                {[...active.events].sort((a, b) => b.minute - a.minute).map((ev) => (
                  <div key={ev.id} className="ref-event-row">
                    <span className="ref-event-min">{ev.minute}&apos;</span>
                    <span className="ref-event-icon">{EVENT_LABEL[ev.event_type] ?? ev.event_type}</span>
                    <span className="ref-event-player">
                      {ev.player ? `${ev.player.first_name} ${ev.player.last_name}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* finalize */}
          <div className="ref-finalize">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 10 }}>
              Finalizar partido
            </h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="field__input field__input--plain" type="number" placeholder="Goles local"
                value={finishForm.home_score} onChange={(e) => setFinishForm((p) => ({ ...p, home_score: e.target.value }))}
                style={{ width: 120 }} min={0} />
              <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>—</span>
              <input className="field__input field__input--plain" type="number" placeholder="Visitante"
                value={finishForm.away_score} onChange={(e) => setFinishForm((p) => ({ ...p, away_score: e.target.value }))}
                style={{ width: 120 }} min={0} />
              <button type="button" className="btn btn--primary btn--sm" onClick={handleFinalize} disabled={finalizing}
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
                {finalizing ? '…' : '🏁 Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}