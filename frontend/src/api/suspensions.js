import { api } from './client'

export async function list(page = 1, tournamentId) {
  let path = `/suspensions?page=${page}`
  if (tournamentId) path += `&tournament_id=${tournamentId}`
  return api.get(path)
}

export async function create(payload) {
  return api.post('/suspensions', payload)
}

export async function cancel(id) {
  return api.delete(`/suspensions/${id}`)
}