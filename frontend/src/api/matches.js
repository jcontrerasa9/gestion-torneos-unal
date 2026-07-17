import { api } from './client'

const RESOURCE = '/tournament-matches'

export async function list(page = 1) {
  return api.get(`${RESOURCE}?page=${page}`)
}

export async function show(id) {
  return api.get(`${RESOURCE}/${id}`)
}

export async function create(payload) {
  return api.post(RESOURCE, payload)
}

export async function update(id, payload) {
  return api.put(`${RESOURCE}/${id}`, payload)
}

export async function remove(id) {
  return api.delete(`${RESOURCE}/${id}`)
}

export async function updateResults(id, payload) {
  return api.patch(`${RESOURCE}/${id}/results`, payload)
}