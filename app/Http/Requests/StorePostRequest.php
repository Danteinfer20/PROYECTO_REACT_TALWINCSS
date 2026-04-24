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
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Toda obra maestra necesita un título.',
            'content.required' => 'Debes incluir una descripción o historia de tu obra.',
            'image.max'        => 'El archivo de arte excede el límite de 5MB permitido.',
        ];
    }
}