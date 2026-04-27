<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCollectionResource extends JsonResource
{
    /**
     * Transforma el ciudadano en un objeto táctico para el Administrador.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'user_type' => $this->user_type,
            'status' => $this->status,
            
            // 🖼️ Normalización de Identidad Visual
            'profile_picture' => $this->profile_picture 
                ? (str_starts_with($this->profile_picture, 'http') 
                    ? $this->profile_picture 
                    : config('app.url') . $this->profile_picture)
                : null,
            
            // 🛡️ Blindaje de metadatos (Uso de Nullsafe para fechas)
            'created_at' => $this->created_at?->toIso8601String(),
            'is_verified' => (bool) $this->is_verified,
            
            // 🔥 Inyección para Auditoría: ¿Tiene solicitud activa?
            // Esto permite al Admin saber quién está esperando un ascenso desde la lista general
            'has_pending_application' => $this->whenLoaded('creatorApplication', function() {
                return $this->creatorApplication?->status === 'pending';
            }),
        ];
    }
}