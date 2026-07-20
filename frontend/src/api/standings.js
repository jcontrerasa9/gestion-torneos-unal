import { api } from './client'

export async function list(tournamentId) {
  const path = tournamentId
    ? `/standings?tournament_id=${tournamentId}`
    : '/standings'
  return api.get(path)
}

export async function byTournament(tournamentId) {
  return api.get(`/standings/tournament/${tournamentId}`)
}