import { api, setToken, getToken } from './client'

export async function register(payload) {
  const data = await api.post('/register', payload, { auth: false })
  setToken(data.token)
  return data.user
}

export async function login(payload) {
  const data = await api.post('/login', payload, { auth: false })
  setToken(data.token)
  return data.user
}

export async function logout() {
  try {
    await api.post('/logout')
  } finally {
    setToken(null)
  }
}

export async function fetchMe() {
  if (!getToken()) return null
  return api.get('/me')
}