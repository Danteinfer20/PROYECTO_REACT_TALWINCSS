<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ManagerEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->post?->title ?? 'Sin título',
            'start_date'      => $this->start_date,
            'location_name'   => $this->location?->name ?? 'Por confirmar',
            'max_capacity'    => $this->max_capacity,
            'available_slots' => $this->available_slots,
            'event_status'    => $this->event_status,
            'event_type'      => $this->event_type,
            'price'           => (float) $this->price,
            'cover_image'     => $this->post?->postMedia->where('is_cover', true)->first()?->file_path ?? null,
        ];
    }
}