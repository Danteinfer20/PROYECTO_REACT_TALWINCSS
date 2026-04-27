<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ManagerDashboardResource extends JsonResource
{
    /**
     * Transforma el recurso a un arreglo JSON estructurado.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'metrics' => [
                'active_events_month' => $this->resource['active_events_month'],
                'total_rsvps'         => $this->resource['total_rsvps'],
                'estimated_revenue'   => $this->resource['estimated_revenue'],
            ],
            'upcoming_events' => $this->resource['upcoming_events']->map(function ($event) {
                return [
                    'id'              => $event->id,
                    'title'           => $event->post->title ?? 'Evento sin título',
                    'start_date'      => $event->start_date,
                    'location_name'   => $event->location->name ?? 'Ubicación por confirmar',
                    'available_slots' => $event->available_slots,
                    'max_capacity'    => $event->max_capacity,
                ];
            })
        ];
    }
}