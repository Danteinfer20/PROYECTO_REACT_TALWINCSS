<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ContentTypeResource;

class ContentTypeController extends Controller
{
    /**
     * 🔥 Catálogo Inteligente de Disciplinas (Nivel 2).
     * Respeta la arquitectura de banderas booleanas del Seeder.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContentType::query();

        // El filtro absoluto: Escuchamos a React
        if ($request->type === 'event') {
            $query->where('allows_events', true);
        } elseif ($request->type === 'education') {
            $query->where('allows_education', true);
        }

        $contentTypes = $query->orderBy('name', 'asc')->get();
        
        return response()->json([
            'status'  => 'success',
            'message' => 'Catálogo de disciplinas recuperado exitosamente.',
            'data'    => ContentTypeResource::collection($contentTypes)
        ], 200);
    }
}