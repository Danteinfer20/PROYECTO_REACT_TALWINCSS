<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtistDashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Formateamos los KPIs y mapeamos las obras para entregar un JSON pulido a React
        return [
            'kpis' => [
                'vistas' => (int) $this['vistas'],
                'favoritos' => (int) $this['favoritos'],
                'obras' => (int) $this['obras'],
                'productos' => (int) $this['productos'],
            ],
            'obras_recientes' => $this['obras_recientes']->map(function($obra) {
                return [
                    'id' => $obra->id,
                    'title' => $obra->title,
                    'status' => $obra->status,
                    // Si tienes relación media polimórfica, sacamos la primera imagen
                    'image' => $obra->media->first() ? $obra->media->first()->file_path : null,
                    'created_at' => $obra->created_at->toIso8601String(),
                ];
            }),
        ];
    }
}