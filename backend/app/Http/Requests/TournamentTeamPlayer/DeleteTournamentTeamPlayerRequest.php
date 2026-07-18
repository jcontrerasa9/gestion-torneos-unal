<?php

namespace App\Http\Requests\TournamentTeamPlayer;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteTournamentTeamPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()->role->name !== 'admin') {
            throw new AuthorizationException('Only admins can remove tournament team players.');
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
