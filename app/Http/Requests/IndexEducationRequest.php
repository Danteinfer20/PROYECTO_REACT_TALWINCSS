<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Acceso público para leer el módulo Aprende
    }

    public function rules(): array
    {
        return [
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced',
            'area'       => 'nullable|string|max:100',
            'search'     => 'nullable|string|max:200',
            'per_page'   => 'nullable|integer|min:1|max:50',
        ];
    }
}