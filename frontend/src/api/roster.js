import { api } from './client'

export async function list(page = 1) {
  return api.get(`/tournament-team-players?page=${page}`)
}

export async function toggleActive(id) {
  return api.patch(`/tournament-team-players/${id}/toggle-status`)
}

export async function remove(id) {
  return api.delete(`/tournament-team-players/${id}`)
}