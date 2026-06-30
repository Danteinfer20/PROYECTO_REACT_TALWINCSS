<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

class ProductResource extends JsonResource
{
    /**
     * 🔥 FILTRO DE IDIOMA CORE (Arquitectura SRP)
     * Resuelve vacíos estrictos y previene colapsos en el DOM de React.
     */
    private function getLocalizedField(Request $request, $field)
    {
        $locale = $request->header('X-Localization', 'es');
        
        if (empty($field)) return null;

        $decoded = is_string($field) ? json_decode($field, true) : $field;

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            return $field; 
        }

        // Extracción inicial
        $value = $decoded[$locale] ?? '';

        // Fallback matemático: Si el valor de la base de datos es estrictamente vacío,
        // usamos el español como mecanismo de seguridad visual para el Frontend.
        if ($value === '') {
            $value = $decoded['es'] ?? '';
        }

        return $value;
    }

    public function toArray(Request $request): array
    {
        $user = auth('sanctum')->user();
        
        $isSaved = false;

        if ($user) {
            $isSaved = DB::table('saved_items')
                ->where('savable_type', 'App\\Models\\Product') 
                ->where('savable_id', $this->id)             
                ->where('user_id', $user->id)                
                ->exists();
        }

        return [
            'id'          => $this->id,
            'name'        => $this->getLocalizedField($request, $this->name),
            'description' => $this->getLocalizedField($request, $this->description),
            'price'       => (float) $this->price,
            'sale_price'  => $this->sale_price ? (float) $this->sale_price : null,
            'stock'       => $this->stock_quantity,
            'type'        => $this->product_type,
            'status'      => $this->status,
            'is_featured' => (bool) $this->is_featured,
            
            'main_image'  => $this->main_image, 
            'images'      => $this->whenLoaded('productImages', function () {
                $images = $this->productImages->pluck('image_path')->toArray();
                if ($this->main_image && !in_array($this->main_image, $images)) {
                    array_unshift($images, $this->main_image);
                }
                return $images;
            }, [$this->main_image]),
            
            'category'    => $this->whenLoaded('category', function () use ($request) {
                return [
                    'id'   => $this->category->id,
                    'name' => $this->getLocalizedField($request, $this->category->name),
                ];
            }, ['name' => 'Catálogo General']),
            
            'author'      => $this->whenLoaded('user', function () {
                return [
                    'id'              => $this->user->id,
                    'name'            => $this->user->name,
                    'username'        => $this->user->username,
                    'profile_picture' => $this->user->profile_picture,
                    'phone'           => $this->user->phone ?? null,
                ];
            }),
            
            'specs'       => [
                'materials'  => $this->materials,
                'dimensions' => $this->dimensions,
                'weight'     => $this->weight_kg ? $this->weight_kg . ' kg' : null,
            ],

            'stats' => [
                'sales' => $this->sales_count ?? 0,
            ],

            'user_interaction' => [
                'is_saved' => $isSaved,
            ]
        ];
    }
}