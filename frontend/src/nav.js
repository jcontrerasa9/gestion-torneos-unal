import { CalendarIcon, ShieldIcon, TrophyIcon } from './components/icons'

export const navItems = [
  { key: 'tournaments', label: 'Torneos', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'teams', label: 'Equipos', icon: ShieldIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'matches', label: 'Partidos', icon: CalendarIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
]

export function filterNavForRole(roleName) {
  return navItems.filter((item) => item.roles.includes(roleName))
}