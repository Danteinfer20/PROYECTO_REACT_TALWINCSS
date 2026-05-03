<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'           => 'sometimes|required|string|max:255',
            'content'         => 'sometimes|required|string',
            'category_id'     => 'sometimes|required|exists:categories,id',
            'content_type_id' => 'sometimes|nullable|exists:content_types,id',
            'status'          => 'sometimes|required|in:published,draft,archived',
            // 🔥 UNIFICACIÓN: Se permite actualizar la galería completa
            'images'          => 'nullable|array|max:3',
            'images.*'        => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'     => 'El título de la obra es obligatorio.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',
            'status.in'          => 'El estado debe ser: publicado, borrador o archivado.',
            'images.*.image'     => 'El archivo debe ser una imagen válida.',
            'images.*.max'       => 'La imagen no puede superar los 5MB.',
        ];
    }
}