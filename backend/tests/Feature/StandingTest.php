<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Services\StandingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rebuilds_standings_from_finalized_matches(): void
    {
        $tournament = Tournament::factory()->create();

        $homeTeam = Team::factory()->create();
        $awayTeam = Team::factory()->create();

        $homeTournamentTeam = TournamentTeam::create([
            'tournament_id' => $tournament->id,
            'team_id' => $homeTeam->id,
            'status' => 'aprobado',
            'request_date' => now()->toDateString(),
            'approval_date' => now()->toDateString(),
        ]);

        $awayTournamentTeam = TournamentTeam::create([
            'tournament_id' => $tournament->id,
            'team_id' => $awayTeam->id,
            'status' => 'aprobado',
            'request_date' => now()->toDateString(),
            'approval_date' => now()->toDateString(),
        ]);

        TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
            'referee_id' => null,
            'match_date' => now()->toDateString(),
            'match_time' => '20:00:00',
            'status' => 'finalizado',
            'home_score' => 2,
            'away_score' => 1,
            'observations' => 'Test match',
        ]);

        app(StandingService::class)->refreshForTournament($tournament);

        $this->assertDatabaseHas('standings', [
            'tournament_id' => $tournament->id,
            'tournament_team_id' => $homeTournamentTeam->id,
            'wins' => 1,
            'losses' => 0,
            'points' => 3,
        ]);

        $this->assertDatabaseHas('standings', [
            'tournament_id' => $tournament->id,
            'tournament_team_id' => $awayTournamentTeam->id,
            'wins' => 0,
            'losses' => 1,
            'points' => 0,
        ]);
    }
}
