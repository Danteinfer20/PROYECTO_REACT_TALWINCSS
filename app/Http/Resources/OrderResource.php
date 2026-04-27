<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_number' => $this->order_number,
            'total_amount' => (float) $this->total_amount,
            'status'       => $this->status,
            'date'         => $this->created_at->format('Y-m-d H:i:s'),
            
            // Datos del Comprador
            'buyer'        => $this->whenLoaded('user', function () {
                return [
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone ?? 'No registrado',
                ];
            }),

            // 🔥 MEJORA VISUAL: Sincronización con el Ledger de Identidad
            'items'        => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->map(function ($item) {
                    // 🛡️ Lógica de Iniciales: "Réplica Torre" -> "RT"
                    $name = $item->product->name ?? 'Obra Patrimonial';
                    $words = explode(' ', $name);
                    $initials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));

                    return [
                        'product_id'   => $item->product_id,
                        'product_name' => $name,
                        'initials'     => $initials, // 🚀 Nueva llave para el Frontend
                        'quantity'     => $item->quantity,
                        'unit_price'   => (float) $item->unit_price,
                        'subtotal'     => (float) $item->subtotal,
                    ];
                });
            }),
        ];
    }
}