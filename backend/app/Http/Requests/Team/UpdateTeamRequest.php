<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        return $this->user()->id === $team->captain_id
            || $this->user()->role->name === 'admin';
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $teamId = $this->route('team')->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('teams', 'name')->ignore($teamId)],
            'logo' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
