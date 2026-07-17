<?php

namespace Tests\Feature;

use App\Models\PlayerRequest;
use App\Models\Role;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentTeam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function seedRoles(): void
    {
        $roles = ['admin', 'captain', 'player', 'referee', 'student'];

        foreach ($roles as $name) {
            Role::create(['name' => $name]);
        }
    }

    public function test_user_can_register_and_receives_a_token(): void
    {
        $this->seedRoles();
        $student = Role::where('name', 'student')->first();

        $response = $this->postJson('/api/register', [
            'first_name' => 'Juan',
            'last_name' => 'Perez',
            'email' => 'juan@unal.edu.co',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'email', 'role'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'juan@unal.edu.co']);
        $this->assertSame($student->id, $response->json('user.role.id'));
    }

    public function test_register_validates_required_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $this->seedRoles();
        User::factory()->create([
            'email' => 'login@unal.edu.co',
            'password' => 'password123',
            'active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@unal.edu.co',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user' => ['id', 'email', 'role'], 'token']);
    }

    public function test_login_with_invalid_credentials_returns_401(): void
    {
        $this->seedRoles();
        User::factory()->create([
            'email' => 'bad@unal.edu.co',
            'password' => 'password123',
            'active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bad@unal.edu.co',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->seedRoles();
        User::factory()->create([
            'email' => 'inactive@unal.edu.co',
            'password' => 'password123',
            'active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@unal.edu.co',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_fetch_self(): void
    {
        $this->seedRoles();
        $user = User::factory()->create(['active' => true]);
        $user->role()->associate(Role::where('name', 'player')->first())->save();

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('role.name', 'player');
    }

    public function test_logout_revokes_current_token(): void
    {
        $this->seedRoles();
        $user = User::factory()->create(['active' => true]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout');

        $response->assertStatus(204);
        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_protected_endpoints_require_authentication(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_player_cannot_attempt_to_change_status_on_update_request(): void
    {
        $this->seedRoles();

        $player = User::factory()->create(['active' => true]);
        $player->role()->associate(Role::where('name', 'player')->first())->save();

        $tournament = Tournament::factory()->create(['status' => 'pendiente']);
        $team = Team::factory()->create();
        $tournamentTeam = TournamentTeam::create([
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'status' => 'pendiente',
            'request_date' => now()->toDateString(),
            'approval_date' => null,
        ]);
        $playerRequest = PlayerRequest::create([
            'tournament_team_id' => $tournamentTeam->id,
            'player_id' => $player->id,
            'status' => 'pendiente',
            'request_date' => now()->toDateString(),
            'approval_date' => null,
        ]);

        $token = $player->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/player-requests/'.$playerRequest->id, [
                'status' => 'aprobada',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Players cannot approve or reject requests.');
    }

    public function test_captain_cannot_attempt_to_change_status_on_update_request_for_other_team(): void
    {
        $this->seedRoles();

        $captain = User::factory()->create(['active' => true]);
        $captain->role()->associate(Role::where('name', 'captain')->first())->save();

        $otherCaptain = User::factory()->create(['active' => true]);
        $otherCaptain->role()->associate(Role::where('name', 'captain')->first())->save();

        $player = User::factory()->create(['active' => true]);
        $player->role()->associate(Role::where('name', 'player')->first())->save();

        $tournament = Tournament::factory()->create(['status' => 'pendiente']);
        $team = Team::factory()->create(['captain_id' => $otherCaptain->id]);
        $tournamentTeam = TournamentTeam::create([
            'tournament_id' => $tournament->id,
            'team_id' => $team->id,
            'status' => 'pendiente',
            'request_date' => now()->toDateString(),
            'approval_date' => null,
        ]);
        $playerRequest = PlayerRequest::create([
            'tournament_team_id' => $tournamentTeam->id,
            'player_id' => $player->id,
            'status' => 'pendiente',
            'request_date' => now()->toDateString(),
            'approval_date' => null,
        ]);

        $token = $captain->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/player-requests/'.$playerRequest->id, [
                'status' => 'aprobada',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You can only update requests for your own team.');
    }
}
