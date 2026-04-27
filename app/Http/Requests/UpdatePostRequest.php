<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdatePostRequest
 * * Gestiona la validación para la edición de Obras de Arte y Publicaciones.
 * Corregida la colisión de nombres para evitar conflictos con la Tienda.
 */
class UpdatePostRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación aplicadas a la solicitud.
     * Se usa 'sometimes' para permitir actualizaciones parciales (PATCH).
     */
    public function rules(): array
    {
        return [
            'title'       => 'sometimes|required|string|max:255',
            'content'     => 'sometimes|required|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'status'      => 'sometimes|required|in:published,draft,archived',
            
            // Gestión de Imagen Matriz
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            
            // Diccionario Técnico (Nivel 2) - Opcional según la lógica de Posts
            'content_type_id' => 'sometimes|nullable|exists:content_types,id',
        ];
    }

    /**
     * Mensajes de error personalizados.
     */
    public function messages(): array
    {
        return [
            'title.required'    => 'El título de la obra es obligatorio.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',
            'status.in'         => 'El estado debe ser: publicado, borrador o archivado.',
            'image.image'       => 'El archivo debe ser una imagen válida.',
            'image.max'         => 'La imagen no puede superar los 5MB.',
        ];
    }
}