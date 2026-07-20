<?php

namespace App\Services;

use App\Models\MatchEvent;
use App\Models\Scorer;
use App\Models\TournamentMatch;

class ScorerService
{
    public function updateForEvent(MatchEvent $event): void
    {
        if ($event->event_type !== 'gol') {
            return;
        }

        $match = TournamentMatch::find($event->match_id);

        if (! $match) {
            return;
        }

        $goals = MatchEvent::where('event_type', 'gol')
            ->where('player_id', $event->player_id)
            ->whereHas('match', function ($q) use ($match): void {
                $q->where('tournament_id', $match->tournament_id);
            })
            ->count();

        Scorer::updateOrCreate(
            [
                'tournament_id' => $match->tournament_id,
                'player_id' => $event->player_id,
            ],
            [
                'goals' => $goals,
            ]
        );
    }

    public function removeForEvent(MatchEvent $event): void
    {
        if ($event->event_type !== 'gol') {
            return;
        }

        $match = TournamentMatch::find($event->match_id);

        if (! $match) {
            return;
        }

        $goals = MatchEvent::where('event_type', 'gol')
            ->where('player_id', $event->player_id)
            ->where('id', '!=', $event->id)
            ->whereHas('match', function ($q) use ($match): void {
                $q->where('tournament_id', $match->tournament_id);
            })
            ->count();

        if ($goals === 0) {
            Scorer::where('tournament_id', $match->tournament_id)
                ->where('player_id', $event->player_id)
                ->delete();
        } else {
            Scorer::where('tournament_id', $match->tournament_id)
                ->where('player_id', $event->player_id)
                ->update(['goals' => $goals]);
        }
    }
}
