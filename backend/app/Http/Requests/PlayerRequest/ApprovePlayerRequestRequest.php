<?php

namespace App\Http\Requests\PlayerRequest;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class ApprovePlayerRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $playerRequest = $this->route('playerRequest');

        if ($user->role->name === 'admin') {
            return true;
        }

        if ($user->role->name !== 'captain') {
            throw new AuthorizationException('Only captains and admins can approve player requests.');
        }

        $isCaptainOfTeam = $playerRequest->tournamentTeam
            && $playerRequest->tournamentTeam->team
            && $playerRequest->tournamentTeam->team->captain_id === $user->id;

        if (! $isCaptainOfTeam) {
            throw new AuthorizationException('You can only approve requests for your own team.');
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
