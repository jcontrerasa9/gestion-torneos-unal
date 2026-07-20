<?php

namespace App\Http\Requests\Suspension;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class DeleteSuspensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()->role->name;

        if (! in_array($role, ['admin', 'referee'])) {
            throw new AuthorizationException('Only admins and referees can cancel suspensions.');
        }

        $suspension = $this->route('suspension');

        if ($suspension->triggered_by_match_id !== null) {
            throw new AuthorizationException('Automatic suspensions cannot be cancelled manually.');
        }

        if ($suspension->status !== 'activa') {
            throw new AuthorizationException('Only active suspensions can be cancelled.');
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
