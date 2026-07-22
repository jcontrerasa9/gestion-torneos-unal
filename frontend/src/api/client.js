const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Handler registrado por la capa de React (providers) para reaccionar
 * cuando el servidor rechaza el token (401): limpiar sesión y redirigir.
 */
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

/**
 * Handler para 403: el usuario está autenticado pero sin permisos.
 * NO cierra sesión; solo notifica a la capa de React (SE-2).
 */
let onForbidden = null
export function setForbiddenHandler(fn) {
  onForbidden = fn
}

async function request(
  path,
  { method = 'GET', body, auth = true, signal } = {},
) {
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (response.status === 401 && auth) {
    setToken(null)
    onUnauthorized?.()
  }

  if (response.status === 403) {
    onForbidden?.()
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message = data && data.message
    if (!message && response.status === 403) {
      message = 'No tienes permisos para realizar esta acción.'
    }
    const error = new Error(message || `Error de solicitud (${response.status})`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) =>
    request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
