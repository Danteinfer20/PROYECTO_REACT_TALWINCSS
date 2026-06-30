<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * 🔥 FILTRO DE IDIOMA CORE (Arquitectura SRP)
     * Resuelve vacíos estrictos y previene colapsos (fuga JSON) en los <select> de React.
     */
    private function getLocalizedField(Request $request, $field)
    {
        $locale = $request->header('X-Localization', 'es');
        
        if (empty($field)) return null;

        $decoded = is_string($field) ? json_decode($field, true) : $field;

        // Si no es un JSON válido, devolvemos el string original
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            return $field; 
        }

        // Extracción inicial basada en el header del interceptor Axios
        $value = $decoded[$locale] ?? '';

        // Fallback matemático: Mecanismo de seguridad visual hacia el español
        if ($value === '') {
            $value = $decoded['es'] ?? '';
        }

        return $value;
    }

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->getLocalizedField($request, $this->name), // ➔ STRING LIMPIO
            'slug'          => $this->slug,
            'category_type' => $this->category_type,
            'color'         => $this->color,
            'is_active'     => (bool) $this->is_active,
        ];
    }
}