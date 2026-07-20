<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Models\TournamentTeamPlayer;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // ── Roles ──
        $adminRole = Role::where('name', 'admin')->first();
        $captainRole = Role::where('name', 'captain')->first();
        $playerRole = Role::where('name', 'player')->first();
        $refereeRole = Role::where('name', 'referee')->first();
        $studentRole = Role::where('name', 'student')->first();

        // ── Fixed users ──
        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'email' => 'admin@unal.edu.co',
            'first_name' => 'Admin',
            'last_name' => 'UNAL',
        ]);

        User::factory()->create([
            'role_id' => $studentRole->id,
            'email' => 'student@unal.edu.co',
            'first_name' => 'Estudiante',
            'last_name' => 'UNAL',
        ]);

        $referee = User::factory()->create([
            'role_id' => $refereeRole->id,
            'email' => 'referee@unal.edu.co',
            'first_name' => 'Árbitro',
            'last_name' => 'UNAL',
        ]);

        // ── Captains (20) ──
        $captainFixed = User::factory()->create([
            'role_id' => $captainRole->id,
            'email' => 'captain@unal.edu.co',
            'first_name' => 'Capitán',
            'last_name' => 'UNAL',
        ]);

        $captainsFaker = User::factory()->count(19)->create(['role_id' => $captainRole->id]);
        $allCaptains = $captainsFaker->prepend($captainFixed); // 20 captains

        // ── Players (150) ──
        $playerFixed = User::factory()->create([
            'role_id' => $playerRole->id,
            'email' => 'player@unal.edu.co',
            'first_name' => 'Jugador',
            'last_name' => 'UNAL',
        ]);

        $playersFaker = User::factory()->count(149)->create(['role_id' => $playerRole->id]);
        $allPlayers = $playersFaker->prepend($playerFixed); // 150 players

        // ── Tournaments (2) ──
        $f5 = Tournament::create([
            'name' => 'Torneo Fútbol 5',
            'modality' => 'futbol5',
            'description' => 'Campeonato universitario de Fútbol 5 UNAL La Nubia.',
            'start_date' => '2026-08-01',
            'end_date' => '2026-11-30',
            'status' => 'en_curso',
        ]);

        $f11 = Tournament::create([
            'name' => 'Torneo Fútbol 11',
            'modality' => 'futbol11',
            'description' => 'Campeonato universitario de Fútbol 11 UNAL La Nubia.',
            'start_date' => '2026-08-01',
            'end_date' => '2026-11-30',
            'status' => 'en_curso',
        ]);

        // ── Teams (20) ──
        $teams = collect();
        foreach ($allCaptains as $captain) {
            $team = Team::factory()->create(['captain_id' => $captain->id]);
            $teams->push($team);
        }

        $f5Teams = $teams->slice(0, 10)->values();
        $f11Teams = $teams->slice(10, 10)->values();

        // ── Tournament Teams (10 × 2 = 20 enrollments) ──
        $positions = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

        foreach ([$f5, $f11] as $idx => $tournament) {
            $tourneyTeams = $idx === 0 ? $f5Teams : $f11Teams;

            foreach ($tourneyTeams as $ti => $team) {
                $status = $ti < 6 ? 'aprobada' : 'pendiente';

                TournamentTeam::create([
                    'tournament_id' => $tournament->id,
                    'team_id' => $team->id,
                    'status' => $status,
                    'request_date' => now()->subDays(rand(5, 30))->toDateString(),
                    'approval_date' => $status === 'aprobada' ? now()->subDays(rand(1, 4))->toDateString() : null,
                ]);
            }
        }

        // ── Tournament Team Players (plantillas) ──
        $f5TTs = TournamentTeam::where('tournament_id', $f5->id)->orderBy('id')->get();
        $f11TTs = TournamentTeam::where('tournament_id', $f11->id)->orderBy('id')->get();

        // F5: 7 players per team (players 0-69)
        foreach ($f5TTs as $ti => $tt) {
            $slice = $allPlayers->slice($ti * 7, 7);
            $jersey = 1;
            foreach ($slice as $p) {
                TournamentTeamPlayer::create([
                    'tournament_id' => $f5->id,
                    'tournament_team_id' => $tt->id,
                    'player_id' => $p->id,
                    'jersey_number' => $jersey,
                    'position' => $positions[array_rand($positions)],
                    'joined_at' => now()->toDateString(),
                ]);
                $jersey++;
            }
        }

        // F11: 14 players per team (players 0-139, reusing first 70 from F5)
        foreach ($f11TTs as $ti => $tt) {
            $slice = $allPlayers->slice($ti * 14, 14);
            $jersey = 1;
            foreach ($slice as $p) {
                TournamentTeamPlayer::create([
                    'tournament_id' => $f11->id,
                    'tournament_team_id' => $tt->id,
                    'player_id' => $p->id,
                    'jersey_number' => $jersey,
                    'position' => $positions[array_rand($positions)],
                    'joined_at' => now()->toDateString(),
                ]);
                $jersey++;
            }
        }

        // ── Matches (4 per tournament = 8) ──
        foreach (['f5' => $f5, 'f11' => $f11] as $key => $tournament) {
            $tTeams = $key === 'f5' ? $f5Teams : $f11Teams;

            for ($i = 0; $i < 4; $i++) {
                TournamentMatch::factory()->create([
                    'tournament_id' => $tournament->id,
                    'home_team_id' => $tTeams[$i]->id,
                    'away_team_id' => $tTeams[$i + 5]->id,
                    'referee_id' => $referee->id,
                ]);
            }
        }
    }
}
