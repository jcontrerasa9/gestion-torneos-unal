<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    private const FIRST_NAMES = [
        'Santiago', 'Valentina', 'Juan', 'Camila', 'Andrés', 'Mariana',
        'Sebastián', 'Daniela', 'Diego', 'Laura', 'Carlos', 'Ana',
        'Mateo', 'Paula', 'Nicolás', 'María', 'Alejandro', 'Juliana',
        'Daniel', 'Isabella', 'Mateo', 'Luciana', 'Samuel', 'Gabriela',
        'Tomás', 'Sophia', 'Lucas', 'Emma', 'Benjamín', 'Mía',
        'Simón', 'Catalina', 'Adrián', 'Victoria', 'Miguel', 'Sofía',
        'Julián', 'Alejandra', 'Felipe', 'Daniela', 'Andrés', 'Natalia',
        'David', 'Laura', 'Óscar', 'Carolina', 'Sergio', 'Andrea',
        'Jhon', 'Luisa', 'Brayan', 'Camila', 'Esteban', 'Valeria',
        'Kevin', 'Paula', 'Cristian', 'Daniela', 'Darío', 'Sandra',
        'Leandro', 'Tatiana', 'Ricardo', 'Claudia', 'Mauricio', 'Diana',
        'Giovanni', 'Rosa', 'Harold', 'Patricia', 'César', 'Martha',
        'Alonso', 'Cecilia', 'Emilio', 'Gloria', 'Pablo', 'Beatriz',
        'Raúl', 'Teresa', 'Jairo', 'Nancy', 'Hernán', 'Olga',
        'Edgar', 'Mónica', 'Gustavo', 'Angela', 'Roberto', 'Silvia',
        'Alfredo', 'Adriana', 'Hugo', 'Claudia', 'Reinaldo', 'Margaret',
        'Manuel', 'Elizabeth', 'Arturo', 'Rosa', 'Fernando', 'Amparo',
        'Ramiro', 'Helena', 'Eduardo', 'Isabel',
    ];

    private const LAST_NAMES = [
        'Rodríguez', 'López', 'Martínez', 'García', 'Hernández',
        'González', 'Ramírez', 'Torres', 'Flores', 'Rivera',
        'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz',
        'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos', 'Ruiz',
        'Álvarez', 'Mendoza', 'Castillo', 'Jiménez', 'Moreno',
        'Romero', 'Herrera', 'Medina', 'Aguilar', 'Vargas',
        'Castro', 'Patiño', 'Ospina', 'Londoño', 'Quintero',
        'Arango', 'Mejía', 'Giraldo', 'Betancur', 'Salazar',
    ];

    public function definition(): array
    {
        $firstName = fake()->randomElement(self::FIRST_NAMES);
        $lastName = fake()->randomElement(self::LAST_NAMES);

        return [
            'role_id' => null,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => strtolower($firstName . '.' . $lastName . '@unal.edu.co'),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => '3' . fake()->numerify('## ### ####'),
            'active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function asAdmin(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('name', 'admin')->first(),
        ]);
    }

    public function asCaptain(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('name', 'captain')->first(),
        ]);
    }

    public function asPlayer(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('name', 'player')->first(),
        ]);
    }

    public function asReferee(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('name', 'referee')->first(),
        ]);
    }

    public function asStudent(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('name', 'student')->first(),
        ]);
    }
}
