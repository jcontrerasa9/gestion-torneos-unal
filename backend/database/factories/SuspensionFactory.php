<?php

namespace Database\Factories;

use App\Models\Suspension;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SuspensionFactory extends Factory
{
    protected $model = Suspension::class;

    private const REASONS = [
        '3 amarillas acumuladas en el torneo',
        'Tarjeta roja directa',
        'Conducta antideportiva durante el partido',
        'Discusión con el árbitro',
        'Agresión a un jugador rival',
        'Ingreso sin autorización al campo de juego',
    ];

    public function definition(): array
    {
        $status = $this->faker->randomElement(['activa', 'cumplida', 'cancelada']);

        return [
            'tournament_id' => Tournament::factory(),
            'player_id' => User::factory()->asPlayer(),
            'reason' => $this->faker->randomElement(self::REASONS),
            'triggered_by_match_id' => $this->faker->optional(0.7)->passthrough(TournamentMatch::factory()),
            'matches_suspended' => $this->faker->numberBetween(1, 2),
            'status' => $status,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'activa',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'cumplida',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelada',
        ]);
    }

    public function manual(): static
    {
        return $this->state(fn () => [
            'triggered_by_match_id' => null,
        ]);
    }

    public function automatic(): static
    {
        return $this->state(fn () => [
            'triggered_by_match_id' => TournamentMatch::factory(),
        ]);
    }
}
