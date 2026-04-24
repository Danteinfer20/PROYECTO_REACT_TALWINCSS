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
        // 1. Obtenemos el modelo polimórfico (Post, Product, etc.)
        // Usamos ->savable en lugar de ->whenLoaded() para asegurar que siempre intente traerlo
        $obra = $this->savable; 

        $mediaUrl = null;
        $autor = null;

        // 2. Extracción defensiva (Evita Errores 500)
        if ($obra) {
            // A. Buscar el autor (user o organizer)
            if (method_exists($obra, 'user') && $obra->user) {
                $autor = [
                    'id' => $obra->user->id, 
                    'name' => $obra->user->name
                ];
            }

            // B. Buscar la imagen de Cloudinary de forma segura
            if (method_exists($obra, 'media') && $obra->media()->exists()) {
                $media = $obra->media()->first();
                $mediaUrl = $media->url ?? $media->file_path ?? null;
            } elseif (method_exists($obra, 'images') && $obra->images()->exists()) {
                $media = $obra->images()->first();
                $mediaUrl = $media->image_path ?? null;
            }
        }

        return [
            'id' => $this->id,
            'category' => $this->category,
            'created_at' => $this->created_at,
            
            // 🛡️ Retrocompatibilidad para los corazones del Home.jsx
            'post_id' => $this->savable_type === 'App\\Models\\Post' ? $this->savable_id : null,
            
            // 📦 Empaquetamos la obra para FavoritosView.jsx
            'savable' => $obra ? [
                'id' => $obra->id,
                // Fallback para diferentes tablas (posts.title o products.name)
                'title' => $obra->title ?? $obra->name ?? 'Obra sin título',
                'user' => $autor,
                // Frontend React espera un array de objetos con 'url'
                'media' => $mediaUrl ? [['url' => $mediaUrl]] : [],
            ] : null,
        ];
    }
}