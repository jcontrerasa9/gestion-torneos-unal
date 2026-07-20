<?php

namespace App\Http\Requests\MatchEvent;

use App\Models\TournamentMatch;
use App\Models\TournamentTeamPlayer;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()->role->name;

        if ($role !== 'admin' && $role !== 'referee') {
            throw new AuthorizationException('Only admins and referees can update match events.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'match_id' => ['sometimes', 'required', 'integer', 'exists:tournament_matches,id'],
            'player_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:users,id',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $matchId = $this->input('match_id');

                    if (! $matchId) {
                        $event = $this->route('event');
                        $matchId = $event?->match_id;
                    }

                    if ($matchId) {
                        $match = TournamentMatch::find($matchId);

                        if ($match) {
                            $enrolled = TournamentTeamPlayer::where('player_id', $value)
                                ->where('tournament_id', $match->tournament_id)
                                ->exists();

                            if (! $enrolled) {
                                $fail('The player is not enrolled in this tournament.');
                            }
                        }
                    }
                },
            ],
            'event_type' => ['sometimes', 'required', 'string', 'in:gol,tarjeta_amarilla,tarjeta_roja,sustitucion'],
            'minute' => ['sometimes', 'required', 'integer', 'min:0', 'max:120'],
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
