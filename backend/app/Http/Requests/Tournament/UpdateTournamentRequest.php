<?php

namespace App\Http\Requests\Tournament;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()->role->name !== 'admin') {
            throw new AuthorizationException('Only admins can update tournaments.');
        }

        return true;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        $tournamentId = $this->route('tournament')->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tournaments', 'name')->ignore($tournamentId)],
            'modality' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'start_date' => ['sometimes', 'required', 'date', 'after_or_equal:today'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'string', 'in:pendiente,en_curso,finalizado,cancelado'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The tournament name is required.',
            'name.string' => 'The tournament name must be a string.',
            'name.max' => 'The tournament name must not exceed 255 characters.',
            'name.unique' => 'A tournament with that name already exists.',
            'modality.required' => 'The tournament modality is required.',
            'modality.string' => 'The modality must be a string.',
            'modality.max' => 'The modality must not exceed 100 characters.',
            'description.string' => 'The description must be a string.',
            'start_date.required' => 'The start date is required.',
            'start_date.date' => 'The start date must be a valid date.',
            'start_date.after_or_equal' => 'The start date must be today or later.',
            'end_date.required' => 'The end date is required.',
            'end_date.date' => 'The end date must be a valid date.',
            'end_date.after_or_equal' => 'The end date must be after or equal to the start date.',
            'status.required' => 'The tournament status is required.',
            'status.in' => 'The status must be one of: pendiente, en_curso, finalizado, cancelado.',
        ];
    }
}
