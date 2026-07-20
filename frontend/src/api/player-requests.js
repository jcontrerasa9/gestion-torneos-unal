import { api } from './client'

const RESOURCE = '/player-requests'

export async function list(page = 1) {
  return api.get(`${RESOURCE}?page=${page}`)
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