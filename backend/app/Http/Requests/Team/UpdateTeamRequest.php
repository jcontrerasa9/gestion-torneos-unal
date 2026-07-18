<?php

namespace App\Http\Requests\Team;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        if ($this->user()->id !== $team->captain_id && $this->user()->role->name !== 'admin') {
            throw new AuthorizationException('You can only update your own team.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, ValidationRule|string>>
     */
    public function rules(): array
    {
        $teamId = $this->route('team')->id;

        $rules = [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('teams', 'name')->ignore($teamId)],
            'logo' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];

        if ($this->user()->role->name === 'admin') {
            $rules['captain_id'] = ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')];
        }

        return $rules;
    }
}
