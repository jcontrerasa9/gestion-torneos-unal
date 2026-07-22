export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <div>
          <h2 className="auth__aside-headline">
            La cancha <em>te espera</em>
          </h2>
          <p className="auth__aside-sub">
            Gestiona torneos, equipos, partidos y resultados del fútbol
            universitario de la UNAL Sede La Nubia desde un solo lugar.
          </p>
        </div>
        <p className="auth__aside-foot">
          Fútbol 5 · Fútbol 11 · Torneos intercursos
        </p>
      </aside>
      <div className="auth__panel">
        <div className="auth__card">{children}</div>
      </div>
    </div>
  )
}

/** Extrae errores por campo de una respuesta 422 de Laravel. */
export function fieldErrors(error) {
  const errors = error?.data?.errors
  if (!errors || typeof errors !== 'object') return {}
  return Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]),
  )
}
