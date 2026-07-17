export default function MatchesPage() {
  return (
    <>
      <header className="page__head">
        <div className="page__title-block">
          <h1 className="page__title">Partidos</h1>
          <p className="page__subtitle">
            Programa y gestiona los encuentros de cada torneo de la UNAL La Nubia.
          </p>
        </div>
      </header>

      <section className="empty">
        <span className="empty__mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="24" height="24">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
          </svg>
        </span>
        <h2 className="empty__title">Cargando…</h2>
        <p className="empty__text">
          Pronto verás aquí el calendario de partidos con sus resultados.
        </p>
      </section>
    </>
  )
}