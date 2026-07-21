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

    private const OBSERVATIONS = [
        'Partido disputado bajo lluvia ligera.',
        'Retraso de15 minutos por llegada del árbitro.',
        'Incidente menor en el segundo tiempo, juego continuó.',
        'Jugador local lesionado, fue sustituido en el minuto35.',
        'Cancha en mal estado, juego limitado.',
        'Público presente animando a ambos equipos.',
        'Partido con ritmo alto, pocas faltas.',
        'Tiempo suspendido por30 minutos por tormenta.',
        'Jugador visitante expulsado con tarjeta roja directa.',
        'Árbitro advirtió a ambos equipos antes del inicio.',
    ];

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
            'match_time' => $this->faker->randomElement(['08:00', '09:30', '10:00', '14:00', '15:30', '16:00', '17:30']),
            'status' => $status,
            'home_score' => $hasScore ? $this->faker->numberBetween(0, 8) : null,
            'away_score' => $hasScore ? $this->faker->numberBetween(0, 6) : null,
            'observations' => $this->faker->optional(0.4)->randomElement(self::OBSERVATIONS),
        ];
    }
}
