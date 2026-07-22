<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Spatie\IcalendarGenerator\Components\Calendar;
use Spatie\IcalendarGenerator\Components\Event;
use Spatie\IcalendarGenerator\Enums\EventStatus;

class CalendarFeedService
{
    private const MATCH_DURATION_MINUTES = 90;

    private const REFRESH_INTERVAL_MINUTES = 60;

    private const TIMEZONE = 'America/Bogota';

    private const STATUS_MAP = [
        'programado' => EventStatus::Confirmed,
        'en_juego' => EventStatus::Confirmed,
        'finalizado' => EventStatus::Confirmed,
        'aplazado' => EventStatus::Cancelled,
    ];

    public function forTournament(Tournament $tournament): string
    {
        $matches = $this->queryMatches()
            ->where('tournament_matches.tournament_id', $tournament->id)
            ->get();

        return $this->buildCalendar(
            name: 'Torneos UNAL - '.$tournament->name,
            matches: $matches,
        );
    }

    public function forAllTournaments(): string
    {
        $matches = $this->queryMatches()->get();

        return $this->buildCalendar(
            name: 'Torneos UNAL - Todos los partidos',
            matches: $matches,
        );
    }

    protected function queryMatches(): Builder
    {
        return TournamentMatch::with(['tournament', 'homeTeam', 'awayTeam', 'referee'])
            ->orderBy('match_date')
            ->orderBy('match_time');
    }

    protected function buildCalendar(string $name, $matches): string
    {
        $events = $matches->map(fn (TournamentMatch $match) => $this->buildEvent($match))->toArray();

        return Calendar::create()
            ->name($name)
            ->productIdentifier('-//Gestion Torneos UNAL//ES')
            ->refreshInterval(self::REFRESH_INTERVAL_MINUTES)
            ->event($events)
            ->get();
    }

    protected function buildEvent(TournamentMatch $match): Event
    {
        $start = Carbon::parse($match->match_date->toDateString().' '.$match->match_time->format('H:i'))
            ->setTimezone(self::TIMEZONE);

        $end = (clone $start)->addMinutes(self::MATCH_DURATION_MINUTES);

        $summary = $this->buildSummary($match);

        $description = $this->buildDescription($match);

        $event = Event::create()
            ->name($summary)
            ->uniqueIdentifier('match-'.$match->id.'@'.config('app.url', 'localhost'))
            ->period($start, $end)
            ->createdAt($match->created_at)
            ->description($description);

        $eventStatus = self::STATUS_MAP[$match->status] ?? EventStatus::Confirmed;
        $event->status($eventStatus);

        return $event;
    }

    protected function buildSummary(TournamentMatch $match): string
    {
        $home = $match->homeTeam->name ?? 'Local';
        $away = $match->awayTeam->name ?? 'Visitante';

        if ($match->status === 'finalizado' && $match->home_score !== null && $match->away_score !== null) {
            return $home.' '.$match->home_score.'-'.$match->away_score.' '.$away;
        }

        return $home.' vs '.$away;
    }

    protected function buildDescription(TournamentMatch $match): string
    {
        $lines = [];

        $lines[] = 'Torneo: '.($match->tournament->name ?? '-');
        $lines[] = 'Estado: '.$match->status;

        if ($match->referee) {
            $lines[] = 'Arbitro: '.$match->referee->name;
        }

        if ($match->observations) {
            $lines[] = 'Observaciones: '.$match->observations;
        }

        return implode("\n", $lines);
    }
}
