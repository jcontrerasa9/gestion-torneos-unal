<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    protected $model = Team::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'captain_id' => User::factory()->asCaptain(),
            'name' => fake()->unique()->randomElement([
                'Atlético Nacional',
                'Millonarios',
                'Santa Fe',
                'Junior',
                'América de Cali',
                'Deportivo Cali',
                'Once Caldas',
                'Independiente Medellín',
                'Atlético Bucaramanga',
                'Deportes Tolima',
                'Envigado',
                'Jaguares de Córdoba',
                'Patriotas Boyacá',
                'La Equidad',
                'Boyacá Chicó',
                'Cúcuta Deportivo',
                'Llaneros',
                'Real Cartagena',
                'Tigres F.C.',
                'Orsomarso',
            ]),
            'logo' => null,
        ];
    }
}
