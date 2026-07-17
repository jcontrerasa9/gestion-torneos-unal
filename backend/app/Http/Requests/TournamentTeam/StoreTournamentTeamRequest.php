<?php

namespace App\Http\Requests\TournamentTeam;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTournamentTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'captain') {
            return true;
        }

        throw new AuthorizationException('Only admins and captains can create tournament team requests.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $user = $this->user();
        $roleName = $user->role->name;

        $rules = [
            'tournament_id' => ['required', 'integer', Rule::exists('tournaments', 'id')],
            'team_id' => ['required', 'integer', Rule::exists('teams', 'id')],
        ];

        if ($roleName === 'captain') {
            $rules['tournament_id'] = [
                'required',
                'integer',
                Rule::exists('tournaments', 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $tournament = \App\Models\Tournament::find($value);

                    if ($tournament && $tournament->status !== 'pendiente') {
                        $fail('Only tournaments with pending status can be requested.');
                    }
                },
            ];

            $rules['team_id'] = [
                'required',
                'integer',
                Rule::exists('teams', 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $team = \App\Models\Team::find($value);

                    if ($team && $team->captain_id !== $this->user()->id) {
                        $fail('You can only request your own teams.');
                    }
                },
            ];

            $rules['tournament_id'][] = function (string $attribute, mixed $value, \Closure $fail): void {
                $exists = \App\Models\TournamentTeam::where('tournament_id', $value)
                    ->where('team_id', $this->input('team_id'))
                    ->exists();

                if ($exists) {
                    $fail('The same team cannot request the same tournament twice.');
                }
            };
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tournament_id.required' => 'The tournament is required.',
            'tournament_id.integer' => 'The tournament ID must be a valid integer.',
            'tournament_id.exists' => 'The selected tournament does not exist.',
            'team_id.required' => 'The team is required.',
            'team_id.integer' => 'The team ID must be a valid integer.',
            'team_id.exists' => 'The selected team does not exist.',
        ];
    }
}
