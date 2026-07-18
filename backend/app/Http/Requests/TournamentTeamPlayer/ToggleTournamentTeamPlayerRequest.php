<?php

namespace App\Http\Requests\TournamentTeamPlayer;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ToggleTournamentTeamPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $enrollment = $this->route('enrollment');

        if ($user->role->name === 'admin') {
            return true;
        }

        if ($user->role->name !== 'captain') {
            throw new AuthorizationException('Only captains and admins can toggle player status.');
        }

        $isCaptainOfTeam = $enrollment->tournamentTeam
            && $enrollment->tournamentTeam->team
            && $enrollment->tournamentTeam->team->captain_id === $user->id;

        if (! $isCaptainOfTeam) {
            throw new AuthorizationException('You can only toggle status for players in your own team.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [];
    }
}
