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

            // 🔥 CORRECCIÓN: Leemos 'orderItems' porque así lo llamaste en tu modelo Order.php
            'items'        => $this->whenLoaded('orderItems', function () {
                return $this->orderItems->map(function ($item) {
                    return [
                        'product_id'   => $item->product_id,
                        'product_name' => $item->product->name ?? 'Producto Desconocido',
                        'quantity'     => $item->quantity,
                        'unit_price'   => (float) $item->unit_price,
                        'subtotal'     => (float) $item->subtotal,
                    ];
                });
            }),
        ];
    }
}