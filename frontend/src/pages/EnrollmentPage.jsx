import { CheckIcon } from '../components/icons'

export default function EnrollmentPage() {
  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Inscripciones</h1>
          <p className="page__subtitle">
            Inscribe equipos en los torneos y gestiona las solicitudes de participación.
          </p>
        </div>
      </header>

      <section className="empty">
        <span className="empty__mark">
          <CheckIcon />
        </span>
        <h2 className="empty__title">Cargando…</h2>
        <p className="empty__text">
          Aquí podrás ver las inscripciones de equipos a los torneos.
        </p>
      </section>
    </>
  )
}