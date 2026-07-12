import { useAuth } from '../context/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <section id="dashboard">
      <h1>Torneos UNAL</h1>
      <p>
        Hola, <strong>{user.first_name} {user.last_name}</strong>
      </p>
      <p>
        Rol: <code>{user.role?.name ?? '—'}</code>
      </p>
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
    </section>
  )
}