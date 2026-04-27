<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            // 'suspended' es crítico para la seguridad de la plataforma
            'status' => [
                'required', 
                'string', 
                Rule::in(['active', 'suspended', 'inactive'])
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Debe definir el nuevo estado operativo del usuario.',
            'status.in' => 'El estado debe ser: active, suspended o inactive.',
        ];
    }
}