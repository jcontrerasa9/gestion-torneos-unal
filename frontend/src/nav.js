import { CalendarIcon, TrophyIcon } from './components/icons'

export const navItems = [
  { key: 'tournaments', label: 'Torneos', icon: TrophyIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'] },
  { key: 'calendar', label: 'Calendario', icon: CalendarIcon, roles: ['admin', 'captain', 'player', 'referee', 'student'], comingSoon: true },
]

export function filterNavForRole(roleName) {
  return navItems.filter((item) => item.roles.includes(roleName))
}