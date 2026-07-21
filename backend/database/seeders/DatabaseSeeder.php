<?php

namespace Database\Seeders;

use App\Models\MatchEvent;
use App\Models\PlayerRequest;
use App\Models\Role;
use App\Models\Scorer;
use App\Models\Standing;
use App\Models\Suspension;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Models\TournamentTeamPlayer;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    private array $positions = [
        'Portero', 'Lateral Derecho', 'Lateral Izquierdo',
        'Central Derecho', 'Central Izquierdo',
        'Mediocampista Defensivo', 'Mediocampista Central', 'Mediocampista Ofensivo',
        'Extremo Derecho', 'Extremo Izquierdo',
        'Delantero Centro', 'Segundo Delantero',
    ];

    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $captainRole = Role::where('name', 'captain')->first();
        $playerRole = Role::where('name', 'player')->first();
        $refereeRole = Role::where('name', 'referee')->first();
        $studentRole = Role::where('name', 'student')->first();

        // ═══════════════════════════════════════════════════════
        // FASE 1: USUARIOS
        // ═══════════════════════════════════════════════════════

        User::factory()->create([
            'role_id' => $adminRole->id,
            'email' => 'admin@unal.edu.co',
            'first_name' => 'Carlos',
            'last_name' => 'Administrador',
        ]);

        User::factory()->create([
            'role_id' => $studentRole->id,
            'email' => 'student@unal.edu.co',
            'first_name' => 'Andrés',
            'last_name' => 'Estudiante',
        ]);

        $refereeNames = [
            ['email' => 'referee1@unal.edu.co', 'first_name' => 'Miguel', 'last_name' => 'Quiroga'],
            ['email' => 'referee2@unal.edu.co', 'first_name' => 'Fernando', 'last_name' => 'Pérez'],
            ['email' => 'referee3@unal.edu.co', 'first_name' => 'Ricardo', 'last_name' => 'Torres'],
        ];
        $referees = collect();
        foreach ($refereeNames as $ref) {
            $referees->push(User::factory()->create([
                'role_id' => $refereeRole->id,
                'email' => $ref['email'],
                'first_name' => $ref['first_name'],
                'last_name' => $ref['last_name'],
            ]));
        }

        $captainFixed = User::factory()->create([
            'role_id' => $captainRole->id,
            'email' => 'captain@unal.edu.co',
            'first_name' => 'Andrés',
            'last_name' => 'Capitán',
        ]);
        $captainsFaker = User::factory()->count(19)->create(['role_id' => $captainRole->id]);
        $allCaptains = $captainsFaker->prepend($captainFixed);

        $playerFixed = User::factory()->create([
            'role_id' => $playerRole->id,
            'email' => 'player@unal.edu.co',
            'first_name' => 'Santiago',
            'last_name' => 'Jugador',
        ]);
        $playersFaker = User::factory()->count(149)->create(['role_id' => $playerRole->id]);
        $allPlayers = $playersFaker->prepend($playerFixed);

        // ═══════════════════════════════════════════════════════
        // FASE 2: TORNEOS
        // ═══════════════════════════════════════════════════════

        $t1 = Tournament::create([
            'name' => 'Liga Interna de Ingeniería 2026',
            'modality' => 'Futsal 5v5',
            'description' => 'Torneo interno entre los equipos de los diferentes programas de ingeniería de la universidad.',
            'start_date' => '2026-03-01',
            'end_date' => '2026-06-30',
            'status' => 'en_curso',
        ]);

        $t2 = Tournament::create([
            'name' => 'Copa Facultad de Ciencias',
            'modality' => 'Futbol 11v11',
            'description' => 'Competencia departamental donde cada facultad envía su mejor equipo representativo.',
            'start_date' => '2026-02-15',
            'end_date' => '2026-07-15',
            'status' => 'en_curso',
        ]);

        // ═══════════════════════════════════════════════════════
        // FASE 3: EQUIPOS E INSCRIPCIONES
        // ═══════════════════════════════════════════════════════

        $teams = collect();
        foreach ($allCaptains as $captain) {
            $teams->push(Team::factory()->create(['captain_id' => $captain->id]));
        }

        $t1Teams = $teams->slice(0, 10)->values();
        $t2Teams = $teams->slice(10, 10)->values();

        $t1Enrollments = collect();
        $t1Statuses = ['aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'pendiente', 'pendiente'];
        foreach ($t1Teams as $i => $team) {
            $t1Enrollments->push(TournamentTeam::create([
                'tournament_id' => $t1->id,
                'team_id' => $team->id,
                'status' => $t1Statuses[$i],
                'request_date' => now()->subDays(rand(10, 30))->toDateString(),
                'approval_date' => $t1Statuses[$i] === 'aprobada' ? now()->subDays(rand(1, 5))->toDateString() : null,
            ]));
        }

        $t2Enrollments = collect();
        $t2Statuses = ['aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'aprobada', 'pendiente', 'pendiente', 'rechazada'];
        foreach ($t2Teams as $i => $team) {
            $t2Enrollments->push(TournamentTeam::create([
                'tournament_id' => $t2->id,
                'team_id' => $team->id,
                'status' => $t2Statuses[$i],
                'request_date' => now()->subDays(rand(10, 30))->toDateString(),
                'approval_date' => $t2Statuses[$i] === 'aprobada' ? now()->subDays(rand(1, 5))->toDateString() : null,
            ]));
        }

        // ═══════════════════════════════════════════════════════
        // FASE 4: JUGADORES INSCRITOS
        // ═══════════════════════════════════════════════════════

        // T1 (Futsal 5v5): 50 jugadores → 5 por equipo × 10 equipos
        $playerIndex = 0;
        foreach ($t1Enrollments as $tt) {
            $jersey = 1;
            for ($j = 0; $j < 5; $j++) {
                TournamentTeamPlayer::create([
                    'tournament_id' => $t1->id,
                    'tournament_team_id' => $tt->id,
                    'player_id' => $allPlayers[$playerIndex]->id,
                    'jersey_number' => $jersey,
                    'position' => $this->positions[array_rand($this->positions)],
                    'joined_at' => now()->subDays(rand(5, 20))->toDateString(),
                    'is_active' => true,
                ]);
                $playerIndex++;
                $jersey++;
            }
        }

        // T2 (Futbol 11v11): 100 jugadores → 10 por equipo × 10 equipos
        foreach ($t2Enrollments as $tt) {
            if ($tt->status !== 'aprobada') {
                continue;
            }
            $jersey = 1;
            for ($j = 0; $j < 10; $j++) {
                TournamentTeamPlayer::create([
                    'tournament_id' => $t2->id,
                    'tournament_team_id' => $tt->id,
                    'player_id' => $allPlayers[$playerIndex]->id,
                    'jersey_number' => $jersey,
                    'position' => $this->positions[array_rand($this->positions)],
                    'joined_at' => now()->subDays(rand(5, 20))->toDateString(),
                    'is_active' => true,
                ]);
                $playerIndex++;
                $jersey++;
            }
        }

        // ═══════════════════════════════════════════════════════
        // FASE 5: SOLICITUDES DE JUGADOR (25)
        // ═══════════════════════════════════════════════════════

        PlayerRequest::create([
            'tournament_team_id' => $t1Enrollments[0]->id,
            'player_id' => $playerFixed->id,
            'jersey_number' => 10,
            'position' => 'Mediocampista Ofensivo',
            'status' => 'aprobada',
            'request_date' => now()->subDays(20)->toDateString(),
            'approval_date' => now()->subDays(15)->toDateString(),
        ]);

        for ($i = 0; $i < 11; $i++) {
            PlayerRequest::factory()->approved()->create([
                'tournament_team_id' => $t1Enrollments[array_rand($t1Enrollments->toArray())]->id,
                'player_id' => $allPlayers[$i]->id,
            ]);
        }

        for ($i = 0; $i < 10; $i++) {
            PlayerRequest::factory()->pending()->create([
                'tournament_team_id' => $t1Enrollments[array_rand($t1Enrollments->toArray())]->id,
                'player_id' => $allPlayers[50 + $i]->id,
            ]);
        }

        for ($i = 0; $i < 3; $i++) {
            PlayerRequest::factory()->rejected()->create([
                'tournament_team_id' => $t2Enrollments[array_rand($t2Enrollments->toArray())]->id,
                'player_id' => $allPlayers[100 + $i]->id,
            ]);
        }

        // ═══════════════════════════════════════════════════════
        // FASE 6: PARTIDOS (6 por torneo = 12)
        // ═══════════════════════════════════════════════════════

        $t1Matches = collect();
        $t1MatchData = [
            ['home' => 0, 'away' => 5, 'status' => 'finalizado', 'hs' => 3, 'as' => 1, 'date' => '2026-03-10'],
            ['home' => 1, 'away' => 6, 'status' => 'finalizado', 'hs' => 2, 'as' => 2, 'date' => '2026-03-17'],
            ['home' => 2, 'away' => 7, 'status' => 'finalizado', 'hs' => 4, 'as' => 0, 'date' => '2026-03-24'],
            ['home' => 3, 'away' => 8, 'status' => 'en_juego', 'hs' => 1, 'as' => 0, 'date' => '2026-04-07'],
            ['home' => 4, 'away' => 9, 'status' => 'en_juego', 'hs' => 0, 'as' => 1, 'date' => '2026-04-07'],
            ['home' => 0, 'away' => 3, 'status' => 'programado', 'hs' => null, 'as' => null, 'date' => '2026-04-14'],
        ];
        foreach ($t1MatchData as $m) {
            $t1Matches->push(TournamentMatch::create([
                'tournament_id' => $t1->id,
                'home_team_id' => $t1Teams[$m['home']]->id,
                'away_team_id' => $t1Teams[$m['away']]->id,
                'referee_id' => $referees[0]->id,
                'match_date' => $m['date'],
                'match_time' => '10:00',
                'status' => $m['status'],
                'home_score' => $m['hs'],
                'away_score' => $m['as'],
                'observations' => match ($m['status']) {
                    'finalizado' => 'Partido disputado bajo buenas condiciones.',
                    'en_juego' => 'Partido en curso.',
                    default => null,
                },
            ]));
        }

        $t2Matches = collect();
        $t2MatchData = [
            ['home' => 0, 'away' => 5, 'status' => 'finalizado', 'hs' => 2, 'as' => 1, 'date' => '2026-02-22'],
            ['home' => 1, 'away' => 6, 'status' => 'finalizado', 'hs' => 1, 'as' => 0, 'date' => '2026-03-01'],
            ['home' => 2, 'away' => 3, 'status' => 'finalizado', 'hs' => 3, 'as' => 3, 'date' => '2026-03-08'],
            ['home' => 4, 'away' => 5, 'status' => 'en_juego', 'hs' => 1, 'as' => 1, 'date' => '2026-04-05'],
            ['home' => 0, 'away' => 1, 'status' => 'programado', 'hs' => null, 'as' => null, 'date' => '2026-04-12'],
            ['home' => 6, 'away' => 2, 'status' => 'programado', 'hs' => null, 'as' => null, 'date' => '2026-04-12'],
        ];
        foreach ($t2MatchData as $m) {
            $t2Matches->push(TournamentMatch::create([
                'tournament_id' => $t2->id,
                'home_team_id' => $t2Teams[$m['home']]->id,
                'away_team_id' => $t2Teams[$m['away']]->id,
                'referee_id' => $referees[1]->id,
                'match_date' => $m['date'],
                'match_time' => '15:00',
                'status' => $m['status'],
                'home_score' => $m['hs'],
                'away_score' => $m['as'],
                'observations' => match ($m['status']) {
                    'finalizado' => 'Partido con ritmo alto, pocas faltas.',
                    'en_juego' => 'Partido en curso, público presente.',
                    default => null,
                },
            ]));
        }

        // ═══════════════════════════════════════════════════════
        // FASE 7: EVENTOS DE PARTIDO (36)
        // ═══════════════════════════════════════════════════════

        // --- T1 Match1 (3-1) → 5 goles ---
        $andres = $allPlayers[0];
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $andres->id, 'event_type' => 'gol', 'minute' => 12, 'description' => 'Tiro libre desde fuera del área']);
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $andres->id, 'event_type' => 'gol', 'minute' => 45, 'description' => 'Remate de primera dentro del área']);
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $allPlayers[1]->id, 'event_type' => 'gol', 'minute' => 60, 'description' => 'Cabezazo en un córner']);
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $allPlayers[5]->id, 'event_type' => 'gol', 'minute' => 78, 'description' => 'Disparo potente con el pie derecho']);
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $andres->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 33, 'description' => 'Falta sobre el rival en mediocampo']);
        MatchEvent::create(['match_id' => $t1Matches[0]->id, 'player_id' => $allPlayers[6]->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 55, 'description' => 'Entrada fuerte por detrás']);

        // --- T1 Match2 (2-2) → 4 goles ---
        MatchEvent::create(['match_id' => $t1Matches[1]->id, 'player_id' => $allPlayers[2]->id, 'event_type' => 'gol', 'minute' => 8, 'description' => 'Golazo desde media distancia']);
        MatchEvent::create(['match_id' => $t1Matches[1]->id, 'player_id' => $allPlayers[7]->id, 'event_type' => 'gol', 'minute' => 22, 'description' => 'Definición一对一 frente al portero']);
        MatchEvent::create(['match_id' => $t1Matches[1]->id, 'player_id' => $andres->id, 'event_type' => 'gol', 'minute' => 50, 'description' => 'Jugada colectiva terminada en gol']);
        MatchEvent::create(['match_id' => $t1Matches[1]->id, 'player_id' => $allPlayers[3]->id, 'event_type' => 'gol', 'minute' => 67, 'description' => 'Tiro penal convertido']);
        MatchEvent::create(['match_id' => $t1Matches[1]->id, 'player_id' => $andres->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 40, 'description' => 'Protesta ante la decisión del árbitro']);

        // --- T1 Match3 (4-0) → 4 goles ---
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $andres->id, 'event_type' => 'gol', 'minute' => 5, 'description' => 'Disparo potente con el pie derecho']);
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $allPlayers[4]->id, 'event_type' => 'gol', 'minute' => 28, 'description' => 'Cabezazo en un córner']);
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $andres->id, 'event_type' => 'gol', 'minute' => 55, 'description' => 'Remate de primera dentro del área']);
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $allPlayers[8]->id, 'event_type' => 'gol', 'minute' => 70, 'description' => 'Tiro libre directo']);
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $andres->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 62, 'description' => 'Juego brusco dentro del área']);
        MatchEvent::create(['match_id' => $t1Matches[2]->id, 'player_id' => $allPlayers[9]->id, 'event_type' => 'sustitucion', 'minute' => 65, 'description' => 'Sustitución táctica']);

        // --- T2 Match1 (2-1) → 3 goles ---
        $sebastian = $allPlayers[50];
        MatchEvent::create(['match_id' => $t2Matches[0]->id, 'player_id' => $sebastian->id, 'event_type' => 'gol', 'minute' => 15, 'description' => 'Jugada colectiva terminada en gol']);
        MatchEvent::create(['match_id' => $t2Matches[0]->id, 'player_id' => $allPlayers[51]->id, 'event_type' => 'gol', 'minute' => 40, 'description' => 'Tiro penal convertido']);
        MatchEvent::create(['match_id' => $t2Matches[0]->id, 'player_id' => $allPlayers[55]->id, 'event_type' => 'gol', 'minute' => 82, 'description' => 'Disparo potente con el pie derecho']);

        // --- T2 Match2 (1-0) → 1 gol ---
        MatchEvent::create(['match_id' => $t2Matches[1]->id, 'player_id' => $allPlayers[52]->id, 'event_type' => 'gol', 'minute' => 35, 'description' => 'Golazo desde media distancia']);

        // --- T2 Match3 (3-3) → 6 goles ---
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $allPlayers[53]->id, 'event_type' => 'gol', 'minute' => 10, 'description' => 'Cabezazo en un córner']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $allPlayers[56]->id, 'event_type' => 'gol', 'minute' => 25, 'description' => 'Remate de primera dentro del área']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $allPlayers[54]->id, 'event_type' => 'gol', 'minute' => 44, 'description' => 'Definición一对一 frente al portero']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $allPlayers[57]->id, 'event_type' => 'gol', 'minute' => 55, 'description' => 'Tiro libre directo']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $sebastian->id, 'event_type' => 'gol', 'minute' => 72, 'description' => 'Golazo desde media distancia']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $allPlayers[58]->id, 'event_type' => 'gol', 'minute' => 88, 'description' => 'Disparo potente con el pie derecho']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $sebastian->id, 'event_type' => 'tarjeta_roja', 'minute' => 78, 'description' => 'Agresión a un jugador rival']);

        // --- Tarjetas amarillas adicionales (Andrés acumula 3) ---
        $nicolas = $allPlayers[60];
        MatchEvent::create(['match_id' => $t2Matches[0]->id, 'player_id' => $nicolas->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 30, 'description' => 'Retención del balón']);
        MatchEvent::create(['match_id' => $t2Matches[1]->id, 'player_id' => $nicolas->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 50, 'description' => 'Protesta ante la decisión del árbitro']);
        MatchEvent::create(['match_id' => $t2Matches[2]->id, 'player_id' => $nicolas->id, 'event_type' => 'tarjeta_amarilla', 'minute' => 65, 'description' => 'Entrada fuerte por detrás']);

        // ═══════════════════════════════════════════════════════
        // FASE 8: STANDINGS (20)
        // ═══════════════════════════════════════════════════════

        $t1StandingData = [
            [0, 3, 2, 0, 1, 9, 3, 6],
            [1, 3, 1, 1, 1, 5, 4, 1],
            [2, 3, 2, 0, 1, 6, 2, 4],
            [3, 2, 1, 0, 1, 2, 3, -1],
        ];
        foreach ($t1StandingData as $sd) {
            Standing::create([
                'tournament_id' => $t1->id,
                'tournament_team_id' => $t1Enrollments[$sd[0]]->id,
                'matches_played' => $sd[1], 'wins' => $sd[2], 'draws' => $sd[3], 'losses' => $sd[4],
                'goals_for' => $sd[5], 'goals_against' => $sd[6], 'goal_difference' => $sd[7],
                'points' => ($sd[2] * 3) + $sd[3],
            ]);
        }

        $t2StandingData = [
            [0, 3, 2, 0, 1, 5, 2, 3],
            [1, 3, 2, 0, 1, 3, 1, 2],
            [2, 3, 0, 1, 2, 6, 7, -1],
            [3, 2, 0, 1, 1, 3, 4, -1],
        ];
        foreach ($t2StandingData as $sd) {
            Standing::create([
                'tournament_id' => $t2->id,
                'tournament_team_id' => $t2Enrollments[$sd[0]]->id,
                'matches_played' => $sd[1], 'wins' => $sd[2], 'draws' => $sd[3], 'losses' => $sd[4],
                'goals_for' => $sd[5], 'goals_against' => $sd[6], 'goal_difference' => $sd[7],
                'points' => ($sd[2] * 3) + $sd[3],
            ]);
        }

        // ═══════════════════════════════════════════════════════
        // FASE 9: SCORERS (18)
        // ═══════════════════════════════════════════════════════

        $scorerData = [
            [$t1->id, $andres->id, 7],
            [$t1->id, $allPlayers[1]->id, 2],
            [$t1->id, $allPlayers[2]->id, 2],
            [$t1->id, $allPlayers[3]->id, 1],
            [$t1->id, $allPlayers[4]->id, 1],
            [$t1->id, $allPlayers[5]->id, 1],
            [$t1->id, $allPlayers[7]->id, 1],
            [$t1->id, $allPlayers[8]->id, 1],
            [$t2->id, $sebastian->id, 3],
            [$t2->id, $allPlayers[51]->id, 1],
            [$t2->id, $allPlayers[52]->id, 1],
            [$t2->id, $allPlayers[53]->id, 1],
            [$t2->id, $allPlayers[54]->id, 1],
            [$t2->id, $allPlayers[55]->id, 1],
            [$t2->id, $allPlayers[56]->id, 1],
            [$t2->id, $allPlayers[57]->id, 1],
            [$t2->id, $allPlayers[58]->id, 1],
        ];
        foreach ($scorerData as $sd) {
            Scorer::create(['tournament_id' => $sd[0], 'player_id' => $sd[1], 'goals' => $sd[2]]);
        }

        // ═══════════════════════════════════════════════════════
        // FASE 10: SUSPENSIONS (6)
        // ═══════════════════════════════════════════════════════

        // Andrés: 3 amarillas acumuladas → 1 partido, ACTIVA
        Suspension::create([
            'tournament_id' => $t1->id,
            'player_id' => $andres->id,
            'reason' => '3 amarillas acumuladas en el torneo',
            'triggered_by_match_id' => $t1Matches[2]->id,
            'matches_suspended' => 1,
            'status' => 'activa',
        ]);

        // Sebastián: roja directa → 2 partidos, ACTIVA
        Suspension::create([
            'tournament_id' => $t2->id,
            'player_id' => $sebastian->id,
            'reason' => 'Tarjeta roja directa',
            'triggered_by_match_id' => $t2Matches[2]->id,
            'matches_suspended' => 2,
            'status' => 'activa',
        ]);

        // Nicolás: roja directa → 2 partidos, CUMPLIDA
        Suspension::create([
            'tournament_id' => $t2->id,
            'player_id' => $nicolas->id,
            'reason' => 'Tarjeta roja directa',
            'triggered_by_match_id' => $t2Matches[0]->id,
            'matches_suspended' => 2,
            'status' => 'cumplida',
        ]);

        // Manual: conducta antideportiva, ACTIVA
        Suspension::create([
            'tournament_id' => $t1->id,
            'player_id' => $allPlayers[10]->id,
            'reason' => 'Conducta antideportiva durante el partido',
            'triggered_by_match_id' => null,
            'matches_suspended' => 2,
            'status' => 'activa',
        ]);

        // Manual: discusión con árbitro, CANCELADA
        Suspension::create([
            'tournament_id' => $t1->id,
            'player_id' => $allPlayers[11]->id,
            'reason' => 'Discusión con el árbitro',
            'triggered_by_match_id' => null,
            'matches_suspended' => 1,
            'status' => 'cancelada',
        ]);

        // Manual: agresión a jugador rival, ACTIVA
        Suspension::create([
            'tournament_id' => $t2->id,
            'player_id' => $allPlayers[62]->id,
            'reason' => 'Agresión a un jugador rival',
            'triggered_by_match_id' => null,
            'matches_suspended' => 3,
            'status' => 'activa',
        ]);
    }
}
