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
            // 🔥 BLINDAJE MULTI-IMAGEN (Opcional al actualizar)
            'images'         => 'nullable|array|max:3',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'images.max'     => 'No puedes exceder el límite de 3 imágenes en la galería.',
            'images.*.image' => 'El archivo debe ser una imagen válida.',
            'images.*.max'   => 'Las fotos del producto no pueden superar los 5MB.',
        ];
    }
}