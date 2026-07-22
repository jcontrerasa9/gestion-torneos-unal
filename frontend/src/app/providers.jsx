import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/useAuth'
import { setForbiddenHandler, setUnauthorizedHandler } from '../api/client'
import { ToastProvider, useToast } from '../components/ui/Toast'

/**
 * Puente entre el cliente API y React: cuando un request autenticado
 * responde 401 (token expirado/inválido), se cierra la sesión y se
 * redirige a login conservando el destino (SE-2).
 */
function SessionBridge() {
  const { expireSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      expireSession()
      const inApp = location.pathname.startsWith('/app')
      if (inApp) {
        toast.info('Tu sesión expiró. Inicia sesión de nuevo.')
        const next = encodeURIComponent(location.pathname + location.search)
        navigate(`/login?expired=1&next=${next}`, { replace: true })
      }
    })
    setForbiddenHandler(() => {
      toast.error('No tienes permisos para realizar esta acción.')
    })
    return () => {
      setUnauthorizedHandler(null)
      setForbiddenHandler(null)
    }
  }, [expireSession, navigate, location, toast])

  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function RootProviders() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SessionBridge />
        <ScrollToTop />
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  )
}
