function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="white" opacity="0.96" />
      <path
        d="M12 6.4l2.7 1.95-1.04 3.15h-3.32L9.3 8.35 12 6.4Z"
        fill="#3b82f6"
      />
      <path
        d="M6.6 9.1l2.45 1.78-1.04 3.15M17.4 9.1l-2.45 1.78 1.04 3.15"
        stroke="#3b82f6"
        strokeWidth="1.1"
        fill="none"
      />
      <path
        d="M12 18.2l-2.6-1.9 1.06-3.15h3.08L14.6 16.3 12 18.2Z"
        fill="#3b82f6"
      />
    </svg>
  )
}

export { BrandMark }

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__hero">
        <div className="auth__brand">
          <span className="auth__brand-mark">
            <BrandMark />
          </span>
          Torneos UNAL · La Nubia
        </div>

        <div className="auth__hero-body">
          <span className="auth__eyebrow">
            Fútbol 5 · Fútbol 11
          </span>
          <h1 className="auth__hero-title">
            Donde cada <em>partido</em>
            <br />
            define la <em>gloria</em>.
          </h1>
          <p className="auth__hero-text">
            La plataforma oficial de torneos universitarios de la UNAL
            La Nubia. Sigue partidos en vivo, consulta estadísticas
            y gestiona equipos en cada jornada.
          </p>
        </div>

        <div className="auth__season">
          <span className="auth__live-dot" aria-hidden="true" />
          Jornada en curso · Temporada 2026
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__card auth__enter">{children}</div>
      </main>
    </div>
  )
}