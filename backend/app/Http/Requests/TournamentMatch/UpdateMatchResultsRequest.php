<?php

namespace App\Http\Requests\TournamentMatch;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $match = $this->route('match');

        if ($user->role->name === 'admin') {
            return true;
        }

        if ($user->role->name !== 'referee') {
            throw new AuthorizationException('Only referees can update match results.');
        }

        if ($match->referee_id !== $user->id) {
            throw new AuthorizationException('You can only update results for matches you are assigned to.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'home_score' => ['required', 'integer', 'min:0'],
            'away_score' => ['required', 'integer', 'min:0'],
            'observations' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'string', 'in:finalizado'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'home_score.required' => 'The home score is required.',
            'home_score.integer' => 'The home score must be a valid integer.',
            'home_score.min' => 'The home score cannot be negative.',
            'away_score.required' => 'The away score is required.',
            'away_score.integer' => 'The away score must be a valid integer.',
            'away_score.min' => 'The away score cannot be negative.',
            'observations.max' => 'The observations must not exceed 1000 characters.',
            'status.in' => 'The status must be: finalizado.',
        ];
    }
}
