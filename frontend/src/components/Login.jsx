import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import AuthLayout from './auth/AuthLayout'
import FormField from './ui/FormField'
import SubmitButton from './ui/SubmitButton'
import { AlertIcon } from './icons'

export default function Login({ onSwitch }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ email, password })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <header className="auth__head">
        <h1 className="auth__title">Ingresar al campo</h1>
        <p className="auth__subtitle">
          Accede con tus credenciales y entra al terreno de juego.
        </p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Correo institucional"
          name="email"
          type="email"
          iconType="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@unal.edu.co"
          autoComplete="email"
          required
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          iconType="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="auth__error" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}

        <SubmitButton loading={submitting}>Ingresar</SubmitButton>
      </form>

      <p className="auth__foot">
        ¿No tienes cuenta?
        <button
          type="button"
          className="auth__switch"
          onClick={() => onSwitch?.('register')}
        >
          Créala en un toque
        </button>
      </p>
    </AuthLayout>
  )
}