<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectCreatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            // Exigimos un motivo claro para la auditoría (mínimo 10 caracteres)
            'rejection_reason' => ['required', 'string', 'min:10', 'max:1000']
        ];
    }
    
    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'El motivo de rechazo es estrictamente obligatorio.',
            'rejection_reason.min' => 'El motivo debe ser claro y detallado (mínimo 10 caracteres).',
            'rejection_reason.max' => 'El motivo excede el límite de 1000 caracteres permitidos.'
        ];
    }
}