<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToggleSavedItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autenticación manejada por middleware (Sanctum)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Validamos que el post_id sea requerido, entero y exista en la tabla posts
            'post_id' => ['required', 'integer', 'exists:posts,id'],
        ];
    }

    /**
     * Mensajes de error amigables.
     */
    public function messages(): array
    {
        return [
            'post_id.required' => 'El ID de la obra es requerido.',
            'post_id.exists' => 'La obra que intentas guardar no se encuentra en nuestros registros.',
        ];
    }
}