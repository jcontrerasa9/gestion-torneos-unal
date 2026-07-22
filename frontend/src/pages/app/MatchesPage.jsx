import PageHeader from '../../components/ui/PageHeader'
import CalendarSubscription from '../../components/matches/CalendarSubscription'
import { MatchesPanel } from '../../components/matches/MatchesPanel'

export default function MatchesPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Calendario"
        title="Partidos"
        subtitle="Programación de los encuentros de todos los torneos: horarios, árbitros y resultados."
        actions={<CalendarSubscription />}
      />
      <MatchesPanel />
    </div>
  )
}
