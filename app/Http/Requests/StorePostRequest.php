<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'           => 'required|string|max:200',
            'content'         => 'required|string',
            'category_id'     => 'required|exists:categories,id',
            'content_type_id' => 'required|exists:content_types,id',
            'status'          => 'nullable|in:published,draft,archived',
            
            // ✅ FLEXIBILIDAD TOTAL: 
            // Validamos 'image' (singular) para que tu formulario actual funcione YA.
            // Validamos 'images' (arreglo) para que la nueva galería también funcione.
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            
            'images'          => 'nullable|array|max:3',
            'images.*'        => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Toda obra maestra necesita un título.',
            'content.required' => 'Debes incluir una descripción o historia de tu obra.',
            'image.image'      => 'El archivo de arte debe ser una imagen válida.',
            'images.max'       => 'Solo puedes subir un máximo de 3 imágenes.',
            'images.*.image'   => 'Uno de los archivos de arte no es una imagen válida.',
            'images.*.max'     => 'Un archivo excede el límite de 5MB.',
        ];
    }
    
    /**
     * 🔥 Gancho de seguridad: Si no viene nada, lanzamos error manual
     * para asegurar que al menos una de las dos llaves tenga contenido.
     */
    protected function passedValidation()
    {
        if (!$this->hasFile('image') && !$this->hasFile('images')) {
            abort(response()->json([
                'message' => 'Debes subir al menos la imagen matriz de tu obra.',
                'errors' => ['image' => ['Se requiere una imagen matriz.']]
            ], 422));
        }
    }
}