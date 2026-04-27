<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    /**
     * 🔥 Catálogo Inteligente de Taxonomías (Nivel 1).
     * Lee el parámetro ?type del frontend para evitar mezclas.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // El filtro de hierro: Si React pide 'event', damos 'event'.
        $query->when($request->type, function ($q, $type) {
            return $q->where('category_type', $type);
        });

        // Aseguramos que solo salgan las activas y en orden
        $categories = $query->where('is_active', true)
                            ->orderBy('name', 'asc')
                            ->get();
        
        return response()->json([
            'status'  => 'success',
            'message' => 'Catálogo de taxonomías recuperado exitosamente.',
            'data'    => CategoryResource::collection($categories)
        ], 200);
    }
}