<?php

namespace App\Services;

use App\Models\Standing;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

class StandingService
{
    public function updateFromMatch(TournamentMatch $match): void
    {
        if ($match->status !== 'finished') {
            return;
        }

        $homeTeamId = $match->home_team_id;
        $awayTeamId = $match->away_team_id;
        $homeScore = (int) $match->home_score;
        $awayScore = (int) $match->away_score;

        $homeStanding = $this->findOrCreateStanding($match->tournament_id, $homeTeamId);
        $awayStanding = $this->findOrCreateStanding($match->tournament_id, $awayTeamId);

        $homeStanding->matches_played += 1;
        $awayStanding->matches_played += 1;

        $homeStanding->goals_for += $homeScore;
        $homeStanding->goals_against += $awayScore;
        $awayStanding->goals_for += $awayScore;
        $awayStanding->goals_against += $homeScore;

        if ($homeScore > $awayScore) {
            $homeStanding->wins += 1;
            $awayStanding->losses += 1;
            $homeStanding->points += 3;
        } elseif ($homeScore < $awayScore) {
            $homeStanding->losses += 1;
            $awayStanding->wins += 1;
            $awayStanding->points += 3;
        } else {
            $homeStanding->draws += 1;
            $awayStanding->draws += 1;
            $homeStanding->points += 1;
            $awayStanding->points += 1;
        }

        $homeStanding->goal_difference = $homeStanding->goals_for - $homeStanding->goals_against;
        $awayStanding->goal_difference = $awayStanding->goals_for - $awayStanding->goals_against;

        $homeStanding->save();
        $awayStanding->save();
    }

    protected function findOrCreateStanding(int $tournamentId, int $tournamentTeamId): Standing
    {
        return Standing::firstOrCreate(
            [
                'tournament_id' => $tournamentId,
                'tournament_team_id' => $tournamentTeamId,
            ],
            [
                'matches_played' => 0,
                'wins' => 0,
                'draws' => 0,
                'losses' => 0,
                'goals_for' => 0,
                'goals_against' => 0,
                'goal_difference' => 0,
                'points' => 0,
            ]
        );
    }
}
