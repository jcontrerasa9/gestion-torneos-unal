<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentTeam;
use Illuminate\Database\Eloquent\Factories\Factory;

class TournamentTeamFactory extends Factory
{
    protected $model = TournamentTeam::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(['pendiente', 'aprobada', 'rechazada']);

        return [
            'tournament_id' => Tournament::factory(),
            'team_id' => Team::factory(),
            'status' => $status,
            'request_date' => $this->faker->dateTimeBetween('-2 months', '-1 week')->format('Y-m-d'),
            'approval_date' => $status === 'aprobada' ? $this->faker->dateTimeBetween('-1 week', 'now')->format('Y-m-d') : null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'aprobada',
            'approval_date' => $this->faker->dateTimeBetween('-1 week', 'now')->format('Y-m-d'),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => 'pendiente',
            'approval_date' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => 'rechazada',
            'approval_date' => null,
        ]);
    }
}
