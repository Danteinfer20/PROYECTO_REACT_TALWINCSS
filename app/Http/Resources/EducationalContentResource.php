<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationalContentResource extends JsonResource
{
    /**
     * Transformar el recurso en un array.
     * * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // 1. Extracción segura de la relación polimórfica/hija
        $eduData = $this->educationalContent;

        // 2. Localización de la imagen de portada
        $coverMedia = $this->postMedia?->where('is_cover', true)->first() 
                      ?? $this->postMedia?->first();

        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'excerpt'      => $this->excerpt,
            'content'      => $this->content, // Se puede filtrar con $this->when() si es necesario
            'status'       => $this->status,
            'published_at' => $this->published_at ? $this->published_at->format('Y-m-d H:i:s') : null,

            // 🔥 3. CONTRATO DE DATOS UNIFICADO (Metadata)
            // Aquí es donde React recupera la vida
            'metadata' => [
                'difficulty_level'    => $eduData?->difficulty_level ?? 'beginner',
                'estimated_read_time' => $eduData?->estimated_read_time ?? 5,
                'knowledge_area'      => $eduData?->knowledge_area ?? 'General',
                'learning_objectives' => $eduData?->learning_objectives ?? [],
            ],

            // 4. Atributos de Identidad (Autor)
            'author' => [
                'id'     => $this->user?->id,
                'name'   => $this->user?->name ?? 'Maestro Desconocido',
                'avatar' => $this->user?->profile_picture, // Sincronizado con el campo del Frontend
            ],

            // 5. Categorización
            'category' => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name ?? 'Sin Categoría',
            ],

            // 6. Multimedia y Assets
            'cover_image' => $coverMedia ? $coverMedia->file_path : null,
            'media'       => $this->postMedia ? $this->postMedia->pluck('file_path') : [],

            // 7. Métricas de Engagement
            'stats' => [
                'views'     => (int) ($this->view_count ?? 0),
                'favorites' => $this->savedItems()->count(),
                'reactions' => (int) ($this->reaction_count ?? 0),
            ],
        ];
    }
}