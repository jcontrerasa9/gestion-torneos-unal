/**
 * Caché SWR ligera en memoria.
 *
 * - `dedupe` evita requests duplicados en vuelo para la misma key.
 * - `invalidate(prefijo)` borra entradas y notifica a los `useFetch`
 *   suscritos para revalidar.
 * - Sin persistencia: la caché vive mientras la pestaña esté abierta.
 */

const entries = new Map() // key -> { data, ts }
const inflight = new Map() // key -> Promise
const listeners = new Set()

export function readCache(key, ttl) {
  const entry = entries.get(key)
  if (!entry) return null
  return { data: entry.data, fresh: Date.now() - entry.ts < ttl }
}

export function writeCache(key, data) {
  entries.set(key, { data, ts: Date.now() })
}

export function invalidate(prefix) {
  for (const key of [...entries.keys()]) {
    if (key.startsWith(prefix)) entries.delete(key)
  }
  listeners.forEach((listener) => listener(prefix))
}

export function subscribeInvalidation(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function dedupe(key, fetcher) {
  if (inflight.has(key)) return inflight.get(key)
  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      writeCache(key, data)
      return data
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}
