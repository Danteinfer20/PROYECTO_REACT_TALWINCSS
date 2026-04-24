<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ApproveCreatorRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize()
    {
        // Solo permite la ejecución si el usuario logueado es admin
        return auth()->user()->user_type === 'admin';
    }

    /**
     * Reglas de validación aplicadas a la petición.
     */
    public function rules()
    {
        return [
            // Estos valores coinciden exactamente con el CHECK de tu esquema SQL
            'assigned_role' => 'required|string|in:artist,cultural_manager,educator'
        ];
    }
    
    public function messages()
    {
        return [
            'assigned_role.required' => 'Debes especificar el rol a asignar.',
            'assigned_role.in' => 'El rol asignado no es válido en el sistema.'
        ];
    }
}