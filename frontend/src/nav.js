import {
  BanIcon,
  CalendarIcon,
  CheckIcon,
  FlagIcon,
  HomeIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
  WhistleIcon,
} from './components/icons'

const ALL = ['admin', 'captain', 'player', 'referee', 'student']

/**
 * Navegación de la app. `mobile: true` la fija en la bottom-bar;
 * el resto va al sheet "Más" en móvil y a la sidebar en desktop.
 */
export const appNav = [
  { to: '/app', label: 'Inicio', icon: HomeIcon, roles: ALL, end: true, mobile: true },
  { to: '/app/torneos', label: 'Torneos', icon: TrophyIcon, roles: ALL, mobile: true },
  { to: '/app/partidos', label: 'Partidos', icon: CalendarIcon, roles: ALL, mobile: true },
  { to: '/app/equipos', label: 'Equipos', icon: ShieldIcon, roles: ALL, mobile: true },
  { to: '/app/arbitraje', label: 'Arbitraje', icon: WhistleIcon, roles: ['referee'], mobile: true },
  { to: '/app/inscripciones', label: 'Inscripciones', icon: CheckIcon, roles: ['admin', 'captain'] },
  { to: '/app/solicitudes', label: 'Solicitudes', icon: UserIcon, roles: ['admin', 'captain', 'player'] },
  { to: '/app/eventos', label: 'Eventos', icon: FlagIcon, roles: ['admin'] },
  { to: '/app/sanciones', label: 'Sanciones', icon: BanIcon, roles: ['admin'] },
]

export function navForRole(role) {
  return appNav.filter((item) => item.roles.includes(role))
}
