import { api } from './client'

export async function list(tournamentId) {
  return api.get(`/scorers?tournament_id=${tournamentId}`)
}