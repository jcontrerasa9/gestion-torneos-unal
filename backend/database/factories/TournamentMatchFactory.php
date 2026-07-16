<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TournamentMatchFactory extends Factory
{
    protected $model = TournamentMatch::class;

    public function definition(): array
    {
        $statuses = ['programado', 'en_juego', 'finalizado', 'aplazado'];
        $status = $this->faker->randomElement($statuses);

        $hasScore = in_array($status, ['en_juego', 'finalizado']);

        return [
            'tournament_id' => Tournament::factory(),
            'home_team_id' => Team::factory(),
            'away_team_id' => Team::factory(),
            'referee_id' => User::factory()->asReferee(),
            'match_date' => $this->faker->dateTimeBetween('-1 month', '+3 months')->format('Y-m-d'),
            'match_time' => $this->faker->time('H:i'),
            'status' => $status,
            'home_score' => $hasScore ? $this->faker->numberBetween(0, 10) : null,
            'away_score' => $hasScore ? $this->faker->numberBetween(0, 10) : null,
            'observations' => $this->faker->optional(0.3)->sentence(),
        ];
    }
}
