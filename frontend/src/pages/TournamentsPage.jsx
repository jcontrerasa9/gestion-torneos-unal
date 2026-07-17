import { CalendarIcon, PlusIcon } from '../components/icons'
import { useAuth } from '../context/useAuth'

export default function TournamentsPage() {
  const { user } = useAuth()
  const canManage = user.role?.name === 'admin'

  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Torneos</h1>
          <p className="page__subtitle">
            Gestiona los campeonatos de Fútbol 5 y Fútbol 11 de la UNAL La Nubia.
          </p>
        </div>
        {canManage && (
          <div className="page__actions">
            <button type="button" className="btn btn--primary" disabled>
              <span className="btn__content">
                <PlusIcon />
                Nuevo torneo
              </span>
            </button>
          </div>
        )}
      </header>

      <section className="empty">
        <span className="empty__mark">
          <CalendarIcon />
        </span>
        <h2 className="empty__title">Cargando…</h2>
        <p className="empty__text">
          Pronto verás aquí la lista de torneos inscritos en la plataforma.
        </p>
      </section>
    </>
  )
}