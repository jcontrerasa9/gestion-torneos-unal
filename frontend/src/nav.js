import { CalendarIcon, CheckIcon, ShieldIcon, TrophyIcon, UserIcon } from './components/icons'

export const navItems = [
  { key: 'tournaments', label: 'Torneos', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'teams', label: 'Equipos', icon: ShieldIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'matches', label: 'Partidos', icon: CalendarIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'standings', label: 'Posiciones', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'scorers', label: 'Goleadores', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'match-events', label: 'Eventos', icon: CalendarIcon, roles: ['admin', 'referee'] },
  { key: 'enrollment', label: 'Inscripciones', icon: CheckIcon, roles: ['admin', 'captain'] },
  { key: 'player-requests', label: 'Solicitudes', icon: UserIcon, roles: ['admin', 'captain', 'player'] },
]

export function filterNavForRole(roleName) {
  return navItems.filter((item) => item.roles.includes(roleName))
}