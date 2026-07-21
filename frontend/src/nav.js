import { AlertIcon, CalendarIcon, CheckIcon, ShieldIcon, TrophyIcon, UserIcon } from './components/icons'

export const navItems = [
  { key: 'tournaments', label: 'Torneos', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], row: 'primary' },
  { key: 'teams', label: 'Equipos', icon: ShieldIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], row: 'primary' },
  { key: 'matches', label: 'Partidos', icon: CalendarIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], row: 'primary' },
  { key: 'standings', label: 'Posiciones', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], row: 'primary' },
  { key: 'scorers', label: 'Goleadores', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], row: 'primary' },
  { key: 'roster', label: 'Plantilla', icon: UserIcon, roles: ['admin', 'captain', 'player'], row: 'secondary' },
  { key: 'match-events', label: 'Eventos', icon: CalendarIcon, roles: ['admin', 'referee'], row: 'secondary' },
  { key: 'suspensions', label: 'Sanciones', icon: AlertIcon, roles: ['admin'], row: 'secondary' },
  { key: 'enrollment', label: 'Inscripciones', icon: CheckIcon, roles: ['admin', 'captain'], row: 'secondary' },
  { key: 'player-requests', label: 'Solicitudes', icon: UserIcon, roles: ['admin', 'captain', 'player'], row: 'secondary' },
]

export function filterNavForRole(roleName) {
  return navItems.filter((item) => item.roles.includes(roleName))
}

export function navByRow(roleName) {
  const filtered = filterNavForRole(roleName)
  return {
    primary: filtered.filter((i) => i.row === 'primary'),
    secondary: filtered.filter((i) => i.row === 'secondary'),
  }
}