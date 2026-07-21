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

    public function definition(): array
    {
        return [
            'captain_id' => User::factory()->asCaptain(),
            'name' => fake()->unique()->randomElement([
                'Los Ingenieros',
                'La Macarena FC',
                'Expreso Azul',
                'Los Profesores',
                'La Facultad',
                'CDS La 45',
                'Los Andes',
                'Pumas UNAL',
                'Equipo Grado 10',
                'La Cantera',
                'Los Deportistas',
                'Futbol Club',
                'Racing UNAL',
                'Atlético Campus',
                'La Normal',
                'Deportivo Lab',
                'Los Halcones',
                'San Carlos FC',
                'La 30 FC',
                'Millonarios UNAL',
            ]),
            'logo' => null,
        ];
    }
}
