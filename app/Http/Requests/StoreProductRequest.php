<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:200',
            'description'    => 'required|string',
            'category_id'    => 'required|exists:categories,id',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'product_type'   => 'required|in:physical,digital,service,handicraft',
            'images'         => 'required|array|min:1|max:3',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120', 
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'Debes subir al menos una foto principal para el producto.',
            'images.max'      => 'Solo puedes subir un máximo de 3 imágenes por producto.',
            'images.*.image'  => 'Todos los archivos deben ser imágenes válidas (JPEG, PNG, WEBP).',
            'images.*.max'    => 'Ninguna fotografía puede superar los 5MB de peso.',
            'product_type.in' => 'El tipo de producto seleccionado no es válido en nuestra base de datos.',
        ];
    }
}