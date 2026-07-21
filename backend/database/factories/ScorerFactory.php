<?php

namespace Database\Factories;

use App\Models\Scorer;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScorerFactory extends Factory
{
    protected $model = Scorer::class;

    public function definition(): array
    {
        return [
            'tournament_id' => Tournament::factory(),
            'player_id' => User::factory()->asPlayer(),
            'goals' => $this->faker->numberBetween(1, 12),
        ];
    }
}
