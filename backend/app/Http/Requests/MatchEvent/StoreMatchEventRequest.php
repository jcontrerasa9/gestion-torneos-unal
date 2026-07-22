<?php

namespace App\Http\Requests\MatchEvent;

use App\Models\TournamentMatch;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreMatchEventRequest extends FormRequest
{

    public function authorize(): bool
    {
        $user = $this->user();

        if ($user->role->name === 'admin') {
            return true;
        }

        if ($user->role->name !== 'referee') {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'Only referees can create match events.'
            );
        }

        $match = TournamentMatch::find($this->input('match_id'));

        if (! $match || $match->referee_id !== $user->id) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You can only create events for matches you are assigned to.'
            );
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'match_id' => ['required', 'integer', 'exists:tournament_matches,id'],
            'player_id' => [
                'required',
                'integer',
                'exists:users,id',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $matchId = $this->input('match_id');

                    if ($matchId) {
                        $match = TournamentMatch::find($matchId);

                        if ($match) {
                            $enrolled = \App\Models\TournamentTeamPlayer::where('player_id', $value)
                                ->where('tournament_id', $match->tournament_id)
                                ->exists();

                            if (! $enrolled) {
                                $fail('The player is not enrolled in this tournament.');
                            }
                        }
                    }
                },
            ],
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
