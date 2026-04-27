<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketSaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Cálculo de ingresos: Precio unitario del evento por los cupos reservados
        $totalPaid = ($this->event->price ?? 0) * ($this->guest_count ?? 1);

        return [
            'id' => $this->id,
            'event_title' => $this->event->post->title ?? 'Evento sin título',
            'buyer_name' => $this->user->name ?? 'Usuario anónimo',
            'buyer_email' => $this->user->email,
            'guest_count' => $this->guest_count,
            'total_amount' => (float) $totalPaid,
            'status' => $this->status, // confirmed, attended, etc.
            'checked_in' => (bool) $this->checked_in,
            'checked_in_at' => $this->checked_in_at ? $this->checked_in_at->format('d/m/Y H:i') : null,
            'qr_code' => $this->qr_code,
            'date' => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}