import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import AuthLayout from './auth/AuthLayout'
import FormField from './auth/FormField'
import SubmitButton from './auth/SubmitButton'
import { AlertIcon, InfoIcon } from './icons'

export default function Register({ onSwitch }) {
  const { register } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="register">
      <header className="auth__head">
        <h1 className="auth__title">Crear cuenta</h1>
        <p className="auth__subtitle">
          Únete como espectador y sigue los torneos universitarios en tiempo
          real.
        </p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="auth__row">
          <FormField
            label="Nombre"
            name="first_name"
            type="text"
            iconType="name"
            value={form.first_name}
            onChange={update('first_name')}
            placeholder="Juan"
            autoComplete="given-name"
            required
          />
          <FormField
            label="Apellido"
            name="last_name"
            type="text"
            iconType="name"
            value={form.last_name}
            onChange={update('last_name')}
            placeholder="Pérez"
            autoComplete="family-name"
            required
          />
        </div>

        <FormField
          label="Correo institucional"
          name="email"
          type="email"
          iconType="email"
          value={form.email}
          onChange={update('email')}
          placeholder="nombre@unal.edu.co"
          autoComplete="email"
          required
        />

        <FormField
          label="Teléfono"
          name="phone"
          type="tel"
          iconType="phone"
          value={form.phone}
          onChange={update('phone')}
          placeholder="300 000 0000"
          autoComplete="tel"
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          iconType="password"
          value={form.password}
          onChange={update('password')}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
        />

        {error && (
          <div className="auth__error" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}

        <SubmitButton loading={submitting}>Registrarme</SubmitButton>
      </form>

      <div className="auth__hint">
        <InfoIcon />
        El registro crea una cuenta con rol de estudiante. El capitán de tu
        equipo podrá invitarte a la plantilla más adelante.
      </div>

      <p className="auth__foot">
        ¿Ya tienes cuenta?
        <button
          type="button"
          className="auth__switch"
          onClick={() => onSwitch?.('login')}
        >
          Inicia sesión
        </button>
      </p>
    </AuthLayout>
  )
}