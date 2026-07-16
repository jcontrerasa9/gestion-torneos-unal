<?php

namespace App\Http\Requests\Team;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // siempre true, porque el middleware ya valida que sea admin o captain
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
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
                        $fail('The selected user must have the captain role.');
                    }
                },
            ];
        }

        return $rules;
    }
}
