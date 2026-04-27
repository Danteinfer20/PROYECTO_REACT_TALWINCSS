<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\EducationalContent;
use App\Http\Resources\EducationalContentResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Traits\UploadsToCloudinary;

class EducationalContentController extends Controller
{
    use UploadsToCloudinary;

    /**
     * 🌐 LISTADO PÚBLICO / PRIVADO
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();

        $query = Post::with(['educationalContent', 'category', 'postMedia', 'user'])
                     ->where('is_educational', true)
                     ->latest();

        if ($user && $user->user_type === 'educator' && $request->has('dashboard')) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('status', 'published'); 
        }

        $contents = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => EducationalContentResource::collection($contents)
        ], 200);
    }

    /**
     * 🌐 DETALLE PÚBLICO
     */
    public function show($id): JsonResponse
    {
        $post = Post::with(['educationalContent', 'category', 'postMedia', 'user'])
                    ->where('is_educational', true)
                    ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new EducationalContentResource($post)
        ], 200);
    }

    /**
     * 🔥 LA FORJA: Crear nueva Ruta
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
        ]);

        try {
            $user = Auth::user();

            if (!$user || $user->user_type !== 'educator') {
                return response()->json(['status' => 'error', 'message' => 'Acceso denegado.'], 403);
            }

            $post = DB::transaction(function () use ($request, $user) {
                $post = Post::create([
                    'user_id' => $user->id,
                    'category_id' => $request->category_id,
                    'content_type_id' => $request->content_type_id ?? 1, 
                    'title' => $request->title,
                    'slug' => Str::slug($request->title) . '-' . uniqid(),
                    'excerpt' => Str::limit(strip_tags($request->content), 150),
                    'content' => $request->content,
                    'status' => $request->status ?? 'published',
                    'is_educational' => true,
                    'published_at' => now(),
                ]);

                $objectives = $request->filled('learning_objectives') ? json_decode($request->learning_objectives, true) : [];

                EducationalContent::create([
                    'post_id' => $post->id,
                    'difficulty_level' => $request->difficulty_level,
                    'estimated_read_time' => $request->estimated_read_time ?? 5,
                    'knowledge_area' => $request->knowledgeArea ?? $request->knowledge_area,
                    'learning_objectives' => $objectives, 
                ]);

                if ($request->hasFile('image')) {
                    $imageUrl = $this->uploadImageToCloud($request->file('image'), 'popayan/education');
                    $post->postMedia()->create([
                        'file_type' => 'image', 'file_path' => $imageUrl, 'file_name' => 'cover_' . $post->id, 'is_cover' => true
                    ]);
                }
                return $post;
            });

            return response()->json(['status' => 'success', 'data' => new EducationalContentResource($post->load(['educationalContent', 'category', 'postMedia', 'user']))], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Fallo en la forja.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 🛠️ ACTUALIZACIÓN SISTÉMICA (Uso de PUT/PATCH vía POST FormData)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $post = Post::where('is_educational', true)->findOrFail($id);
        
        if (Auth::id() !== $post->user_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado.'], 403);
        }

        try {
            DB::transaction(function () use ($request, $post) {
                // 1. Actualizar Post Padre
                $post->update([
                    'title' => $request->title ?? $post->title,
                    'content' => $request->content ?? $post->content,
                    'category_id' => $request->category_id ?? $post->category_id,
                    'status' => $request->status ?? $post->status,
                ]);

                // 2. Actualizar Contenido Educativo Hijo
                $objectives = $request->filled('learning_objectives') ? json_decode($request->learning_objectives, true) : null;
                
                $post->educationalContent()->update(array_filter([
                    'difficulty_level' => $request->difficulty_level,
                    'estimated_read_time' => $request->estimated_read_time,
                    'knowledge_area' => $request->knowledgeArea ?? $request->knowledge_area,
                    'learning_objectives' => $objectives,
                ]));

                // 3. Gestión de nueva imagen (Reemplazo)
                if ($request->hasFile('image')) {
                    // Eliminamos la anterior lógicamente en postMedia si existe
                    $post->postMedia()->where('is_cover', true)->delete();
                    
                    $imageUrl = $this->uploadImageToCloud($request->file('image'), 'popayan/education');
                    $post->postMedia()->create([
                        'file_type' => 'image', 'file_path' => $imageUrl, 'file_name' => 'updated_' . $post->id, 'is_cover' => true
                    ]);
                }
            });

            return response()->json(['status' => 'success', 'message' => 'Material actualizado.', 'data' => new EducationalContentResource($post->load(['educationalContent', 'category', 'postMedia']))], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 🗑️ ELIMINACIÓN SEGURA (Limpieza 360)
     */
    public function destroy($id): JsonResponse
    {
        $post = Post::where('is_educational', true)->findOrFail($id);

        if (Auth::id() !== $post->user_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado.'], 403);
        }

        try {
            DB::transaction(function () use ($post) {
                // Limpiar relaciones para evitar fallos de Foreign Key
                $post->educationalContent()->delete();
                $post->postMedia()->delete();
                $post->delete(); // SoftDelete habilitado según tu modelo
            });

            return response()->json(['status' => 'success', 'message' => 'Material eliminado permanentemente del aula.'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
        }
    }
}