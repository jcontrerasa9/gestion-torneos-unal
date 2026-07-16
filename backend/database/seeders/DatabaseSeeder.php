<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Factories\TeamFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class); // roles estaticos


        // # Datos de prueba:

        User::factory()->asAdmin()->create(['email' => 'admin@unal.edu.co']); // crea 1 admin
        User::factory()->asReferee()->create(['email' => 'referee@unal.edu.co']); // crea 1 arbitro

        
        $captains = User::factory()->asCaptain()->count(5)->create(); // crea 5 capitanes 
        $captains->each(fn (User $captain) =>
            (new TeamFactory())->create(['captain_id' => $captain->id]) // para cada capitan un equipo
        );

        
        User::factory()->asPlayer()->count(5)->create(); // crea 5 juagdores 
    }
}
