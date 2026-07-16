<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Factories\TeamFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // Users
        User::factory()->asAdmin()->create(['email' => 'admin@unal.edu.co']);
        User::factory()->asReferee()->create(['email' => 'referee@unal.edu.co']);

        $captains = User::factory()->asCaptain()->count(5)->create();
        $captains->each(fn (User $captain) =>
            (new TeamFactory())->create(['captain_id' => $captain->id])
        );

        User::factory()->asPlayer()->count(5)->create();

        // Tournaments
        $pending = Tournament::factory()->create(['name' => 'Liga BetPlay Apertura', 'status' => 'pendiente']);
        $active = Tournament::factory()->create(['name' => 'Torneo Universitario', 'status' => 'en_curso']);
        $finished = Tournament::factory()->create(['name' => 'Copa Colombia', 'status' => 'finalizado']);

        // Matches per tournament
        $teams = Team::all();
        $referee = User::where('role_id', '=', 4)->first();

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
    }
}
