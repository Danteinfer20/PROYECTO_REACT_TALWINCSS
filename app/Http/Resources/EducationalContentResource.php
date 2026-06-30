<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationalContentResource extends JsonResource
{
    /**
     * 🔥 FILTRO DE IDIOMA CORE (Arquitectura SRP)
     * Purifica el JSON de la base de datos para entregar strings limpios a React.
     */
    private function getLocalizedField(Request $request, $field)
    {
        $locale = $request->header('X-Localization', 'es');
        
        if (empty($field)) return null;

        $decoded = is_string($field) ? json_decode($field, true) : $field;

        // Si no es JSON o falla, retorna el string original (Fallback de seguridad)
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            return $field; 
        }

        $value = $decoded[$locale] ?? '';

        // Fallback matemático hacia el español si el locale actual está vacío
        if ($value === '') {
            $value = $decoded['es'] ?? '';
        }

        return $value;
    }

    public function toArray(Request $request): array
    {
        // 1. Extracción segura de la relación polimórfica/hija
        $eduData = $this->educationalContent;

        // 2. Localización estricta de la imagen de portada
        $coverMedia = $this->postMedia?->where('is_cover', true)->first() 
                      ?? $this->postMedia?->where('file_type', 'image')->first();

        // 🔥 3. Extracción del video inmersivo
        $videoMedia = $this->postMedia?->where('file_type', 'video')->first();

        return [
            'id'           => $this->id,
            'title'        => $this->getLocalizedField($request, $this->title),   // ➔ STRING LIMPIO
            'slug'         => $this->slug,
            'excerpt'      => $this->getLocalizedField($request, $this->excerpt), // ➔ STRING LIMPIO
            'content'      => $this->getLocalizedField($request, $this->content), // ➔ STRING LIMPIO
            'status'       => $this->status,
            'published_at' => $this->published_at ? $this->published_at->format('Y-m-d H:i:s') : null,

            // 🔥 4. CONTRATO DE DATOS UNIFICADO (Metadata)
            'metadata' => [
                'difficulty_level'    => $eduData?->difficulty_level ?? 'beginner',
                'estimated_read_time' => $eduData?->estimated_read_time ?? 5,
                'knowledge_area'      => $eduData?->knowledge_area ?? 'General',
                'learning_objectives' => $eduData?->learning_objectives ?? [],
            ],

            // 5. Atributos de Identidad (Autor)
            'author' => [
                'id'     => $this->user?->id,
                'name'   => $this->user?->name ?? 'Maestro Desconocido',
                'avatar' => $this->user?->profile_picture, 
            ],

            // 6. Categorización
            'category' => [
                'id'   => $this->category?->id,
                'name' => $this->category ? $this->getLocalizedField($request, $this->category->name) : 'Sin Categoría', // ➔ STRING LIMPIO
            ],

            // 7. Multimedia y Assets
            'cover_image' => $coverMedia ? $coverMedia->file_path : null,
            'video_url'   => $videoMedia ? $videoMedia->file_path : null, 
            'media'       => $this->postMedia ? $this->postMedia->pluck('file_path') : [],

            // 8. Métricas de Engagement
            'stats' => [
                'views'     => (int) ($this->view_count ?? 0),
                'favorites' => $this->savedItems()->count(),
                'reactions' => (int) ($this->reaction_count ?? 0),
            ],
        ];
    }
}