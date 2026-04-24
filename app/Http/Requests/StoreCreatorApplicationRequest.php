<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCreatorApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'proposed_type' => 'required|in:artist,cultural_manager,educator',
            'portfolio_url' => 'nullable|url|max:255',
            // 🔥 LÍMITE AMPLIADO A 20MB (20480 KB) PARA PORTAFOLIOS PESADOS
            'evidence_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:20480', 
            'message'       => 'required|string|min:20|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'proposed_type.in' => 'El tipo de creador seleccionado no es válido.',
            'portfolio_url.url' => 'El enlace del portafolio debe ser una URL válida (ej: https://instagram.com/tu_perfil).',
            'evidence_file.mimes' => 'La evidencia debe ser un PDF o una imagen (JPG/PNG).',
            'evidence_file.max' => 'El portafolio es demasiado pesado. El límite máximo es 20MB.',
            'message.min' => 'Tu carta de motivación debe tener al menos 20 caracteres.',
        ];
    }
}