<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavedItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $obra = $this->savable; 
        
        // Valores por defecto para evitar crashes en el Frontend
        $mediaUrl = null;
        $difficultyLevel = null;
        $autorData = null;

        if ($obra) {
            // 1. Extracción de Autor
            $userRelation = $obra->user ?? null;
            if ($userRelation) {
                $autorData = [
                    'id' => $userRelation->id, 
                    'name' => $userRelation->name,
                    'profile_picture' => $userRelation->profile_picture
                ];
            }

            // 2. Extracción Quirúrgica de Imagen (Basado en tu SQL)
            if ($this->savable_type === 'App\\Models\\Post') {
                // Buscamos en la tabla post_media (relación postMedia o media)
                $media = $obra->postMedia?->first() ?? $obra->media?->first();
                $mediaUrl = $media?->file_path ?? $media?->url;
            } elseif ($this->savable_type === 'App\\Models\\Product') {
                // La tabla products sí tiene main_image directamente
                $mediaUrl = $obra->main_image;
            }

            // 3. Extracción de Nivel de Dificultad (Para salvar Aprende.jsx)
            if ($obra->is_educational) {
                // Buscamos en la tabla educational_content
                $educational = $obra->educationalContent ?? $obra->educational_content;
                $difficultyLevel = $educational?->difficulty_level ?? 'beginner';
            }
        }

        return [
            'id'           => $this->id,
            'category'     => $this->category,
            'created_at'   => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'post_id'      => $this->savable_type === 'App\\Models\\Post' ? $this->savable_id : null,
            'savable_id'   => $this->savable_id,
            'savable_type' => $this->savable_type,

            // 🔥 NIVEL RAÍZ: Restaura Educador.jsx y Aprende.jsx
            'title'            => $obra?->title ?? $obra?->name ?? 'Contenido no disponible',
            'cover_image'      => $mediaUrl,
            'author'           => $autorData,
            'is_educational'   => $obra?->is_educational ?? false,
            'difficulty_level' => $difficultyLevel,

            // 📦 NIVEL SAVABLE: Sincroniza la vista del Ciudadano
            'savable' => $obra ? [
                'id'               => $obra->id,
                'title'            => $obra->title ?? $obra->name ?? 'Contenido no disponible',
                'user'             => $autorData,
                'media'            => $mediaUrl ? [['url' => $mediaUrl]] : [],
                'is_educational'   => $obra->is_educational ?? false,
                'difficulty_level' => $difficultyLevel,
            ] : null,
        ];
    }
}