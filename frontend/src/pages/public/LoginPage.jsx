import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import AuthShell, { fieldErrors } from './AuthShell'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { AlertIcon, InfoIcon } from '../../components/icons'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const expired = params.get('expired') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setErrors({})
    try {
      await login({ email, password })
      const next = params.get('next')
      navigate(next && next.startsWith('/') ? next : '/app', { replace: true })
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(err.data?.errors ? null : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <header>
        <h1 className="auth__title">Iniciar sesión</h1>
        <p className="auth__subtitle">
          Accede con tu correo institucional para gestionar tus torneos.
        </p>
      </header>

      {expired && (
        <div className="auth__notice" role="status">
          <InfoIcon />
          Tu sesión expiró. Inicia sesión de nuevo para continuar.
        </div>
      )}

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Correo institucional"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@unal.edu.co"
          autoComplete="email"
          error={errors.email}
          required
        />
        <Field
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        {error && (
          <div className="form-error-banner" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}

        <Button type="submit" busy={submitting} className="btn--block">
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="auth__switch">
          Regístrate aquí
        </Link>
      </p>
    </AuthShell>
  )
}
