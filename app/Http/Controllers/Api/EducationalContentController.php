<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class EducationalContentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = DB::table('educational_content_view');

            if ($request->filled('difficulty')) {
                $query->where('difficulty_level', $request->difficulty);
            }

            // 🔥 CORRECCIÓN CRÍTICA: Búsqueda Insensible a Mayúsculas/Minúsculas usando ILIKE (PostgreSQL)
            if ($request->filled('area') && $request->area !== 'Todas') {
                $areaSearch = '%' . $request->area . '%';
                $query->where('knowledge_area', 'ILIKE', $areaSearch);
            }

            if ($request->filled('search')) {
                $search = '%' . $request->search . '%';
                $query->where(function($q) use ($search) {
                    $q->where('title', 'ILIKE', $search)
                      ->orWhere('excerpt', 'ILIKE', $search);
                });
            }

            $results = $query->paginate(12);

            $formatted = collect($results->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'excerpt' => $item->excerpt,
                    'metadata' => [
                        'difficulty_level' => $item->difficulty_level ?? 'beginner',
                        'estimated_read_time' => $item->estimated_read_time ?? 5,
                        'knowledge_area' => $item->knowledge_area ?? 'General',
                    ],
                    'author' => [
                        'name' => $item->author_name,
                        'avatar' => $item->author_avatar,
                    ]
                ];
            });

            return response()->json(['data' => $formatted]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Fallo en BD: ' . $e->getMessage()], 400);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $lesson = DB::table('educational_content_view')->where('id', $id)->first();

            if (!$lesson) {
                return response()->json(['message' => 'Lección no encontrada.'], 404);
            }

            return response()->json([
                'data' => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'content' => $lesson->content,
                    'metadata' => [
                        'difficulty_level' => $lesson->difficulty_level ?? 'beginner',
                        'estimated_read_time' => $lesson->estimated_read_time ?? 5,
                        'knowledge_area' => $lesson->knowledge_area ?? 'General',
                    ],
                    'author' => [
                        'name' => $lesson->author_name,
                        'avatar' => $lesson->author_avatar,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Fallo en BD: ' . $e->getMessage()], 400);
        }
    }
}