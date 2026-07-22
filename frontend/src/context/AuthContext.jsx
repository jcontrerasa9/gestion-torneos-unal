import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { AuthContext } from './authStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authApi
      .fetchMe()
      .then((u) => {
        if (active) setUser(u)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const u = await authApi.login(credentials)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const u = await authApi.register(payload)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  /** Llamado por el cliente API cuando el token expira o es inválido. */
  const expireSession = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, expireSession }),
    [user, loading, login, register, logout, expireSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
