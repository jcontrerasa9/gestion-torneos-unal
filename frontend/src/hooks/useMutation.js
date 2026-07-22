import { useCallback, useState } from 'react'
import { invalidate } from '../api/cache'
import { useToast } from '../components/ui/Toast'

/**
 * Wrapper para mutaciones: estado busy/error, invalidación de caché
 * por prefijos y toast automático de éxito.
 */
export function useMutation(
  fn,
  { invalidate: prefixes = [], successMessage, onSuccess } = {},
) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const run = useCallback(
    async (...args) => {
      setBusy(true)
      setError(null)
      try {
        const result = await fn(...args)
        prefixes.forEach((prefix) => invalidate(prefix))
        if (successMessage) toast.success(successMessage)
        onSuccess?.(result)
        return result
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setBusy(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, toast, ...prefixes],
  )

  return { run, busy, error, setError }
}
