import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AlertIcon, CheckIcon, InfoIcon } from '../icons'

const ToastContext = createContext(null)

let toastId = 0

const ICONS = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = ++toastId
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      timers.current.set(id, setTimeout(() => dismiss(id), 4200))
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (msg) => push('success', msg),
      error: (msg) => push('error', msg),
      info: (msg) => push('info', msg),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? InfoIcon
          return (
            <div
              key={t.id}
              className={`toast toast--${t.type}`}
              onClick={() => dismiss(t.id)}
            >
              <Icon />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
