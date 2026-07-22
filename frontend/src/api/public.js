import { api } from './client'
import { listAll } from './helpers'

/**
 * Endpoints públicos (sin token). El backend debe exponer estas rutas
 * fuera de `auth:sanctum`; mientras tanto, las páginas públicas manejan
 * el 401 con un estado informativo.
 */

export function fetchPublicTournaments() {
  return listAll('/tournaments', { auth: false })
}

export function fetchPublicTournament(id) {
  return api.get(`/tournaments/${id}`, { auth: false })
}

export function fetchPublicStandings(tournamentId) {
  return api.get(`/standings/tournament/${tournamentId}`, { auth: false })
}

export function fetchPublicScorers(tournamentId) {
  return api.get(`/scorers?tournament_id=${tournamentId}`, { auth: false })
}

export function fetchPublicMatches() {
  return listAll('/tournament-matches', { auth: false })
}
