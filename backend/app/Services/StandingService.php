<?php

namespace App\Services;

use App\Models\Standing;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Database\Eloquent\Collection;

class StandingService
{
    public function updateFromMatch(TournamentMatch $match): void
    {
        if (!in_array($match->status, ['finished', 'finalizado'], true)) {
            return;
        }

        $homeStanding = $this->findOrCreateStanding($match->tournament_id, $match->home_team_id);
        $awayStanding = $this->findOrCreateStanding($match->tournament_id, $match->away_team_id);

        $homeScore = (int) $match->home_score;
        $awayScore = (int) $match->away_score;

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

    public function refreshForTournament(Tournament $tournament): void
    {
        foreach ($tournament->matches()->whereIn('status', ['finished', 'finalizado'])->get() as $match) {
            $this->updateFromMatch($match);
        }
    }

    protected function findOrCreateStanding(int $tournamentId, int $teamId): Standing
    {
        $tournamentTeam = $this->resolveTournamentTeamId($tournamentId, $teamId);

        return Standing::firstOrCreate(
            [
                'tournament_id' => $tournamentId,
                'tournament_team_id' => $tournamentTeam->id,
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

    protected function resolveTournamentTeamId(int $tournamentId, int $teamId): \App\Models\TournamentTeam
    {
        return \App\Models\TournamentTeam::firstOrCreate(
            [
                'tournament_id' => $tournamentId,
                'team_id' => $teamId,
            ],
            [
                'request_date' => now()->toDateString(),
                'status' => 'aprobado',
            ]
        );
    }
}
