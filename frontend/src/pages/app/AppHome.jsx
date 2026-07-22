import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/useAuth'
import { useRole } from '../../hooks/useRole'
import MatchCard from '../../components/matches/MatchCard'
import PageHeader from '../../components/ui/PageHeader'
import { CardsSkeleton } from '../../components/ui/TableSkeleton'
import {
  CalendarIcon,
  CheckIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
  WhistleIcon,
} from '../../components/icons'

const todayISO = () => new Date().toISOString().slice(0, 10)

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}

function QuickAction({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="tournament-card" style={{ gap: 8 }}>
      <span className="stat-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <div>
        <strong style={{ display: 'block', fontSize: 15 }}>{title}</strong>
        <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{text}</span>
      </div>
    </Link>
  )
}

export default function AppHome() {
  const { user } = useAuth()
  const { isAdmin, isCaptain, isReferee, isPlayer } = useRole()

  const { data: tournamentsRes } = useFetch(
    'app:tournaments',
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )
  const tournaments = itemsOf(tournamentsRes)

  const { data: matchesRes, status: matchesStatus } = useFetch(
    'app:matches',
    () => listAll('/tournament-matches'),
    { ttl: 30_000 },
  )
  const matches = itemsOf(matchesRes)

  const { data: requestsRes } = useFetch(
    isAdmin || isCaptain ? 'app:requests' : null,
    () => listAll('/player-requests'),
    { ttl: 30_000 },
  )
  const pendingRequests = itemsOf(requestsRes).filter(
    (r) => r.status === 'pendiente',
  )

  const { data: enrollmentsRes } = useFetch(
    isAdmin || isCaptain ? 'app:enrollments' : null,
    () => listAll('/tournament-teams'),
    { ttl: 30_000 },
  )
  const pendingEnrollments = itemsOf(enrollmentsRes).filter(
    (e) => e.status === 'pendiente',
  )

  const upcoming = useMemo(
    () =>
      matches
        .filter((m) => m.status === 'programado')
        .sort((a, b) =>
          `${a.match_date}T${a.match_time ?? ''}`.localeCompare(
            `${b.match_date}T${b.match_time ?? ''}`,
          ),
        )
        .slice(0, 3),
    [matches],
  )
  const todayMatches = matches.filter(
    (m) => m.match_date?.slice(0, 10) === todayISO(),
  )
  const activeTournaments = tournaments.filter((t) => t.status === 'en_curso')

  return (
    <div className="page">
      <PageHeader
        eyebrow="Panel"
        title={`Hola, ${user.first_name}`}
        subtitle="Esto es lo que está pasando en los torneos."
      />

      {isAdmin && (
        <div className="stat-grid">
          <StatCard
            icon={TrophyIcon}
            value={activeTournaments.length}
            label="Torneos en curso"
          />
          <StatCard
            icon={CalendarIcon}
            value={todayMatches.length}
            label="Partidos de hoy"
          />
          <StatCard
            icon={UserIcon}
            value={pendingRequests.length}
            label="Solicitudes de jugadores pendientes"
          />
          <StatCard
            icon={CheckIcon}
            value={pendingEnrollments.length}
            label="Inscripciones por aprobar"
          />
        </div>
      )}

      <div className="home-grid">
        <section className="panel" aria-label="Próximos partidos">
          <div className="panel__head">
            <h2 className="panel__title">Próximos partidos</h2>
            <Link to="/app/partidos" className="section__link">
              Ver todos →
            </Link>
          </div>
          <div className="panel__body">
            {matchesStatus === 'loading' && <CardsSkeleton count={2} />}
            {matchesStatus === 'ready' && upcoming.length === 0 && (
              <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
                No hay partidos programados próximamente.
              </p>
            )}
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>

        <section aria-label="Accesos rápidos" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isAdmin && (
            <>
              <QuickAction to="/app/torneos" icon={TrophyIcon} title="Gestionar torneos" text="Crea y administra las competiciones" />
              <QuickAction to="/app/inscripciones" icon={CheckIcon} title="Revisar inscripciones" text={`${pendingEnrollments.length} pendientes por aprobar`} />
              <QuickAction to="/app/solicitudes" icon={UserIcon} title="Solicitudes de jugadores" text={`${pendingRequests.length} pendientes por revisar`} />
            </>
          )}
          {isCaptain && (
            <>
              <QuickAction to="/app/equipos" icon={ShieldIcon} title="Mis equipos" text="Crea equipos y gestiona sus plantillas" />
              <QuickAction to="/app/inscripciones" icon={CheckIcon} title="Inscripciones a torneos" text="Inscribe tu equipo en un torneo" />
              <QuickAction to="/app/solicitudes" icon={UserIcon} title="Solicitudes de jugadores" text={`${pendingRequests.length} pendientes por revisar`} />
            </>
          )}
          {isReferee && (
            <QuickAction to="/app/arbitraje" icon={WhistleIcon} title="Mis partidos" text="Registra goles y resultados finales" />
          )}
          {isPlayer && (
            <QuickAction to="/app/solicitudes" icon={UserIcon} title="Mis solicitudes" text="Solicita unirte a un equipo" />
          )}
          {!isAdmin && !isCaptain && !isReferee && !isPlayer && (
            <QuickAction to="/app/torneos" icon={TrophyIcon} title="Explorar torneos" text="Consulta posiciones, goleadores y calendario" />
          )}
        </section>
      </div>
    </div>
  )
}
