<?php

namespace App\Http\Requests\TournamentTeam;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTournamentTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $request = $this->route('tournamentTeam');
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'captain') {
            $team = $request->team;

            if ($team && $team->captain_id === $user->id) {
                if ($request->status !== 'pendiente') {
                    throw new AuthorizationException('You can only update requests while they are pending.');
                }

                if ($this->has('status')) {
                    throw new AuthorizationException('Captains cannot modify the status field.');
                }

                return true;
            }

            throw new AuthorizationException('You can only update requests for your own teams.');
        }

        throw new AuthorizationException('You are not authorized to update this request.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $rules = [
            'status' => ['nullable', 'string', 'in:pendiente,aprobada,rechazada'],
        ];

        if ($this->user()->role->name === 'captain') {
            $rules = [];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.in' => 'The status must be one of: pendiente, aprobada, rechazada.',
        ];
    }
}
