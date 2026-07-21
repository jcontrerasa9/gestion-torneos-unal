<?php

namespace Database\Factories;

use App\Models\PlayerRequest;
use App\Models\TournamentTeam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlayerRequestFactory extends Factory
{
    protected $model = PlayerRequest::class;

    private const POSITIONS = [
        'Portero',
        'Lateral Derecho',
        'Lateral Izquierdo',
        'Central Derecho',
        'Central Izquierdo',
        'Mediocampista Defensivo',
        'Mediocampista Central',
        'Mediocampista Ofensivo',
        'Extremo Derecho',
        'Extremo Izquierdo',
        'Delantero Centro',
        'Segundo Delantero',
    ];

    public function definition(): array
    {
        $status = $this->faker->randomElement(['pendiente', 'aprobada', 'rechazada']);

        return [
            'tournament_team_id' => TournamentTeam::factory(),
            'player_id' => User::factory()->asPlayer(),
            'jersey_number' => $this->faker->numberBetween(1, 99),
            'position' => $this->faker->randomElement(self::POSITIONS),
            'status' => $status,
            'request_date' => $this->faker->dateTimeBetween('-2 months', '-1 week')->format('Y-m-d'),
            'approval_date' => $status !== 'pendiente' ? $this->faker->dateTimeBetween('-1 week', 'now')->format('Y-m-d') : null,
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
