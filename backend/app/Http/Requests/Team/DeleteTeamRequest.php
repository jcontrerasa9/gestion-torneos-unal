<?php

namespace App\Http\Requests\Team;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        if ($this->user()->id !== $team->captain_id && $this->user()->role->name !== 'admin') {
            throw new AuthorizationException('You can only delete your own team.');
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
