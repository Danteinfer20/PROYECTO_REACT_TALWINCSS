<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class ApprovedUserResource extends JsonResource
{
    /**
     * Transforma el recurso a un arreglo HTTP.
     */
    public function toArray($request)
    {
        return [
            'status' => 'success',
            'data' => [
                'id' => $this->id,
                'username' => $this->username,
                'name' => $this->name,
                'new_role' => $this->user_type,
                'verified_at' => now()->format('Y-m-d H:i:s')
            ],
            'message' => 'El usuario ha sido ascendido exitosamente.'
        ];
    }
}