<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB; // Para consultas precisas

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // 1. Verificamos si hay un usuario logueado para la telemetría
        $user = auth('sanctum')->user();
        
        $isSaved = false;

        if ($user) {
            // 🔥 Telemetría Polimórfica: ¿El usuario guardó este producto?
            $isSaved = DB::table('saved_items')
                ->where('savable_type', 'App\\Models\\Product') 
                ->where('savable_id', $this->id)             
                ->where('user_id', $user->id)                
                ->exists();
        }

        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'sale_price'  => $this->sale_price ? (float) $this->sale_price : null,
            'stock'       => $this->stock_quantity,
            'type'        => $this->product_type,
            'status'      => $this->status,
            'is_featured' => (bool) $this->is_featured,
            
            // Unificamos main_image con productImages para el Frontend
            'main_image'  => $this->main_image, 
            'images'      => $this->whenLoaded('productImages', function () {
                $images = $this->productImages->pluck('image_path')->toArray();
                if ($this->main_image && !in_array($this->main_image, $images)) {
                    array_unshift($images, $this->main_image); // Pone la principal de primera
                }
                return $images;
            }, [$this->main_image]), // Fallback si no carga relaciones
            
            'category'    => $this->whenLoaded('category', function () {
                return [
                    'id'   => $this->category->id,
                    'name' => $this->category->name,
                ];
            }, ['name' => 'Catálogo General']),
            
            'author'      => $this->whenLoaded('user', function () {
                return [
                    'id'              => $this->user->id,
                    'name'            => $this->user->name,
                    'username'        => $this->user->username,
                    'profile_picture' => $this->user->profile_picture, // Agregado para el UI
                    'phone'           => $this->user->phone ?? null, // 🔥 INYECCIÓN DE CONTACTO OFICIAL P2P
                ];
            }),
            
            'specs'       => [
                'materials'  => $this->materials,
                'dimensions' => $this->dimensions,
                'weight'     => $this->weight_kg ? $this->weight_kg . ' kg' : null,
            ],

            // 🔥 TELEMETRÍA EXACTA
            'stats' => [
                'sales' => $this->sales_count ?? 0,
            ],

            // 🔥 DEVOLVEMOS LA MEMORIA AL FRONTEND
            'user_interaction' => [
                'is_saved' => $isSaved,
            ]
        ];
    }
}