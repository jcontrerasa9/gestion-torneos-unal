<?php

namespace Database\Factories;

use App\Models\Tournament;
use App\Models\TournamentTeam;
use App\Models\TournamentTeamPlayer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TournamentTeamPlayerFactory extends Factory
{
    protected $model = TournamentTeamPlayer::class;

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
        return [
            'tournament_id' => Tournament::factory(),
            'tournament_team_id' => TournamentTeam::factory(),
            'player_id' => User::factory()->asPlayer(),
            'jersey_number' => $this->faker->numberBetween(1, 99),
            'position' => $this->faker->randomElement(self::POSITIONS),
            'joined_at' => $this->faker->dateTimeBetween('-2 months', '-1 week')->format('Y-m-d'),
            'is_active' => $this->faker->boolean(85),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
