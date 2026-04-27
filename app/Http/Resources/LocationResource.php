<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'address'       => $this->address,
            'neighborhood'  => $this->neighborhood,
            'location_type' => $this->location_type,
            'capacity'      => $this->capacity,
            'is_accessible' => (bool) $this->is_accessible,
            'photo'         => $this->photo,
        ];
    }
}