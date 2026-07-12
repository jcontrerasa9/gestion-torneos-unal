import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { AuthContext } from './authStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    setError(null)
    try {
      const u = await authApi.login(credentials)
      setUser(u)
      return u
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    try {
      const u = await authApi.register(payload)
      setUser(u)
      return u
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout }),
    [user, loading, error, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}