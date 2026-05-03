<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = auth('sanctum')->user();
        $isSaved = false;
        $hasReacted = false;

        if ($user) {
            $isSaved = DB::table('saved_items')
                ->where('savable_type', 'App\\Models\\Post')
                ->where('savable_id', $this->id)
                ->where('user_id', $user->id)
                ->exists();

            $hasReacted = DB::table('reactions')
                ->where('reactable_type', 'App\\Models\\Post')
                ->where('reactable_id', $this->id)
                ->where('user_id', $user->id)
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
            
            // ✅ RESCATE DE IMAGEN MATRIZ (Recupera tus vistas actuales)
            // Si existe relación, saca la primera. Si no, intenta sacar el campo directo de la tabla.
            'image' => $this->postMedia->first()?->file_path ?? $this->image ?? null,

            // 🔥 COMPATIBILIDAD GALERÍA (Para nuevas funciones)
            'images' => $this->whenLoaded('postMedia', function () {
                return $this->postMedia->sortBy('sort_order')->map(fn($m) => $m->file_path)->values();
            }, []),
            
            'author' => [
                'name'     => $this->user?->name ?? 'Maestro Patojo',
                'username' => $this->user?->username ?? 'anonimo',
                'avatar'   => $this->user?->profile_picture
            ],
            
            'category' => [
                'id'   => $this->category?->id ?? null,
                'name' => $this->category?->name ?? 'General'
            ],

            'stats' => [
                'views'     => $this->view_count ?? 0,
                'shares'    => $this->share_count ?? 0,
                'reactions' => $this->reactions_count ?? 0
            ],

            'user_interaction' => [
                'is_saved'    => $isSaved,
                'has_reacted' => $hasReacted,
            ]
        ];
    }
}