<?php

namespace App\Http\Requests\PlayerRequest;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePlayerRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $request = $this->route('playerRequest');
        $user = $this->user();
        $roleName = $user->role->name;

        if ($roleName === 'admin') {
            return true;
        }

        if ($roleName === 'player') {
            if ($request->player_id !== $user->id) {
                throw new AuthorizationException('You can only update your own requests.');
            }

            if ($request->status !== 'pendiente') {
                throw new AuthorizationException('You can only update pending requests.');
            }

            return true;
        }

        if ($roleName === 'captain') {
            $team = $request->tournamentTeam?->team;

            if ($team && $team->captain_id === $user->id) {
                $allowedFields = ['status'];
                $submittedFields = array_keys($this->all());

                if (array_diff($submittedFields, $allowedFields) !== []) {
                    throw new AuthorizationException('Captains can only update the status field.');
                }

                return true;
            }

            throw new AuthorizationException('You can only update requests for your own team.');
        }

        throw new AuthorizationException('You are not authorized to update this request.');
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $request = $this->route('playerRequest');
        $user = $this->user();
        $roleName = $user->role->name;

        $rules = [
            'jersey_number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'position' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:pendiente,aprobada,rechazada'],
        ];

        if ($roleName === 'captain') {
            $rules = [
                'status' => ['sometimes', 'required', 'string', 'in:pendiente,aprobada,rechazada'],
            ];
        }

        if ($roleName === 'player') {
            $rules = [
                'jersey_number' => ['sometimes', 'required', 'integer', 'min:1', 'max:99'],
                'position' => ['sometimes', 'required', 'string', 'max:100'],
            ];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'jersey_number.integer' => 'The jersey number must be an integer.',
            'jersey_number.min' => 'The jersey number must be at least 1.',
            'jersey_number.max' => 'The jersey number must not exceed 99.',
            'position.string' => 'The position must be a string.',
            'position.max' => 'The position must not exceed 100 characters.',
            'status.in' => 'The status must be one of: pendiente, aprobada, rechazada.',
            'status.required' => 'The status is required.',
        ];
    }
}
