<?php

namespace App\Http\Requests\MatchEvent;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteMatchEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()->role->name;

        if ($role !== 'admin' && $role !== 'referee') {
            throw new AuthorizationException('Only admins and referees can delete match events.');
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
