<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $users = [
            'admin' => ['Admin', 'UNAL'],
            'captain' => ['Capitan', 'UNAL'],
            'player' => ['Jugador', 'UNAL'],
            'referee' => ['Arbitro', 'UNAL'],
            'student' => ['Estudiante', 'UNAL'],
        ];

        foreach ($users as $roleName => $names) {
            $role = Role::where('name', $roleName)->first();

            User::firstOrCreate(
                ['email' => "{$roleName}@unal.edu.co"],
                [
                    'role_id' => $role->id,
                    'first_name' => $names[0],
                    'last_name' => $names[1],
                    'password' => 'password',
                    'phone' => null,
                    'active' => true,
                ]
            );
        }
    }
}
