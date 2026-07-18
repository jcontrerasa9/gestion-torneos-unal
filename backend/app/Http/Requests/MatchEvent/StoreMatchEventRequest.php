<?php

namespace App\Http\Requests\MatchEvent;

use Illuminate\Foundation\Http\FormRequest;

class StoreMatchEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'match_id' => ['required', 'integer', 'exists:tournament_matches,id'],
            'player_id' => ['required', 'integer', 'exists:users,id'],
            'event_type' => ['required', 'string', 'in:gol,tarjeta_amarilla,tarjeta_roja,sustitucion'],
            'minute' => ['required', 'integer', 'min:0', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'match_id.required' => 'The match is required.',
            'match_id.exists' => 'The specified match does not exist.',
            'player_id.required' => 'The player is required.',
            'player_id.exists' => 'The specified player does not exist.',
            'event_type.required' => 'The event type is required.',
            'event_type.in' => 'The event type must be one of: gol, tarjeta_amarilla, tarjeta_roja, sustitucion.',
            'minute.required' => 'The minute is required.',
            'minute.integer' => 'The minute must be a valid integer.',
            'minute.min' => 'The minute cannot be negative.',
            'minute.max' => 'The minute cannot exceed 120.',
            'description.max' => 'The description must not exceed 500 characters.',
        ];
    }
}
