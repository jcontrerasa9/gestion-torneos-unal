import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import { TrophyIcon } from '../../components/icons'

export default function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState
        icon={TrophyIcon}
        title="Página no encontrada"
        text="La ruta que buscas no existe o fue movida."
        action={
          <Link to="/app" className="btn btn--primary">
            Volver al inicio
          </Link>
        }
      />
    </div>
  )
}
