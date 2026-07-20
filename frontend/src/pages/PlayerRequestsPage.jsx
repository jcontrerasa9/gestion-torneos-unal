import { UserIcon } from '../components/icons'

export default function PlayerRequestsPage() {
  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Solicitudes</h1>
          <p className="page__subtitle">
            Solicita ingreso a un equipo y consulta el estado de tus peticiones.
          </p>
        </div>
      </header>

      <section className="empty">
        <span className="empty__mark">
          <UserIcon />
        </span>
        <h2 className="empty__title">Cargando…</h2>
        <p className="empty__text">
          Aquí verás las solicitudes de ingreso a los equipos.
        </p>
      </section>
    </>
  )
}