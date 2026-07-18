import { ShieldIcon } from '../components/icons'

export default function TeamsPage() {
  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Equipos</h1>
          <p className="page__subtitle">
            Administra los equipos inscritos en los torneos de la UNAL La Nubia.
          </p>
        </div>
      </header>

      <section className="empty">
        <span className="empty__mark">
          <ShieldIcon />
        </span>
        <h2 className="empty__title">Cargando…</h2>
        <p className="empty__text">
          Pronto verás aquí la lista de equipos con sus capitanes.
        </p>
      </section>
    </>
  )
}