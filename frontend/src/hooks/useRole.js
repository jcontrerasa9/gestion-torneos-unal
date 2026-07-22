import { useAuth } from '../context/useAuth'

/**
 * Rol del usuario autenticado, centralizado.
 * @returns {{ role: string|null, isAdmin: bool, isCaptain: bool, isReferee: bool, isPlayer: bool }}
 */
export function useRole() {
  const { user } = useAuth()
  const role = user?.role?.name ?? null
  return {
    role,
    isAdmin: role === 'admin',
    isCaptain: role === 'captain',
    isReferee: role === 'referee',
    isPlayer: role === 'player',
  }
}
