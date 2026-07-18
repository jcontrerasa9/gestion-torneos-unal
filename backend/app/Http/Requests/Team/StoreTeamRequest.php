<?php

namespace App\Http\Requests\Team;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, ValidationRule|string>>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:100', 'unique:teams,name'],
            'logo' => ['nullable', 'string', 'max:255'],
        ];

        if ($this->user()->role->name === 'admin') {
            $rules['captain_id'] = [
                'nullable',
                'integer',
                Rule::exists('users', 'id'),
                function (string $attribute, mixed $value, Closure $fail): void {
                    $user = User::find($value);

                    if ($user && $user->role->name !== 'captain') {
                        $fail('El usuario seleccionado debe tener rol de capitán.');
                    }
                },
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
            'name.required' => 'The team name is required.',
            'name.string' => 'The team name must be a string.',
            'name.max' => 'The team name must not exceed 100 characters.',
            'name.unique' => 'A team with that name already exists.',
            'logo.string' => 'The logo must be a string URL.',
            'logo.max' => 'The logo URL must not exceed 255 characters.',
            'captain_id.integer' => 'The captain ID must be a valid integer.',
            'captain_id.exists' => 'The specified user does not exist.',
        ];
    }
}
