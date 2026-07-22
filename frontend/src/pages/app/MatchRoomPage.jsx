import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import * as eventsApi from '../../api/match-events'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/ui/Toast'
import ScoreBoard from '../../components/ui/ScoreBoard'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { FullScreenLoader } from '../../layouts/guards'
import {
  AlertIcon,
  ArrowLeftIcon,
  BallIcon,
  CardIcon,
  FlagIcon,
  TrashIcon,
} from '../../components/icons'

const EVENT_TYPES = [
  { value: 'gol', label: 'Gol', icon: BallIcon },
  { value: 'tarjeta_amarilla', label: 'Amarilla', icon: CardIcon },
  { value: 'tarjeta_roja', label: 'Roja', icon: CardIcon },
]

const EVENT_LABEL = {
  gol: 'Gol',
  tarjeta_amarilla: 'Amarilla',
  tarjeta_roja: 'Roja',
}

const EVENT_COLOR = {
  gol: 'var(--pitch)',
  tarjeta_amarilla: 'var(--amber)',
  tarjeta_roja: 'var(--red)',
}

export default function MatchRoomPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: matchRes, status, error, refetch } = useFetch(
    `referee:match:${matchId}`,
    () => api.get(`/tournament-matches/${matchId}`),
    { ttl: 15_000 },
  )
  const match = matchRes?.data ?? null

  const { data: rosterRes } = useFetch(
    match ? `roster:tournament:${match.tournament_id}` : null,
    () => listAll('/tournament-team-players'),
    { ttl: 120_000 },
  )

  // Mapa player_id → { team_id, jersey_number } a partir de la plantilla
  const rosterByPlayer = useMemo(() => {
    const map = new Map()
    for (const p of itemsOf(rosterRes)) {
      if (String(p.tournament_id) !== String(match?.tournament_id)) continue
      if (p.is_active === false) continue
      map.set(p.player_id, {
        team_id: p.tournament_team?.team_id,
        jersey_number: p.jersey_number,
      })
    }
    return map
  }, [rosterRes, match?.tournament_id])

  const events = useMemo(
    () => [...(match?.events ?? [])].sort((a, b) => b.minute - a.minute),
    [match],
  )

  // Marcador en vivo a partir de los goles registrados
  const liveScore = useMemo(() => {
    let home = 0
    let away = 0
    for (const ev of events) {
      if (ev.event_type !== 'gol') continue
      const teamId = rosterByPlayer.get(ev.player_id)?.team_id
      if (teamId != null && String(teamId) === String(match?.home_team_id)) home += 1
      else if (teamId != null && String(teamId) === String(match?.away_team_id)) away += 1
    }
    return { home, away }
  }, [events, rosterByPlayer, match])

  const finished = match?.status === 'finalizado'
  const score = finished
    ? { home: match.home_score ?? 0, away: match.away_score ?? 0 }
    : liveScore

  // ---- Estado del flujo de registro ----
  const [eventType, setEventType] = useState('gol')
  const [teamSide, setTeamSide] = useState(null) // 'home' | 'away'
  const [minute, setMinute] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deletingEvent, setDeletingEvent] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [finishOpen, setFinishOpen] = useState(false)
  const [finishScore, setFinishScore] = useState({ home: '', away: '' })
  const [finishBusy, setFinishBusy] = useState(false)
  const [finishError, setFinishError] = useState(null)

  const teamPlayers = useMemo(() => {
    if (!match || !teamSide) return []
    const teamId = teamSide === 'home' ? match.home_team_id : match.away_team_id
    return itemsOf(rosterRes)
      .filter(
        (p) =>
          String(p.tournament_id) === String(match.tournament_id) &&
          String(p.tournament_team?.team_id) === String(teamId) &&
          p.is_active !== false,
      )
      .sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99))
  }, [match, teamSide, rosterRes])

  async function registerEvent(player) {
    if (submitting || finished) return
    const minuteValue = parseInt(minute, 10)
    if (Number.isNaN(minuteValue) || minuteValue < 0 || minuteValue > 130) {
      setFormError('Indica el minuto del evento (0–130) antes de registrar.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await eventsApi.create({
        match_id: match.id,
        player_id: player.player_id,
        event_type: eventType,
        minute: minuteValue,
      })
      toast.success(
        `${EVENT_LABEL[eventType]} registrado: ${player.player?.first_name} ${player.player?.last_name} (${minuteValue}')`,
      )
      await refetch()
    } catch (err) {
      setFormError(err.data?.message ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDeleteEvent() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await eventsApi.remove(deletingEvent.id)
      setDeletingEvent(null)
      toast.success('Evento eliminado')
      await refetch()
    } catch (err) {
      setDeleteError(err.data?.message ?? err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  function openFinish() {
    setFinishScore({ home: String(score.home), away: String(score.away) })
    setFinishError(null)
    setFinishOpen(true)
  }

  async function confirmFinish() {
    const home = parseInt(finishScore.home, 10)
    const away = parseInt(finishScore.away, 10)
    if (Number.isNaN(home) || Number.isNaN(away) || home < 0 || away < 0) {
      setFinishError('El marcador debe ser números enteros iguales o mayores a 0.')
      return
    }
    setFinishBusy(true)
    setFinishError(null)
    try {
      await api.patch(`/tournament-matches/${match.id}/results`, {
        home_score: home,
        away_score: away,
        status: 'finalizado',
      })
      toast.success('Partido finalizado. Resultado oficial registrado.')
      navigate('/app/arbitraje', { replace: true })
    } catch (err) {
      setFinishError(err.data?.message ?? err.message)
    } finally {
      setFinishBusy(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="page">
        <FullScreenLoader label="Cargando partido…" />
      </div>
    )
  }

  if (status === 'error' || !match) {
    return (
      <div className="page">
        <div className="error-banner" role="alert">
          <AlertIcon />
          {error?.message ?? 'No pudimos cargar el partido.'}
          <button type="button" className="btn btn--ghost btn--sm" onClick={refetch}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="room">
        <Link to="/app/arbitraje" className="room__back">
          <ArrowLeftIcon width={15} height={15} />
          Mis partidos
        </Link>

        <ScoreBoard
          homeName={match.home_team?.name}
          awayName={match.away_team?.name}
          homeScore={score.home}
          awayScore={score.away}
          status={match.status}
          detail={finished ? 'Finalizado' : 'En juego'}
        />

        {finished ? (
          <EmptyState
            icon={FlagIcon}
            title="Partido finalizado"
            text={`Resultado oficial: ${match.home_team?.name} ${match.home_score} — ${match.away_score} ${match.away_team?.name}.`}
          />
        ) : (
          <>
            {/* Registrar evento */}
            <section className="room__section" aria-label="Registrar evento">
              <h2 className="room__section-title">1 · Tipo de evento</h2>
              <div className="room__teams-picker" role="group" aria-label="Tipo de evento">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`room__team-btn ${eventType === t.value ? 'is-active' : ''}`}
                    style={eventType === t.value ? { borderColor: EVENT_COLOR[t.value], color: EVENT_COLOR[t.value], background: 'var(--paper)' } : undefined}
                    onClick={() => setEventType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <h2 className="room__section-title">2 · Equipo</h2>
              <div className="room__teams-picker" role="group" aria-label="Equipo">
                <button
                  type="button"
                  className={`room__team-btn ${teamSide === 'home' ? 'is-active' : ''}`}
                  onClick={() => setTeamSide('home')}
                >
                  {match.home_team?.name}
                </button>
                <button
                  type="button"
                  className={`room__team-btn ${teamSide === 'away' ? 'is-active' : ''}`}
                  onClick={() => setTeamSide('away')}
                >
                  {match.away_team?.name}
                </button>
              </div>

              <h2 className="room__section-title">3 · Minuto y jugador</h2>
              <div className="room__minute-row">
                <label htmlFor="minute" className="field__label" style={{ marginBottom: 0 }}>
                  Minuto
                </label>
                <input
                  id="minute"
                  className="field__input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={130}
                  placeholder="0"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setMinute((m) => String(Math.max(0, (parseInt(m, 10) || 0) - 1)))}
                    aria-label="Restar un minuto"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setMinute((m) => String(Math.min(130, (parseInt(m, 10) || 0) + 1)))}
                    aria-label="Sumar un minuto"
                  >
                    +
                  </button>
                </div>
              </div>

              {teamSide && (
                <div className="room__players" role="group" aria-label="Jugadores">
                  {teamPlayers.length === 0 && (
                    <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
                      No hay jugadores activos de este equipo en el torneo.
                    </p>
                  )}
                  {teamPlayers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="room__player-btn"
                      disabled={submitting}
                      onClick={() => registerEvent(p)}
                    >
                      <span className="room__player-number">{p.jersey_number ?? '—'}</span>
                      {p.player?.first_name} {p.player?.last_name}
                    </button>
                  ))}
                </div>
              )}
              {!teamSide && (
                <p style={{ color: 'var(--ink-muted)', fontSize: 13.5 }}>
                  Elige un equipo para ver sus jugadores.
                </p>
              )}

              {formError && (
                <div className="form-error-banner" role="alert">
                  <AlertIcon />
                  {formError}
                </div>
              )}
            </section>

            {/* Eventos */}
            <section className="room__section" aria-label="Eventos del partido">
              <h2 className="room__section-title">
                Eventos ({events.length})
              </h2>
              {events.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
                  Aún no hay eventos. El marcador se calcula de los goles que registres.
                </p>
              ) : (
                <div className="event-list">
                  {events.map((ev) => (
                    <div key={ev.id} className="event-row">
                      <span className="event-row__minute">{ev.minute}&apos;</span>
                      <span className="event-row__icon" style={{ color: EVENT_COLOR[ev.event_type] ?? 'var(--ink-muted)' }}>
                        {ev.event_type === 'gol' ? <BallIcon /> : <CardIcon />}
                      </span>
                      <span className="event-row__player">
                        {ev.player ? `${ev.player.first_name} ${ev.player.last_name}` : '—'}
                        <span className="event-row__team"> · {EVENT_LABEL[ev.event_type] ?? ev.event_type}</span>
                      </span>
                      <button
                        type="button"
                        className="icon-btn is-danger"
                        aria-label={`Eliminar evento de ${ev.player?.first_name ?? 'jugador'} al minuto ${ev.minute}`}
                        onClick={() => setDeletingEvent(ev)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Barra fija: finalizar */}
      {!finished && (
        <div className="room__finalize">
          <div className="room__finalize-inner">
            <Button variant="danger" icon={FlagIcon} onClick={openFinish}>
              Finalizar partido · {score.home}—{score.away}
            </Button>
          </div>
        </div>
      )}

      {/* Confirm: eliminar evento */}
      <ConfirmDialog
        open={Boolean(deletingEvent)}
        title="Eliminar evento"
        message={
          deletingEvent
            ? `¿Eliminar «${EVENT_LABEL[deletingEvent.event_type] ?? deletingEvent.event_type}» de ${deletingEvent.player?.first_name ?? ''} ${deletingEvent.player?.last_name ?? ''} al minuto ${deletingEvent.minute}?`
            : ''
        }
        confirmLabel="Eliminar evento"
        busy={deleteBusy}
        error={deleteError}
        onConfirm={confirmDeleteEvent}
        onClose={() => setDeletingEvent(null)}
      />

      {/* Confirm: finalizar partido (marcador pre-calculado, editable) */}
      <ConfirmDialog
        open={finishOpen}
        title="Finalizar partido"
        message="Este será el resultado oficial del partido. Las tablas de posiciones y goleadores se actualizarán de inmediato."
        confirmLabel="Registrar resultado final"
        busy={finishBusy}
        error={finishError}
        onConfirm={confirmFinish}
        onClose={() => setFinishOpen(false)}
      >
        <div className="finish-summary">
          <span className="finish-summary__team">{match.home_team?.name}</span>
          <div className="finish-edit">
            <input
              className="field__input"
              type="number"
              min={0}
              inputMode="numeric"
              aria-label={`Goles de ${match.home_team?.name}`}
              value={finishScore.home}
              onChange={(e) => setFinishScore((s) => ({ ...s, home: e.target.value }))}
            />
            <span style={{ fontWeight: 800, color: 'var(--ink-muted)' }}>—</span>
            <input
              className="field__input"
              type="number"
              min={0}
              inputMode="numeric"
              aria-label={`Goles de ${match.away_team?.name}`}
              value={finishScore.away}
              onChange={(e) => setFinishScore((s) => ({ ...s, away: e.target.value }))}
            />
          </div>
          <span className="finish-summary__team">{match.away_team?.name}</span>
        </div>
      </ConfirmDialog>
    </div>
  )
}
