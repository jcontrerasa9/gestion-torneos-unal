import { api } from './client'

/**
 * Descarga todas las páginas de un endpoint paginado de Laravel
 * (forma `{ data: { data: [...], last_page } }`) y las concatena.
 * La primera página se pide sola; el resto en paralelo.
 *
 * Si el endpoint no es paginado, devuelve la respuesta tal cual.
 */
export async function listAll(path, { auth = true } = {}) {
  const sep = path.includes('?') ? '&' : '?'
  const first = await api.get(`${path}${sep}page=1`, { auth })
  const paginator = first?.data
  if (!paginator || !Array.isArray(paginator.data)) return first

  const lastPage = paginator.last_page ?? 1
  if (lastPage <= 1) return first

  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) =>
      api.get(`${path}${sep}page=${i + 2}`, { auth }),
    ),
  )
  const items = [
    ...paginator.data,
    ...rest.flatMap((r) => r?.data?.data ?? []),
  ]
  return { ...first, data: { ...paginator, data: items } }
}

/** Extrae el array de items de una respuesta paginada o plana. */
export function itemsOf(response) {
  const d = response?.data
  if (!d) return []
  if (Array.isArray(d)) return d
  if (Array.isArray(d.data)) return d.data
  return []
}
