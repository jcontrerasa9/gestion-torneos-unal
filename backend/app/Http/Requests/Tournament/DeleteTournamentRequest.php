<?php

namespace App\Http\Requests\Tournament;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()->role->name !== 'admin') {
            throw new AuthorizationException('Only admins can delete tournaments.');
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
