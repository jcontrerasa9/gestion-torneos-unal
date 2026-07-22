import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import {
  fetchPublicMatches,
  fetchPublicScorers,
  fetchPublicStandings,
  fetchPublicTournaments,
} from '../../api/public'
import { itemsOf } from '../../api/helpers'
import ScoreBoard from '../../components/ui/ScoreBoard'
import EmptyState from '../../components/ui/EmptyState'
import MatchCard from '../../components/matches/MatchCard'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import { BallIcon, CalendarIcon, TableIcon, TrophyIcon } from '../../components/icons'

const TTL = 60_000

function pickFeaturedTournament(tournaments) {
  return (
    tournaments.find((t) => t.status === 'en_curso') ?? tournaments[0] ?? null
  )
}

function pickHeroMatch(matches) {
  const live = matches.find((m) => m.status === 'en_juego')
  if (live) return live
  const upcoming = matches
    .filter((m) => m.status === 'programado')
    .sort((a, b) =>
      `${a.match_date}T${a.match_time}`.localeCompare(
        `${b.match_date}T${b.match_time}`,
      ),
    )
  if (upcoming.length) return upcoming[0]
  const finished = matches
    .filter((m) => m.status === 'finalizado')
    .sort((a, b) =>
      `${b.match_date}T${b.match_time}`.localeCompare(
        `${a.match_date}T${a.match_time}`,
      ),
    )
  return finished[0] ?? null
}

export default function Landing() {
  const { data: tournamentsRes, status: tournamentsStatus } = useFetch(
    'public:tournaments',
    fetchPublicTournaments,
    { ttl: TTL },
  )
  const tournaments = useMemo(
    () => itemsOf(tournamentsRes),
    [tournamentsRes],
  )
  const featured = useMemo(
    () => pickFeaturedTournament(tournaments),
    [tournaments],
  )

  const { data: matchesRes } = useFetch(
    'public:matches',
    fetchPublicMatches,
    { ttl: TTL },
  )
  const matches = useMemo(() => itemsOf(matchesRes), [matchesRes])

  const featuredMatches = useMemo(
    () =>
      featured
        ? matches.filter((m) => m.tournament_id === featured.id)
        : matches,
    [matches, featured],
  )
  const heroMatch = useMemo(
    () => pickHeroMatch(featuredMatches.length ? featuredMatches : matches),
    [featuredMatches, matches],
  )
  const upcoming = useMemo(
    () =>
      (featuredMatches.length ? featuredMatches : matches)
        .filter((m) => m.status === 'programado')
        .sort((a, b) =>
          `${a.match_date}T${a.match_time}`.localeCompare(
            `${b.match_date}T${b.match_time}`,
          ),
        )
        .slice(0, 3),
    [featuredMatches, matches],
  )

  const { data: standingsRes } = useFetch(
    featured ? `public:standings:${featured.id}` : null,
    () => fetchPublicStandings(featured.id),
    { ttl: TTL },
  )
  const standings = standingsRes?.data ?? []

  const { data: scorersRes } = useFetch(
    featured ? `public:scorers:${featured.id}` : null,
    () => fetchPublicScorers(featured.id),
    { ttl: TTL },
  )
  const scorers = scorersRes?.data ?? []

  if (tournamentsStatus === 'loading') {
    return (
      <>
        <section className="hero">
          <div className="hero__inner">
            <div>
              <p className="hero__eyebrow">Fútbol universitario</p>
              <h1 className="hero__title">
                La cancha <em>te espera</em>
              </h1>
            </div>
          </div>
        </section>
        <section className="section">
          <CardsSkeleton count={3} />
        </section>
      </>
    )
  }

  if (!featured) {
    return (
      <section className="section">
        <EmptyState
          icon={TrophyIcon}
          title="No hay torneos disponibles"
          text="Cuando se publique un torneo, aquí encontrarás sus posiciones, goleadores y calendario."
        />
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <div>
            <p className="hero__eyebrow">UNAL Sede La Nubia</p>
            <h1 className="hero__title">
              Vive el torneo <em>minuto a minuto</em>
            </h1>
            <p className="hero__sub">
              Posiciones, goleadores y calendario de los torneos de fútbol 5 y
              fútbol 11 de la Universidad Nacional, actualizados tras cada
              resultado.
            </p>
            <div className="hero__actions">
              <Link to={`/t/${featured.id}/posiciones`} className="btn btn--primary">
                Ver posiciones
              </Link>
              <Link to={`/t/${featured.id}/calendario`} className="btn btn--ghost">
                Calendario
              </Link>
            </div>
          </div>

          {heroMatch && (
            <div className="hero__board">
              <p className="hero__board-label">
                {heroMatch.status === 'en_juego'
                  ? 'En juego ahora'
                  : heroMatch.status === 'programado'
                    ? 'Próximo partido'
                    : 'Último resultado'}
                {' · '}
                {featured.name}
              </p>
              <ScoreBoard
                homeName={heroMatch.home_team?.name}
                awayName={heroMatch.away_team?.name}
                homeScore={heroMatch.home_score}
                awayScore={heroMatch.away_score}
                status={heroMatch.status}
              />
            </div>
          )}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="section" aria-labelledby="upcoming-title">
          <div className="section__head">
            <h2 className="section__title" id="upcoming-title">
              <CalendarIcon />
              Próximos partidos
            </h2>
            <Link to={`/t/${featured.id}/calendario`} className="section__link">
              Calendario completo →
            </Link>
          </div>
          <div className="match-cards">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="tables-title">
        <div className="section__head">
          <h2 className="section__title" id="tables-title">
            <TableIcon />
            {featured.name}
          </h2>
        </div>
        <div className="landing__grid">
          <div>
            <div className="section__head">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Posiciones</h3>
              <Link to={`/t/${featured.id}/posiciones`} className="section__link">
                Ver tabla →
              </Link>
            </div>
            {standings.length === 0 ? (
              <div className="mini-list">
                <p className="mini-list__row" style={{ color: 'var(--ink-muted)' }}>
                  Aún no hay resultados registrados.
                </p>
              </div>
            ) : (
              <div className="mini-list">
                {standings.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="mini-list__row">
                    <span className={`mini-list__pos ${i === 0 ? 'mini-list__pos--1' : ''}`}>
                      {i + 1}
                    </span>
                    <span className="mini-list__name">
                      {s.tournament_team?.team?.name ?? '—'}
                    </span>
                    <span className="mini-list__value">{s.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="section__head">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                <BallIcon width={16} height={16} style={{ display: 'inline', verticalAlign: '-3px' }} />{' '}
                Goleadores
              </h3>
              <Link to={`/t/${featured.id}/goleadores`} className="section__link">
                Ver todos →
              </Link>
            </div>
            {scorers.length === 0 ? (
              <div className="mini-list">
                <p className="mini-list__row" style={{ color: 'var(--ink-muted)' }}>
                  Aún no se registran goles.
                </p>
              </div>
            ) : (
              <div className="mini-list">
                {scorers.slice(0, 5).map((s, i) => (
                  <div key={s.player_id ?? i} className="mini-list__row">
                    <span className={`mini-list__pos ${i === 0 ? 'mini-list__pos--1' : ''}`}>
                      {i + 1}
                    </span>
                    <span className="mini-list__name">
                      {s.player
                        ? `${s.player.first_name} ${s.player.last_name}`
                        : '—'}
                    </span>
                    <span className="mini-list__value">{s.goals}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
