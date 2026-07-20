<?php

namespace App\Http\Requests\TournamentTeamPlayer;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ShowTournamentTeamPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $enrollment = $this->route('tournamentTeamPlayer');
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'captain') {
            $isCaptainOfTeam = $enrollment->tournamentTeam
                && $enrollment->tournamentTeam->team
                && $enrollment->tournamentTeam->team->captain_id === $user->id;

            if ($isCaptainOfTeam) {
                return true;
            }

            throw new AuthorizationException('You can only view players in your own teams.');
        }

        if ($roleName === 'player') {
            if ($enrollment->player_id === $user->id) {
                return true;
            }

            throw new AuthorizationException('You can only view your own enrollments.');
        }

        throw new AuthorizationException('You are not authorized to view this enrollment.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [];
    }
}
