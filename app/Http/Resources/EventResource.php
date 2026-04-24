<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            
            // 🔗 Heredamos los datos del Post asociado usando Nullsafe
            'title'   => $this->post?->title ?? 'Evento sin título',
            'slug'    => $this->post?->slug ?? '',
            'excerpt' => $this->post?->excerpt ?? '',
            'content' => $this->post?->content ?? '',
            
            // 🔥 Sincronización exacta con el formato de Obras
            'category' => [
                'id'   => $this->post?->category?->id,
                'name' => $this->post?->category?->name ?? 'Cultura Local'
            ],
            
            // 🔥 BLINDAJE DE IMÁGENES: Usamos la relación correcta postMedia y extraemos los file_path
            'images' => $this->post?->postMedia ? $this->post->postMedia->pluck('file_path') : [],
            
            // 📅 Datos puros del Evento
            'start_date'      => $this->start_date,
            'end_date'        => $this->end_date,
            'price'           => $this->price,
            'event_type'      => $this->event_type,
            'status'          => $this->event_status,
            'max_capacity'    => $this->max_capacity,
            'available_slots' => $this->available_slots,
            'requires_rsvp'   => $this->requires_rsvp,
            
            // 📍 Locación acoplada (Protegida contra Nulls)
            'location' => [
                'id'           => $this->location?->id,
                'name'         => $this->location?->name ?? 'Ubicación por confirmar',
                'address'      => $this->location?->address ?? '',
                'neighborhood' => $this->location?->neighborhood ?? '',
                'city'         => $this->location?->city ?? 'Popayán',
                'latitude'     => $this->location?->latitude,
                'longitude'    => $this->location?->longitude,
            ],
            
            // 👤 Organizador acoplado (Protegido contra Nulls)
            'organizer' => [
                'id'              => $this->organizer?->id,
                'name'            => $this->organizer?->name ?? 'Gestor Cultural',
                'username'        => $this->organizer?->username ?? '',
                'profile_picture' => $this->organizer?->profile_picture,
            ],
            
            // 🎫 Métricas Unificadas
            'stats' => [
                'attendees' => $this->attendance_count ?? 0,
                'views'     => $this->post?->view_count ?? 0,
                'shares'    => $this->post?->share_count ?? 0,
            ],
        ];
    }
}