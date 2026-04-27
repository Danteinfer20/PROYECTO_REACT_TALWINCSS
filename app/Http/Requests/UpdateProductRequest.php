<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'           => 'sometimes|required|string|max:200',
            'description'    => 'sometimes|required|string',
            'category_id'    => 'sometimes|required|exists:categories,id',
            'price'          => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'product_type'   => 'sometimes|required|in:physical,digital,service,handicraft',
            'status'         => 'sometimes|required|in:available,sold_out,paused',
            
            // 🔥 GALERÍA UNIFICADA (Matriz + Vistas Extra)
            // Sincronizado con el Frontend: todo viaja en el array images[]
            'images'         => 'nullable|array|max:3',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'El nombre del producto es obligatorio.',
            'images.max'     => 'No puedes exceder el límite de 3 imágenes en total (incluyendo la matriz principal).',
            'images.*.image' => 'Todos los archivos deben ser imágenes válidas (JPEG, PNG, WEBP).',
            'images.*.max'   => 'Ninguna fotografía puede superar los 5MB de peso.',
        ];
    }
}