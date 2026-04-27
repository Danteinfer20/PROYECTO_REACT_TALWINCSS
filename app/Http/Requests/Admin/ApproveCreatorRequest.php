<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApproveCreatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->user_type === 'admin';
    }

    public function rules(): array
    {
        return [
            // Validamos que el rol esté dentro de los permitidos en la arquitectura
            'assigned_role' => [
                'required', 
                'string', 
                Rule::in(['artist', 'cultural_manager', 'educator'])
            ]
        ];
    }
    
    public function messages(): array
    {
        return [
            'assigned_role.required' => 'Es obligatorio asignar un rol para el ascenso.',
            'assigned_role.in' => 'El rol seleccionado no pertenece al ecosistema verificado.',
        ];
    }
}