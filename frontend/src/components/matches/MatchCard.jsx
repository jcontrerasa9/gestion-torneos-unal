import { Link } from 'react-router-dom'
import ScoreBoard from '../ui/ScoreBoard'
import { formatDate, formatTime, matchLabels } from '../../utils/format'

/**
 * Tarjeta de partido con ScoreBoard compacto.
 * `to` opcional: envuelve la tarjeta en un enlace.
 */
export default function MatchCard({ match, to }) {
  const isPlayed = match.home_score != null && match.away_score != null
  const detail =
    match.status === 'programado'
      ? `${formatDate(match.match_date)} · ${formatTime(match.match_time)}`
      : matchLabels[match.status] ?? match.status

  const board = (
    <ScoreBoard
      size="compact"
      homeName={match.home_team?.name}
      awayName={match.away_team?.name}
      homeScore={match.home_score}
      awayScore={match.away_score}
      status={match.status}
      detail={detail}
    />
  )

  const meta = (
    <div className="match-card__meta">
      <span>{match.tournament?.name ?? 'Torneo'}</span>
      <span>
        {isPlayed || match.status === 'en_juego'
          ? formatDate(match.match_date)
          : `${formatDate(match.match_date)} · ${formatTime(match.match_time)}`}
      </span>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="match-card">
        {meta}
        {board}
      </Link>
    )
  }

  return (
    <article className="match-card">
      {meta}
      {board}
    </article>
  )
}
