import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootProviders from './providers'
import PublicLayout from '../layouts/PublicLayout'
import AppLayout from '../layouts/AppLayout'
import { RequireAuth, RequireRole } from '../layouts/guards'

import Landing from '../pages/public/Landing'
import PublicTournaments from '../pages/public/PublicTournaments'
import TournamentPublic from '../pages/public/TournamentPublic'
import PublicStandings from '../pages/public/PublicStandings'
import PublicScorers from '../pages/public/PublicScorers'
import PublicSchedule from '../pages/public/PublicSchedule'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'

import AppHome from '../pages/app/AppHome'
import TournamentsPage from '../pages/app/TournamentsPage'
import TournamentDetailPage from '../pages/app/TournamentDetailPage'
import MatchesPage from '../pages/app/MatchesPage'
import TeamsPage from '../pages/app/TeamsPage'
import TeamDetailPage from '../pages/app/TeamDetailPage'
import EnrollmentsPage from '../pages/app/EnrollmentsPage'
import RequestsPage from '../pages/app/RequestsPage'
import RefereeMatchesPage from '../pages/app/RefereeMatchesPage'
import MatchRoomPage from '../pages/app/MatchRoomPage'
import EventsPage from '../pages/app/EventsPage'
import SuspensionsPage from '../pages/app/SuspensionsPage'
import NotFoundPage from '../pages/app/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/torneos', element: <PublicTournaments /> },
          {
            path: '/t/:id',
            element: <TournamentPublic />,
            children: [
              { index: true, element: <Navigate to="posiciones" replace /> },
              { path: 'posiciones', element: <PublicStandings /> },
              { path: 'goleadores', element: <PublicScorers /> },
              { path: 'calendario', element: <PublicSchedule /> },
            ],
          },
          { path: '/login', element: <LoginPage /> },
          { path: '/registro', element: <RegisterPage /> },
        ],
      },
      {
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          { path: '/app', element: <AppHome /> },
          { path: '/app/torneos', element: <TournamentsPage /> },
          { path: '/app/torneos/:id', element: <TournamentDetailPage /> },
          { path: '/app/partidos', element: <MatchesPage /> },
          { path: '/app/equipos', element: <TeamsPage /> },
          { path: '/app/equipos/:id', element: <TeamDetailPage /> },
          {
            path: '/app/inscripciones',
            element: (
              <RequireRole roles={['admin', 'captain']}>
                <EnrollmentsPage />
              </RequireRole>
            ),
          },
          {
            path: '/app/solicitudes',
            element: (
              <RequireRole roles={['admin', 'captain', 'player']}>
                <RequestsPage />
              </RequireRole>
            ),
          },
          {
            path: '/app/arbitraje',
            element: (
              <RequireRole roles={['referee']}>
                <RefereeMatchesPage />
              </RequireRole>
            ),
          },
          {
            path: '/app/arbitraje/:matchId',
            element: (
              <RequireRole roles={['referee']}>
                <MatchRoomPage />
              </RequireRole>
            ),
          },
          {
            path: '/app/eventos',
            element: (
              <RequireRole roles={['admin']}>
                <EventsPage />
              </RequireRole>
            ),
          },
          {
            path: '/app/sanciones',
            element: (
              <RequireRole roles={['admin']}>
                <SuspensionsPage />
              </RequireRole>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
