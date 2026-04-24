<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource; // 🔥 IMPORTANTE: Usamos el Resource que ya tienes

class CategoryController extends BaseController
{
    /**
     * Muestra el catálogo de categorías con filtrado inteligente.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // 🔥 FILTRO DINÁMICO: Si el front pide ?type=art, solo damos arte.
        $query->when($request->type, function ($q, $type) {
            return $q->where('category_type', $type);
        });

        // Solo categorías activas y ordenadas alfabéticamente
        $categories = $query->where('is_active', true)
                            ->orderBy('name', 'asc')
                            ->get();
        
        return $this->sendResponse(
            CategoryResource::collection($categories), 
            'Catálogo de categorías recuperado exitosamente.'
        );
    }
}