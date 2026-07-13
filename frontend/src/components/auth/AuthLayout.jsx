function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5l2.7 2.7-1 3.8 3.7 1 1 3.8-2.7 2.7-3.7-1-2.7 2.7-1-3.8-3.7-1 1-3.8 3.7-1z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M12 7.5l1.4 1.4-.5 1.9 1.9.5.5 1.9-1.4 1.4-1.9-.5-1.4 1.4-.5-1.9-1.9-.5.5-1.9 1.9-.5z"
        fill="#7c3aed"
      />
    </svg>
  )
}

export default function AuthLayout({ children, mode }) {
  const isLogin = mode === 'login'

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
            {isLogin ? 'Bienvenido de nuevo' : 'Únete a la competencia'}
          </span>
          <h1 className="auth__hero-title">
            Donde cada <em>partido</em>
            <br />
            define la <em>gloria</em>.
          </h1>
          <p className="auth__hero-text">
            Gestiona torneos de Fútbol 5 y Fútbol 11, sigue partidos en
            tiempo real y consulta tablas, estadísticas y sanciones de los
            campeonatos universitarios de la UNAL La Nubia.
          </p>
        </div>

        <div className="auth__stats">
          <div className="auth__stat">
            <span className="auth__stat-value">6</span>
            <span className="auth__stat-label">Roles</span>
          </div>
          <div className="auth__stat">
            <span className="auth__stat-value">2</span>
            <span className="auth__stat-label">Modalidades</span>
          </div>
          <div className="auth__stat">
            <span className="auth__stat-value">∞</span>
            <span className="auth__stat-label">Emoción</span>
          </div>
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__card auth__enter">{children}</div>
      </main>
    </div>
  )
}