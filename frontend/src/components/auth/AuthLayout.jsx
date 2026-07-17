import HeroBall from './HeroBall'
import soccerIllustration from '../../assets/Soccer-bro.svg'

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__hero">
        <div className="auth__brand">
          <span className="auth__brand-mark">
            <HeroBall width={20} height={20} />
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

        <img
          className="auth__hero-illustration"
          src={soccerIllustration}
          alt=""
          role="presentation"
        />
      </aside>

      <main className="auth__panel">
        <div className="auth__card auth__enter">{children}</div>
      </main>
    </div>
  )
}