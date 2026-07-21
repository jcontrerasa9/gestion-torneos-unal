<?php

namespace Database\Factories;

use App\Models\Standing;
use App\Models\Tournament;
use App\Models\TournamentTeam;
use Illuminate\Database\Eloquent\Factories\Factory;

class StandingFactory extends Factory
{
    protected $model = Standing::class;

    public function definition(): array
    {
        $matchesPlayed = $this->faker->numberBetween(0, 10);
        $wins = $this->faker->numberBetween(0, $matchesPlayed);
        $draws = $this->faker->numberBetween(0, $matchesPlayed - $wins);
        $losses = $matchesPlayed - $wins - $draws;
        $goalsFor = $this->faker->numberBetween($wins, $wins * 3 + $draws);
        $goalsAgainst = $this->faker->numberBetween(0, $goalsFor + 3);

        return [
            'tournament_id' => Tournament::factory(),
            'tournament_team_id' => TournamentTeam::factory(),
            'matches_played' => $matchesPlayed,
            'wins' => $wins,
            'draws' => $draws,
            'losses' => $losses,
            'goals_for' => $goalsFor,
            'goals_against' => $goalsAgainst,
            'goal_difference' => $goalsFor - $goalsAgainst,
            'points' => ($wins * 3) + $draws,
        ];
    }
}
