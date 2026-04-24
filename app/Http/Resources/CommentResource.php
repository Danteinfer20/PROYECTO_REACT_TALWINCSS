<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transforma el recurso a un arreglo para la API.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'content'    => $this->content,
            'status'     => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
            // 🔥 Nivel Pro: diffForHumans() entrega formatos como "hace 2 horas"
            'human_time' => $this->created_at->diffForHumans(), 
            
            // Relación cargada dinámicamente para evitar el problema N+1
            'user' => $this->whenLoaded('user', function () {
                
                // 🛡️ Blindaje Arquitectónico: Detección de origen de imagen
                $avatar = $this->user->profile_picture;
                $avatarUrl = null;
                
                if ($avatar) {
                    $avatarUrl = str_starts_with($avatar, 'http') ? $avatar : url('storage/' . $avatar);
                }

                return [
                    'id'              => $this->user->id,
                    'name'            => $this->user->name,
                    'username'        => $this->user->username,
                    'profile_picture' => $avatarUrl,
                ];
            }),
        ];
    }
}