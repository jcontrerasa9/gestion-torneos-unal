<?php

namespace Database\Factories;

use App\Models\Tournament;
use Illuminate\Database\Eloquent\Factories\Factory;

class TournamentFactory extends Factory
{
    protected $model = Tournament::class;

    private const TOURNAMENT_NAMES = [
        'Liga Interna de Ingeniería 2026',
        'Copa Facultad de Ciencias',
        'Torneo Apertura UNal',
        'Copa Estudiantil Futsal',
        'Liga de Departamentos',
        'Copa Rectory',
        'Torneo Interfacultades',
        'Copa Solidaridad UNal',
    ];

    private const DESCRIPTIONS = [
        'Torneo interno entre los equipos de los diferentes programas de la universidad.',
        'Competencia departamental donde cada facultad envía su mejor equipo.',
        'Liga regular del primer semestre con enfrentamientos todos contra todos.',
        'Copa de futsal abierta a todos los estudiantes matriculados.',
        'Torneo entre los equipos representativos de cada departamento.',
        'Competencia organizada por la rectoría para fomentar el deporte.',
        'Torneo entre facultades con modalidad de eliminación directa.',
        'Copa con fines solidarios, los fondos recaudados van a becas deportivas.',
    ];

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
            'name' => $this->faker->unique()->randomElement(self::TOURNAMENT_NAMES),
            'modality' => $this->faker->randomElement(['Futsal 5v5', 'Futsal 7v7', 'Futbol 11v11']),
            'description' => $this->faker->unique()->randomElement(self::DESCRIPTIONS),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'status' => $status,
        ];
    }
}
