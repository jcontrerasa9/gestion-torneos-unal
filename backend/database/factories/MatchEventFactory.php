<?php

namespace Database\Factories;

use App\Models\MatchEvent;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MatchEventFactory extends Factory
{
    protected $model = MatchEvent::class;

    private const GOL_DESCRIPTIONS = [
        'Tiro libre desde fuera del área',
        'Cabezazo en un córner',
        'Disparo potente con el pie derecho',
        'Remate de primera dentro del área',
        'Jugada colectiva terminada en gol',
        'Tiro penal convertido',
        'Golazo desde media distancia',
        'Definición一对一 frente al portero',
    ];

    private const CARD_DESCRIPTIONS = [
        'Falta sobre el rival en mediocampo',
        'Entrada fuerte por detrás',
        'Protesta ante la decisión del árbitro',
        'Juego brusco dentro del área',
        'Retención del balón para evitar el contraataque',
        'Agresión verbal al árbitro',
        'Tardanza excesiva en la reposición del balón',
    ];

    public function definition(): array
    {
        $eventType = $this->faker->randomElement(['gol', 'tarjeta_amarilla', 'tarjeta_roja', 'sustitucion']);

        $description = match ($eventType) {
            'gol' => $this->faker->randomElement(self::GOL_DESCRIPTIONS),
            'tarjeta_amarilla', 'tarjeta_roja' => $this->faker->randomElement(self::CARD_DESCRIPTIONS),
            'sustitucion' => 'Sustitución táctica',
        };

        return [
            'match_id' => TournamentMatch::factory(),
            'player_id' => User::factory()->asPlayer(),
            'event_type' => $eventType,
            'minute' => $this->faker->numberBetween(1, 90),
            'description' => $description,
        ];
    }

    public function gol(): static
    {
        return $this->state(fn () => [
            'event_type' => 'gol',
            'description' => $this->faker->randomElement(self::GOL_DESCRIPTIONS),
        ]);
    }

    public function yellowCard(): static
    {
        return $this->state(fn () => [
            'event_type' => 'tarjeta_amarilla',
            'description' => $this->faker->randomElement(self::CARD_DESCRIPTIONS),
        ]);
    }

    public function redCard(): static
    {
        return $this->state(fn () => [
            'event_type' => 'tarjeta_roja',
            'description' => $this->faker->randomElement(self::CARD_DESCRIPTIONS),
        ]);
    }

    public function substitution(): static
    {
        return $this->state(fn () => [
            'event_type' => 'sustitucion',
            'description' => 'Sustitución táctica',
        ]);
    }
}
