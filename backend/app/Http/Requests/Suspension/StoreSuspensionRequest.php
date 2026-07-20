<?php

namespace App\Http\Requests\Suspension;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSuspensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()->role->name;

        return in_array($role, ['admin', 'referee']);
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'tournament_id' => ['required', 'integer', Rule::exists('tournaments', 'id')],
            'player_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'reason' => ['required', 'string', 'max:500'],
            'matches_suspended' => ['required', 'integer', 'min:1', 'max:10'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tournament_id.required' => 'The tournament is required.',
            'tournament_id.exists' => 'The selected tournament does not exist.',
            'player_id.required' => 'The player is required.',
            'player_id.exists' => 'The selected player does not exist.',
            'reason.required' => 'The reason is required.',
            'reason.max' => 'The reason must not exceed 500 characters.',
            'matches_suspended.required' => 'The number of matches suspended is required.',
            'matches_suspended.min' => 'The player must be suspended for at least 1 match.',
            'matches_suspended.max' => 'The suspension cannot exceed 10 matches.',
        ];
    }
}
