<?php

namespace App\Http\Requests\TournamentMatch;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()->role->name !== 'admin') {
            throw new AuthorizationException('Only admins can update tournament matches.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $matchId = $this->route('match')->id;

        return [
            'tournament_id' => ['sometimes', 'required', 'integer', Rule::exists('tournaments', 'id')],
            'home_team_id' => ['sometimes', 'required', 'integer', Rule::exists('teams', 'id')],
            'away_team_id' => ['sometimes', 'required', 'integer', Rule::exists('teams', 'id'), 'distinct:home_team_id'],
            'referee_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'match_date' => ['sometimes', 'required', 'date'],
            'match_time' => ['sometimes', 'required', 'date_format:H:i'],
            'status' => ['sometimes', 'required', 'string', 'in:programado,en_juego,finalizado,aplazado'],
            'home_score' => ['nullable', 'integer', 'min:0'],
            'away_score' => ['nullable', 'integer', 'min:0'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tournament_id.required' => 'The tournament is required.',
            'tournament_id.exists' => 'The specified tournament does not exist.',
            'home_team_id.required' => 'The home team is required.',
            'home_team_id.exists' => 'The specified home team does not exist.',
            'away_team_id.required' => 'The away team is required.',
            'away_team_id.exists' => 'The specified away team does not exist.',
            'away_team_id.distinct' => 'The home and away teams must be different.',
            'referee_id.integer' => 'The referee ID must be a valid integer.',
            'referee_id.exists' => 'The specified user does not exist.',
            'match_date.required' => 'The match date is required.',
            'match_date.date' => 'The match date must be a valid date.',
            'match_time.required' => 'The match time is required.',
            'match_time.date_format' => 'The match time must be in HH:MM format.',
            'status.required' => 'The match status is required.',
            'status.in' => 'The status must be one of: programado, en_juego, finalizado, aplazado.',
            'home_score.integer' => 'The home score must be a valid integer.',
            'home_score.min' => 'The home score cannot be negative.',
            'away_score.integer' => 'The away score must be a valid integer.',
            'away_score.min' => 'The away score cannot be negative.',
            'observations.max' => 'The observations must not exceed 1000 characters.',
        ];
    }
}
