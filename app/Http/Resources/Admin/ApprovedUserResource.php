<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovedUserResource extends JsonResource
{
    /**
     * Transformación de éxito tras el veredicto del Administrador.
     */
    public function toArray(Request $request): array
    {
        // Forzamos el refresco del modelo para obtener el user_type actualizado
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'new_role' => $this->user_type,
            'is_verified' => (bool) $this->is_verified,
            'verified_at' => now()->format('Y-m-d H:i:s'),
            'execution_node' => config('app.name')
        ];
    }

    /**
     * Inyectamos metadatos de respuesta nivel Senior.
     */
    public function with(Request $request): array
    {
        return [
            'status' => 'success',
            'message' => "El usuario {$this->name} ha sido ascendido a " . strtoupper($this->user_type) . "."
        ];
    }
}