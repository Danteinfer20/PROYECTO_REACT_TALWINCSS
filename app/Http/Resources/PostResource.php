<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB; // Para consultas precisas

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // 1. Verificamos si hay un usuario logueado
        $user = auth('sanctum')->user();
        
        // 2. Lógica para detectar si está guardado/likeado (solo si hay usuario)
        $isSaved = false;
        $hasReacted = false;

        if ($user) {
            // 🔥 CORRECCIÓN: Respetando la estructura POLIMÓRFICA de tu base de datos
            $isSaved = DB::table('saved_items')
                ->where('savable_type', 'App\\Models\\Post') // Tipo exacto
                ->where('savable_id', $this->id)             // ID del Post
                ->where('user_id', $user->id)                // ID del Usuario
                ->exists();

            $hasReacted = DB::table('reactions')
                ->where('reactable_type', 'App\\Models\\Post') // Tipo exacto
                ->where('reactable_id', $this->id)             // ID del Post
                ->where('user_id', $user->id)                  // ID del Usuario
                ->exists();
        }

        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'excerpt'      => $this->excerpt,
            'content'      => $this->content,
            'status'       => $this->status,
            'published_at' => $this->published_at ? $this->published_at->diffForHumans() : null,
            
            // BLINDAJE DE IMÁGENES
            'images'       => $this->postMedia ? $this->postMedia->pluck('file_path') : [],
            
            'author' => [
                'name'     => $this->user->name ?? 'Maestro Patojo',
                'username' => $this->user->username ?? 'anonimo',
                'avatar'   => $this->user->profile_picture
            ],
            
            'category' => [
                'id'   => $this->category->id ?? null,
                'name' => $this->category->name ?? 'General'
            ],

            // TELEMETRÍA EXACTA
            'stats' => [
                'views'     => $this->view_count ?? 0,
                'shares'    => $this->share_count ?? 0,
                'reactions' => $this->reactions_count ?? 0
            ],

            // 🔥 DEVOLVEMOS LA MEMORIA AL FRONTEND (Sin romper el polimorfismo)
            'user_interaction' => [
                'is_saved'    => $isSaved,
                'has_reacted' => $hasReacted,
            ]
        ];
    }
}