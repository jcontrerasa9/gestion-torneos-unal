<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Models\User;
use Database\Factories\TeamFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // Explicit test users with known credentials
        User::factory()->asAdmin()->create([
            'email' => 'admin@unal.edu.co',
            'first_name' => 'Admin',
            'last_name' => 'UNAL',
        ]);

        $referee = User::factory()->asReferee()->create([
            'email' => 'referee@unal.edu.co',
            'first_name' => 'Árbitro',
            'last_name' => 'UNAL',
        ]);

        User::factory()->asStudent()->create([
            'email' => 'student@unal.edu.co',
            'first_name' => 'Estudiante',
            'last_name' => 'UNAL',
        ]);

        $captainFixed = User::factory()->asCaptain()->create([
            'email' => 'captain@unal.edu.co',
            'first_name' => 'Capitán',
            'last_name' => 'UNAL',
        ]);

        User::factory()->asPlayer()->create([
            'email' => 'player@unal.edu.co',
            'first_name' => 'Jugador',
            'last_name' => 'UNAL',
        ]);

        // Remaining captains with generated emails so we have 5 teams
        $randomCaptains = User::factory()->asCaptain()->count(4)->create();
        $allCaptains = $randomCaptains->prepend($captainFixed);

        $allCaptains->each(fn (User $captain) => (new TeamFactory)->create(['captain_id' => $captain->id])
        );

        // Remaining players
        User::factory()->asPlayer()->count(4)->create();

        // Tournaments
        $pending = Tournament::factory()->create(['name' => 'Liga BetPlay Apertura', 'status' => 'pendiente']);
        $active = Tournament::factory()->create(['name' => 'Torneo Universitario', 'status' => 'en_curso']);
        $finished = Tournament::factory()->create(['name' => 'Copa Colombia', 'status' => 'finalizado']);

        // Matches per tournament
        $teams = Team::all();

        foreach ([$pending, $active, $finished] as $tournament) {
            for ($i = 0; $i < 4; $i++) {
                TournamentMatch::factory()->create([
                    'tournament_id' => $tournament->id,
                    'home_team_id' => $teams[$i]->id,
                    'away_team_id' => $teams[$i + 1]->id,
                    'referee_id' => $referee->id,
                ]);
            }
        }

        // TournamentTeam enrollment
        $pendingTournament = Tournament::where('status', 'pendiente')->first();
        $seedTeams = Team::query()->take(3)->get();

        if ($pendingTournament && $seedTeams->isNotEmpty()) {
            foreach ($seedTeams as $seedTeam) {
                TournamentTeam::firstOrCreate(
                    [
                        'tournament_id' => $pendingTournament->id,
                        'team_id' => $seedTeam->id,
                    ],
                    [
                        'status' => 'pendiente',
                        'request_date' => now()->toDateString(),
                        'approval_date' => null,
                    ]
                );
            }
        }
    }
}
