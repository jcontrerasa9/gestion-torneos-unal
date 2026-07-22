import { matchLabels } from '../../utils/format'

/**
 * ScoreBoard · firma visual. Tablero LED de estadio.
 *
 * @param {string} homeName / awayName
 * @param {number|null} homeScore / awayScore
 * @param {string} status  programado | en_juego | finalizado | aplazado
 * @param {string} detail  línea de estado (p. ej. "67'" o "Sáb 14:00")
 * @param {'lg'|'compact'} size
 */
export default function ScoreBoard({
  homeName = 'Local',
  awayName = 'Visitante',
  homeScore = null,
  awayScore = null,
  status,
  detail,
  size = 'lg',
}) {
  const played = homeScore != null && awayScore != null
  const live = status === 'en_juego'

  return (
    <div
      className={`scoreboard ${size === 'compact' ? 'scoreboard--compact' : ''}`.trim()}
      aria-label={`${homeName} ${played ? `${homeScore} a ${awayScore}` : 'contra'} ${awayName}`}
    >
      <div className="scoreboard__inner">
        <div className="scoreboard__team">
          <span className="scoreboard__team-tag">Local</span>
          <span className="scoreboard__team-name">{homeName}</span>
        </div>

        <div className="scoreboard__center">
          {played ? (
            <span className="scoreboard__score">
              {homeScore}
              <span className="scoreboard__score-sep">—</span>
              {awayScore}
            </span>
          ) : (
            <span className="scoreboard__score scoreboard__score--pending">VS</span>
          )}
          {(live || status || detail) && (
            <span className="scoreboard__status">
              {live && <span className="scoreboard__status-dot" aria-hidden="true" />}
              {detail ?? matchLabels[status] ?? status}
            </span>
          )}
        </div>

        <div className="scoreboard__team scoreboard__team--away">
          <span className="scoreboard__team-tag">Visitante</span>
          <span className="scoreboard__team-name">{awayName}</span>
        </div>
      </div>
    </div>
  )
}
