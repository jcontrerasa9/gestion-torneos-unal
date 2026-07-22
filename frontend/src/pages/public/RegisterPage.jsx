import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import AuthShell, { fieldErrors } from './AuthShell'
import Field from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { AlertIcon, InfoIcon } from '../../components/icons'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setErrors({})
    try {
      await register(form)
      navigate('/app', { replace: true })
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
        <h1 className="auth__title">Crear cuenta</h1>
        <p className="auth__subtitle">
          Regístrate para seguir los torneos y formar parte de un equipo.
        </p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field
            label="Nombre"
            value={form.first_name}
            onChange={update('first_name')}
            placeholder="Juan"
            autoComplete="given-name"
            error={errors.first_name}
            required
          />
          <Field
            label="Apellido"
            value={form.last_name}
            onChange={update('last_name')}
            placeholder="Pérez"
            autoComplete="family-name"
            error={errors.last_name}
            required
          />
        </div>
        <Field
          label="Correo institucional"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="nombre@unal.edu.co"
          autoComplete="email"
          error={errors.email}
          required
        />
        <Field
          label="Teléfono"
          type="tel"
          value={form.phone}
          onChange={update('phone')}
          placeholder="300 000 0000 (opcional)"
          autoComplete="tel"
          error={errors.phone}
        />
        <Field
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={update('password')}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
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
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </Button>
      </form>

      <div className="auth__notice" role="note">
        <InfoIcon />
        El registro crea una cuenta con rol de estudiante. El capitán de tu
        equipo podrá invitarte a la plantilla más adelante.
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="auth__switch">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  )
}
