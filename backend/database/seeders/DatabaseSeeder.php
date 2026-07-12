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

        $adminRole = Role::where('name', 'admin')->first();

        User::firstOrCreate(
            ['email' => 'admin@unal.edu.co'],
            [
                'role_id' => $adminRole->id,
                'first_name' => 'Admin',
                'last_name' => 'UNAL',
                'password' => 'password',
                'phone' => null,
                'active' => true,
            ]
        );
    }
}
