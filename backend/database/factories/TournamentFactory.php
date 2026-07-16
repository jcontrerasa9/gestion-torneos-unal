<?php

namespace Database\Factories;

use App\Models\Tournament;
use Illuminate\Database\Eloquent\Factories\Factory;

class TournamentFactory extends Factory
{
    protected $model = Tournament::class;

    public function definition(): array
    {
        $statuses = ['pendiente', 'en_curso', 'finalizado', 'cancelado'];
        $status = $this->faker->randomElement($statuses);

        $startDate = match ($status) {
            'pendiente' => $this->faker->dateTimeBetween('+1 month', '+3 months'),
            'en_curso' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
            'finalizado' => $this->faker->dateTimeBetween('-3 months', '-1 month'),
            'cancelado' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
            default => $this->faker->dateTimeBetween('+1 month', '+3 months'),
        };

        $endDate = (clone $startDate)->modify('+' . $this->faker->numberBetween(1, 3) . ' months');

        return [
            'name' => $this->faker->randomElement([
                'Liga BetPlay Apertura',
                'Liga BetPlay Clausura',
                'Copa Colombia',
                'Torneo Universitario',
                'Copa Liga Regional',
                'Superliga BetPlay',
                'Torneo Futsal Unal',
                'Copa Interuniversitaria',
            ]),
            'modality' => $this->faker->randomElement(['Futsal 5v5', 'Futsal 7v7', 'Futbol 11v11']),
            'description' => $this->faker->sentence(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'status' => $status,
        ];
    }
}
