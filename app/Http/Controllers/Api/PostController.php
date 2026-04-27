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

        // 🛡️ SEGMENTACIÓN DE DATOS (Prioridad de Filtros)
        if ($request->has('my_posts') && $user) {
            // Caso 1: Dashboard del Artista (Mis Obras)
            $query->where('user_id', $user->id);
            $stats = \App\Models\UserStatistic::where('user_id', $user->id)->first();
            $kpis = [
                'total_works'     => Post::where('user_id', $user->id)->count(),
                'featured_works'  => Post::where('user_id', $user->id)->where('is_featured', true)->count(),
                'community_reach' => $stats ? (int) $stats->follower_count : 0
            ];
        } 
        else if ($request->has('user_id')) {
            // 🔥 Caso 2: Perfil Público de Artista (Resolución del problema)
            $query->where('user_id', $request->user_id)->where('status', 'published');
        } 
        else {
            // Caso 3: Vista Explorar Global
            $query->where('status', 'published');
        }

        // Filtros Dinámicos (Se mantienen intactos)
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
        $post = DB::transaction(function () use ($request) {
            $newPost = Post::create([
                'user_id'         => $request->user()->id,
                'category_id'     => $request->category_id,
                'content_type_id' => $request->content_type_id,
                'title'           => $request->title,
                'slug'            => Str::slug($request->title) . '-' . uniqid(),
                'excerpt'         => $request->excerpt,
                'content'         => $request->content,
                'status'          => $request->input('status', 'published'),
                'is_featured'     => $request->input('is_featured', false),
                'published_at'    => $request->input('status') === 'published' ? now() : null,
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    $url = $this->uploadImageToCloud($file, 'popayan/posts');
                    $newPost->postMedia()->create([
                        'file_type'  => 'image',
                        'file_path'  => $url,
                        'file_name'  => $file->getClientOriginalName(),
                        'is_cover'   => $index === 0,
                        'sort_order' => $index
                    ]);
                }
            }
            return $newPost;
        });

        return $this->sendResponse(new PostResource($post->load(['postMedia', 'user', 'contentType', 'category'])), 'Obra forjada en la galería.', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $post = Post::with(['postMedia', 'user', 'contentType', 'category', 'comments.user'])->withCount('reactions')->find($id);
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
        $post = Post::findOrFail($id);
        if ($post->user_id !== $request->user()->id) return $this->sendError('No autorizado.', [], 403);

        $post->update($request->validated());
        if ($request->hasFile('images')) {
            $post->postMedia()->delete();
            foreach ($request->file('images') as $index => $file) {
                $url = $this->uploadImageToCloud($file, 'popayan/posts');
                $post->postMedia()->create([
                    'file_type'  => 'image',
                    'file_path'  => $url,
                    'file_name'  => $file->getClientOriginalName(),
                    'is_cover'   => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }
        return $this->sendResponse(new PostResource($post->load(['postMedia', 'user', 'contentType', 'category'])), 'Obra refinada.');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        if ($post->user_id !== $request->user()->id) return $this->sendError('Acción no autorizada.', [], 403);
        $post->delete();
        return $this->sendResponse([], 'Obra enviada al archivo.');
    }
}