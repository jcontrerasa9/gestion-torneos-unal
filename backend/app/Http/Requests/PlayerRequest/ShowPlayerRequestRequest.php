<?php

namespace App\Http\Requests\PlayerRequest;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ShowPlayerRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $request = $this->route('playerRequest');
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'player') {
            if ($request->player_id !== $user->id) {
                throw new AuthorizationException('You can only view your own requests.');
            }

            return true;
        }

        if ($roleName === 'captain') {
            $team = $request->tournamentTeam?->team;

            if ($team && $team->captain_id === $user->id) {
                return true;
            }

            throw new AuthorizationException('You can only view requests for your own team.');
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
