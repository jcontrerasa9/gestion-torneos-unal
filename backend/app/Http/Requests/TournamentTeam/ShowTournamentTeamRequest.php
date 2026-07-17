<?php

namespace App\Http\Requests\TournamentTeam;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ShowTournamentTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $request = $this->route('tournamentTeam') ?? $this->route('tournament_team');
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'captain') {
            $team = $request?->team;

            if ($team && $team->captain_id === $user->id) {
                return true;
            }

            throw new AuthorizationException('You can only view requests for your own teams.');
        }

        throw new AuthorizationException('You are not authorized to view this request.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [];
    }
}
