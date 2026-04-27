<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'username'        => $this->username,
            
            // 🔥 Filtro de Seguridad Senior: 
            // Solo mostramos el email si el usuario logueado es el dueño de este perfil.
            'email'           => $this->when(Auth::id() === $this->id, $this->email),
            
            // 🔥 AQUÍ ESTÁ LA INYECCIÓN QUIRÚRGICA: Entregamos el teléfono a React
            'phone'           => $this->phone,
            
            'user_type'       => $this->user_type,

            // 🔥 LA PIEZA FALTANTE: Forzamos la entrega del estado de verificación al frontend
            'is_verified'     => (bool) $this->is_verified, 

            'bio'             => $this->bio,
            'city'            => $this->city,
            'neighborhood'    => $this->neighborhood,
            'website'         => $this->website,
            'social_media'    => $this->social_media, 
            
            // 🔥 CORRECCIÓN: Entrega la URL pura de Cloudinary (sin envolturas locales)
            'profile_picture' => $this->profile_picture,
            'cover_picture'   => $this->cover_picture,

            'status'          => $this->status,
            
            // Un toque de diseño para React:
            'joined_at'       => $this->created_at ? $this->created_at->format('M Y') : null,
            
            // Relaciones anidadas elegantes
            'settings'        => $this->whenLoaded('settings'),
            'statistics'      => $this->whenLoaded('statistics'),
        ];
    }
}