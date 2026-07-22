<?php

namespace App\Http\Requests\PlayerRequest;

use App\Models\TournamentTeam;
use App\Models\User;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlayerRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user->role->name !== 'player') {
            throw new AuthorizationException('Only players can create player requests.');
        }

        if ($this->input('player_id') != $user->id) {
            throw new AuthorizationException('You can only create requests for yourself.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'tournament_team_id' => [
                'required',
                'integer',
                Rule::exists('tournament_teams', 'id'),
                function (string $attribute, mixed $value, Closure $fail): void {
                    $tournamentTeam = TournamentTeam::find($value);

                    if (! $tournamentTeam) {
                        return;
                    }

                    // No puede solicitar un equipo que ya capitanea
                    if ($tournamentTeam->team && $tournamentTeam->team->captain_id === $this->user()->id) {
                        $fail('You cannot request admission to a team you already captain.');
                        return;
                    }

                    // El torneo debe estar activo
                    if ($tournamentTeam->tournament->status !== 'en_curso') {
                        $fail('You can only request admission to teams in an active tournament.');
                        return;
                    }

                    // El jugador no puede estar inscrito en otro equipo del mismo torneo
                    $alreadyEnrolled = \App\Models\TournamentTeamPlayer::where('player_id', $this->input('player_id'))
                        ->where('tournament_id', $tournamentTeam->tournament_id)
                        ->exists();

                    if ($alreadyEnrolled) {
                        $fail('The player is already enrolled in another team in this tournament.');
                    }
                },
            ],
            'player_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
                function (string $attribute, mixed $value, Closure $fail): void {
                    $user = User::find($value);

                    if ($user && $user->role->name !== 'player') {
                        $fail('The selected user must have the player role.');
                    }
                },
            ],
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'position' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:pendiente,aprobada,rechazada'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tournament_team_id.required' => 'The tournament team is required.',
            'tournament_team_id.integer' => 'The tournament team ID must be a valid integer.',
            'tournament_team_id.exists' => 'The selected tournament team does not exist.',
            'player_id.required' => 'The player is required.',
            'player_id.integer' => 'The player ID must be a valid integer.',
            'player_id.exists' => 'The selected player does not exist.',
            'jersey_number.integer' => 'The jersey number must be an integer.',
            'jersey_number.min' => 'The jersey number must be at least 1.',
            'jersey_number.max' => 'The jersey number must not exceed 99.',
            'position.string' => 'The position must be a string.',
            'position.max' => 'The position must not exceed 100 characters.',
            'status.in' => 'The status must be one of: pendiente, aprobada, rechazada.',
        ];
    }
}