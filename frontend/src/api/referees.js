import { api } from './client'

export async function list() {
  return api.get('/referees')
}