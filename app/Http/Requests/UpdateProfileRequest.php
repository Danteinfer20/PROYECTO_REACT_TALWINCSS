<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool 
    { 
        return true; 
    }

    /**
     * Reglas de validación para la actualización del perfil.
     */
    public function rules(): array
    {
        return [
            'name'         => 'nullable|string|max:150',
            'bio'          => 'nullable|string',
            'phone'        => 'nullable|string|max:20',
            'neighborhood' => 'nullable|string|max:100',
            'city'         => 'nullable|string|max:100',
            'website'      => 'nullable|string|max:255',
            'birth_date'   => 'nullable|date',
            'gender'       => 'nullable|string|max:20',
            'social_media' => 'nullable|json', 
            
            // 🔥 ESCUDO ACTIVADO: Nombres alineados con la DB, React y Cloudinary
            // Aceptamos hasta 5MB (5120 KB), Cloudinary se encargará de comprimirlas después.
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',      
            'cover_picture'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
    
    /**
     * Mensajes personalizados de error (Opcional, pero da un toque Senior a tu API)
     */
    public function messages(): array
    {
        return [
            'profile_picture.image' => 'El archivo de perfil debe ser una imagen válida.',
            'profile_picture.max'   => 'La foto de perfil no puede pesar más de 5MB.',
            'cover_picture.image'   => 'El archivo de portada debe ser una imagen válida.',
            'cover_picture.max'     => 'La foto de portada no puede pesar más de 5MB.',
        ];
    }
}