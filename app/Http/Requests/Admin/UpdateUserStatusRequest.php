<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo el admin puede ejecutar esto (el middleware 'admin' ya lo protege a nivel de ruta)
        return auth()->user() && auth()->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:active,suspended,inactive']
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Debe especificar el nuevo estado del usuario.',
            'status.in' => 'El estado debe ser: active, suspended o inactive.',
        ];
    }
}