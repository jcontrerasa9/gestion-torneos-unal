import PageHeader from '../../components/ui/PageHeader'
import { EnrollmentsPanel } from '../../components/enrollment/EnrollmentsPanel'

export default function EnrollmentsPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Gestión"
        title="Inscripciones"
        subtitle="Solicitudes de los equipos para participar en los torneos de la universidad."
      />
      <EnrollmentsPanel />
    </div>
  )
}
