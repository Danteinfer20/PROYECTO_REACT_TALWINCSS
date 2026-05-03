<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use App\Http\Resources\PostResource;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Traits\UploadsToCloudinary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PostController extends BaseController
{
    use UploadsToCloudinary;

    public function index(Request $request)
    {
        $query = Post::with(['user', 'contentType', 'postMedia', 'category'])->withCount('reactions');
        $user = auth('sanctum')->user();
        $kpis = null;

        if ($request->has('my_posts') && $user) {
            $query->where('user_id', $user->id);
            // KPIs simplificados para evitar errores 500 si no existe la tabla de estadísticas
            $kpis = [
                'total_works'     => Post::where('user_id', $user->id)->count(),
                'featured_works'  => Post::where('user_id', $user->id)->where('is_featured', true)->count(),
                'community_reach' => 0 
            ];
        } 
        else if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id)->where('status', 'published');
        } 
        else {
            $query->where('status', 'published');
        }

        $query->when($request->category_id, fn($q, $cat) => $q->where('category_id', $cat))
              ->when($request->content_type_id, fn($q, $type) => $q->where('content_type_id', $type))
              ->when($request->search, fn($q, $s) => $q->where('title', 'ilike', "%{$s}%"));

        $posts = $query->latest()->paginate(12);

        return $kpis 
            ? PostResource::collection($posts)->additional(['meta' => ['kpis' => $kpis]])
            : PostResource::collection($posts);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        try {
            $post = DB::transaction(function () use ($request) {
                
                // 1. Identificar la imagen principal (sea de 'image' o la primera de 'images[]')
                $file = $request->file('image') ?? ($request->hasFile('images') ? $request->file('images')[0] : null);
                $url = $file ? $this->uploadImageToCloud($file, 'popayan/posts') : null;

                // 2. Crear Post con el campo 'image' lleno para compatibilidad con React
                $newPost = Post::create([
                    'user_id'         => $request->user()->id,
                    'category_id'     => $request->category_id,
                    'content_type_id' => $request->content_type_id,
                    'title'           => $request->title,
                    'slug'            => Str::slug($request->title) . '-' . uniqid(),
                    'excerpt'         => $request->excerpt,
                    'content'         => $request->content,
                    'image'           => $url, // 🔥 Esto arregla el "Sin Matriz Visual"
                    'status'          => $request->input('status', 'published'),
                    'is_featured'     => $request->input('is_featured', false),
                    'published_at'    => now(),
                ]);

                // 3. Guardar en postMedia para la galería (images[])
                if ($url) {
                    $newPost->postMedia()->create([
                        'file_type' => 'image',
                        'file_path' => $url,
                        'file_name' => $file->getClientOriginalName(),
                        'is_cover'  => true,
                        'sort_order' => 0
                    ]);
                    
                    // Si mandaste más imágenes en el arreglo, las guardamos también
                    if ($request->hasFile('images') && count($request->file('images')) > 1) {
                        foreach ($request->file('images') as $index => $extraFile) {
                            if ($index === 0 && $request->hasFile('image')) continue; // Evitar duplicar la principal
                            
                            $extraUrl = $this->uploadImageToCloud($extraFile, 'popayan/posts');
                            $newPost->postMedia()->create([
                                'file_type' => 'image',
                                'file_path' => $extraUrl,
                                'file_name' => $extraFile->getClientOriginalName(),
                                'is_cover'  => false,
                                'sort_order' => $index + 1
                            ]);
                        }
                    }
                }

                return $newPost;
            });

            return $this->sendResponse(
                new PostResource($post->load(['postMedia', 'user', 'category'])), 
                'Obra forjada exitosamente.', 
                201
            );

        } catch (\Exception $e) {
            return $this->sendError('Error en la creación: ' . $e->getMessage(), [], 500);
        }
    }

    public function show(Request $request, $id): JsonResponse
    {
        $post = Post::with(['postMedia', 'user', 'contentType', 'category', 'comments.user'])
                    ->withCount('reactions')
                    ->find($id);

        if (!$post) return $this->sendError('Obra no encontrada.', [], 404);

        $ip = $request->ip();
        $cacheKey = "obra_vistas_{$post->id}_ip_{$ip}";
        if (!Cache::has($cacheKey)) {
            $post->increment('view_count');
            Cache::put($cacheKey, true, now()->addHours(2));
        }
        
        return $this->sendResponse(new PostResource($post), 'Detalle recuperado.');
    }

    public function update(UpdatePostRequest $request, $id): JsonResponse
    {
        try {
            $post = Post::findOrFail($id);
            if ($post->user_id !== $request->user()->id) {
                return $this->sendError('No autorizado.', [], 403);
            }

            DB::transaction(function () use ($request, $post) {
                $post->update($request->validated());

                if ($request->hasFile('image') || $request->hasFile('images')) {
                    $file = $request->file('image') ?? $request->file('images')[0];
                    $url = $this->uploadImageToCloud($file, 'popayan/posts');
                    
                    if ($url) {
                        $post->update(['image' => $url]);
                        $post->postMedia()->delete();
                        $post->postMedia()->create([
                            'file_type' => 'image',
                            'file_path' => $url,
                            'is_cover'  => true,
                            'sort_order' => 0
                        ]);
                    }
                }
            });

            return $this->sendResponse(
                new PostResource($post->load(['postMedia', 'user', 'category'])), 
                'Obra actualizada.'
            );

        } catch (\Exception $e) {
            return $this->sendError('Error al actualizar: ' . $e->getMessage(), [], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        if ($post->user_id !== $request->user()->id) {
            return $this->sendError('Acción no autorizada.', [], 403);
        }
        $post->delete();
        return $this->sendResponse([], 'Obra eliminada.');
    }
}