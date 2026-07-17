<?php

namespace App\Http\Requests\TournamentTeam;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteTournamentTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $request = $this->route('tournamentTeam');
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'captain') {
            $team = $request->team;

            if ($team && $team->captain_id === $user->id && $request->status === 'pendiente') {
                return true;
            }

            throw new AuthorizationException('You can only delete pending requests for your own teams.');
        }

        throw new AuthorizationException('You are not authorized to delete this request.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [];
    }
}
