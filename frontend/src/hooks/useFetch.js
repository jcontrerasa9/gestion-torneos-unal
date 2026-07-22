import { useCallback, useEffect, useRef, useState } from 'react'
import {
  dedupe,
  readCache,
  subscribeInvalidation,
} from '../api/cache'

/**
 * Fetch con stale-while-revalidate sobre la caché en memoria.
 *
 * @param {string|null} key  Key de caché (null deshabilita el fetch).
 * @param {() => Promise<any>} fetcher
 * @param {{ ttl?: number, enabled?: boolean }} options
 * @returns {{ data: any, error: Error|null, status: 'idle'|'loading'|'ready'|'error', refetch: () => void }}
 */
export function useFetch(key, fetcher, { ttl = 30_000, enabled = true } = {}) {
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const initial = key ? readCache(key, ttl) : null
  const [state, setState] = useState({
    data: initial?.data ?? null,
    error: null,
    status: initial ? 'ready' : key ? 'loading' : 'idle',
  })

  const run = useCallback(
    (background = false) => {
      if (!key || !enabled) return
      if (!background) {
        setState((s) => ({
          ...s,
          status: s.data ? s.status : 'loading',
          error: null,
        }))
      }
      dedupe(key, () => fetcherRef.current())
        .then((data) => setState({ data, error: null, status: 'ready' }))
        .catch((error) =>
          setState((s) => ({
            ...s,
            error,
            status: s.data ? 'ready' : 'error',
          })),
        )
    },
    [key, enabled],
  )

  useEffect(() => {
    if (!key || !enabled) {
      setState({ data: null, error: null, status: 'idle' })
      return
    }
    const cached = readCache(key, ttl)
    if (cached) {
      setState({ data: cached.data, error: null, status: 'ready' })
      if (!cached.fresh) run(true)
    } else {
      setState({ data: null, error: null, status: 'loading' })
      run()
    }
  }, [key, ttl, enabled, run])

  useEffect(
    () =>
      subscribeInvalidation((prefix) => {
        if (key && key.startsWith(prefix)) run(true)
      }),
    [key, run],
  )

  return { ...state, refetch: () => run() }
}
