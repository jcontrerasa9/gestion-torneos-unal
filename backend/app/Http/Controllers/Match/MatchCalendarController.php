<?php

namespace App\Http\Controllers\Match;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Services\CalendarFeedService;
use Illuminate\Http\Response;

class MatchCalendarController extends Controller
{
    public function __construct(
        private CalendarFeedService $calendarFeedService,
    ) {}

    public function index(): Response
    {
        $ics = $this->calendarFeedService->forAllTournaments();

        return $this->icsResponse($ics, 'todos-los-partidos');
    }

    public function show(Tournament $tournament): Response
    {
        $ics = $this->calendarFeedService->forTournament($tournament);

        return $this->icsResponse($ics, 'torneo-'.$tournament->id);
    }

    protected function icsResponse(string $ics, string $filename): Response
    {
        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="'.$filename.'.ics"',
            'Cache-Control' => 'public, max-age=900',
        ]);
    }
}
